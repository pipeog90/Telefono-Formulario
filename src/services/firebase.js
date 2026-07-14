import { initializeApp, getApp, deleteApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    deleteUser as firebaseDeleteUser,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    getDoc,
    query,
    where,
    Timestamp,
    onSnapshot,
    runTransaction
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav",
    storageBucket: "telespantgrav.firebasestorage.app",
    messagingSenderId: "661489752694",
    appId: "1:661489752694:web:f1e137113fd73b2a929d57",
    measurementId: "G-FC62DY559B"
};

// --- Initialization ---
const app = initializeApp(firebaseConfig);
const authInstance = getAuth(app);
// Set persistence to session (logout when tab closes)
setPersistence(authInstance, browserSessionPersistence).catch((err) => {
    console.error("Auth persistence error:", err);
});
const dbInstance = getFirestore(app);
const functionsInstance = getFunctions(app);

// --- Auth Service ---
class AuthService {
    constructor() {
        // Current user is often managed by React state listeners, but we keep a reference if needed
    }

    onAuthStateChanged(callback) {
        return onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                // Fetch additional role data from Firestore 'users' collection
                try {
                    const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // Merge Auth user with Firestore data (role, name)
                        const mergedUser = { ...user, ...userData };
                        callback(mergedUser);
                    } else {
                        // Fallback if no firestore doc (shouldn't happen if created properly)
                        callback(user);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    callback(user);
                }
            } else {
                callback(null);
            }
        });
    }

    async signInWithEmailAndPassword(emailOrUsername, password) {
        try {
            // First we resolve the username into the actual Auth Email via Cloud Functions
            let finalEmail = emailOrUsername;

            // If it doesn't look like an email, it's a username we need to resolve
            if (!emailOrUsername.includes('@')) {
                const resolveEmail = httpsCallable(functionsInstance, 'resolveEmailForLogin');
                const response = await resolveEmail({ username: emailOrUsername });
                finalEmail = response.data.email;
            }

            const userCredential = await signInWithEmailAndPassword(authInstance, finalEmail, password);
            const user = userCredential.user;
            
            // Check if user is active
            const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
            if (userDoc.exists()) {
                if (userDoc.data().active === false) {
                    await firebaseSignOut(authInstance);
                    throw new Error("Su cuenta ha sido desactivada. Contacte al administrador.");
                }
            }

            return userCredential;
        } catch (error) {
            console.error("Login resolution or signin error: ", error);
            throw this._mapError(error);
        }
    }

    async signOut() {
        return firebaseSignOut(authInstance);
    }

    // --- User Management (Admin) ---
    // Note: Client-side SDK cannot list all users. We rely on the 'users' Firestore collection.

    async getUsers() {
        const querySnapshot = await getDocs(collection(dbInstance, "users"));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ uid: doc.id, ...doc.data() });
        });
        return users;
    }

    async createUser(userData) {
        // Creating a user in Firebase Auth automatically signs them in, which kicks out the Admin.
        // Solution: use a SECONDARY app instance so the admin session is untouched.

        // Reuse secondary app if it already exists (e.g. from a previous failed call)
        let secondaryApp;
        try {
            secondaryApp = getApp("Secondary");
        } catch (_) {
            secondaryApp = initializeApp(firebaseConfig, "Secondary");
        }
        const secondaryAuth = getAuth(secondaryApp);

        try {
            let { email, password, name, role } = userData;
            // Allow creation with simple username
            let authEmail = email;
            if (!email.includes('@')) {
                // If they provided a realEmail during creation, use it as the main Auth email!
                if (userData.realEmail && userData.realEmail.trim() !== '') {
                    authEmail = userData.realEmail;
                } else {
                    authEmail = `${email}@te.org`;
                }
            }

            // 1. Create in Auth (on secondary app to avoid kicking out Admin)
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, authEmail, password);
            const user = userCredential.user;

            // 2. Create in Firestore 'users' collection (using main app DB)
            await setDoc(doc(dbInstance, "users", user.uid), {
                email: email.includes('@') ? email : `${email}@te.org`,
                username: email.includes('@') ? email.split('@')[0] : email,
                name,
                role,
                realEmail: userData.realEmail || null,
                Clave: userData.Clave ? userData.Clave.toUpperCase() : null,
                Código_Orientador: userData.Código_Orientador || null,
                direccion: userData.direccion || null,
                centro: userData.centro || null,
                fecha_alta: userData.fecha_alta || null,
                fecha_baja: userData.fecha_baja || null,
                active: userData.active !== undefined ? userData.active : true,
                createdAt: new Date().toISOString()
            });

            return { uid: user.uid, ...userData, username: email.includes('@') ? email.split('@')[0] : email };

        } catch (error) {
            throw this._mapError(error);
        } finally {
            // Always clean up the secondary app so it can be re-created next time
            try { await deleteApp(secondaryApp); } catch (_) { }
        }
    }

    async resetPassword(email) {
        // Only send reset to real (non-fake) email addresses
        if (!email || email.endsWith('@te.org')) {
            throw { message: 'Este usuario no tiene un email real. Solo se puede enviar un enlace de recuperación a direcciones de correo válidas.', code: 'app/fake-email' };
        }
        try {
            await sendPasswordResetEmail(authInstance, email);
        } catch (error) {
            throw this._mapError(error);
        }
    }

    async resolveAndResetPassword(usernameOrEmail) {
        // 1. Resolve the username/email to the real auth email
        let finalEmail = usernameOrEmail;

        if (!usernameOrEmail.includes('@')) {
            const resolveEmail = httpsCallable(functionsInstance, 'resolveEmailForLogin');
            const response = await resolveEmail({ username: usernameOrEmail });
            finalEmail = response.data.email;
        }

        // 2. We don't verify if it's a fake @te.org or if it exists in the database.
        // Doing so would allow email enumeration attacks. We just attempt the password reset.
        if (finalEmail && !finalEmail.endsWith('@te.org')) {
            // 3. Send the reset email
            try {
                await sendPasswordResetEmail(authInstance, finalEmail);
            } catch (error) {
                // We ignore the error intentionally (including 'auth/user-not-found') 
                // to prevent email enumeration attacks. 
                // We could log it internally if needed.
            }
        }

        // Always succeed to the frontend
        return true;

    }

    async changePassword(email, oldPassword, newPassword) {
        // 1. Re-authenticate (Sign in) to verify old credentials
        // Use our own signIn to handle the "@te.org" logic
        try {
            const userCredential = await this.signInWithEmailAndPassword(email, oldPassword);
            const user = userCredential.user;

            // 2. Update Password
            await updatePassword(user, newPassword);

            // 3. Sign out (force user to log in again with new password)
            await this.signOut();
            return true;
        } catch (error) {
            throw this._mapError(error);
        }
    }

    async toggleUserStatus(uid, disabled) {
        try {
            // Use our secure Cloud Function to toggle the Auth account and Firestore doc
            const toggleUserStatusFn = httpsCallable(functionsInstance, 'toggleUserStatus');
            await toggleUserStatusFn({ uid, disabled });

            // If disabling the currently logged-in user, sign them out
            if (disabled && authInstance.currentUser && authInstance.currentUser.uid === uid) {
                await this.signOut();
            }
        } catch (error) {
            console.error("Error from Cloud Function toggleUserStatus:", error);
            throw this._mapError(error);
        }
    }

    async updateUser(uid, updates) {
        try {
            const userRef = doc(dbInstance, "users", uid);
            // We need to know previous/current data to construct the fallback if realEmail is cleared
            const userDoc = await getDoc(userRef);
            const currentData = userDoc.exists() ? userDoc.data() : {};
            const username = currentData.username;

            // Exclude password – passwords are managed via Firebase Auth reset email
            const { password, ...safeUpdates } = updates;
            await updateDoc(userRef, safeUpdates);

            // If admin changed the realEmail (and it's actually different), we MUST sync it with the hidden Firebase Auth account.
            // IMPORTANT: Only do this when `uid` is a real Firebase Auth UID (28-char alphanumeric).
            // Legacy users have Firestore doc IDs like "MEO127" — passing those to the Cloud Function
            // causes an invalid-argument error because Firebase Auth doesn't know that ID.
            const isRealAuthUid = /^[A-Za-z0-9]{20,}$/.test(uid) && !uid.startsWith('MEO');
            if (isRealAuthUid && safeUpdates.hasOwnProperty('realEmail') && safeUpdates.realEmail !== currentData.realEmail) {
                const newAuthEmail = (safeUpdates.realEmail && safeUpdates.realEmail.trim() !== '')
                    ? safeUpdates.realEmail.trim()
                    : `${username}@te.org`;
                const updateUserEmailAuth = httpsCallable(functionsInstance, 'updateUserEmailAuth');
                await updateUserEmailAuth({ uid, newEmail: newAuthEmail });
            }

            return { uid, ...safeUpdates };
        } catch (error) {
            console.error("Error from Cloud Function updateUser:", error);
            throw this._mapError(error);
        }
    }

    _mapError(error) {
        console.error("Auth Error:", error.code, error.message);
        let message = `Ocurrió un error desconocido (${error.code || 'sin código'}). Intente nuevamente.`;

        switch (error.code) {
            case 'auth/invalid-email':
                message = "El formato del usuario no es válido.";
                break;
            case 'auth/user-disabled':
                message = "Esta cuenta ha sido deshabilitada.";
                break;
            case 'auth/user-not-found':
                message = "No existe una cuenta con este usuario.";
                break;
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = "Contraseña incorrecta o credenciales no válidas.";
                break;
            case 'auth/email-already-in-use':
                message = "Este usuario (login) ya está registrado. Elija otro.";
                break;
            case 'auth/weak-password':
                message = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
                break;
            case 'auth/network-request-failed':
                message = "Error de conexión. Verifique su internet.";
                break;
            case 'auth/too-many-requests':
                message = "Demasiados intentos fallidos. Intente más tarde.";
                break;
            case 'auth/operation-not-allowed':
                message = "La creación de usuarios no está habilitada en Firebase. Contacte al administrador del sistema.";
                break;
        }
        return { message, code: error.code, original: error };
    }
}

// --- Firestore Service ---
class DataService {
    async getLists() {
        const querySnapshot = await getDocs(collection(dbInstance, "lists"));
        const lists = {};
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            lists[docSnap.id] = data.items || [];
        });
        return lists;
    }

    subscribeToLists(callback, onError) {
        return onSnapshot(collection(dbInstance, "lists"), (querySnapshot) => {
            const lists = {};
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                lists[docSnap.id] = data.items || [];
            });
            callback(lists);
        }, (error) => {
            console.error("Firestore subscription error in lists:", error);
            if (onError) onError(error);
        });
    }

    async updateList(listName, items) {
        await setDoc(doc(dbInstance, "lists", listName), { items });
    }

    async getCalls(filters = {}) {
        try {
            const getCallsFromBigQuery = httpsCallable(functionsInstance, 'getCallsFromBigQuery');
            const response = await getCallsFromBigQuery(filters);
            return response.data.calls;
        } catch (error) {
            console.error("Error calling BigQuery function:", error.code, error.message);
            // Fallback to Firestore if BigQuery function fails
            const querySnapshot = await getDocs(collection(dbInstance, "calls"));
            const calls = [];
            querySnapshot.forEach((doc) => {
                calls.push({ id: doc.id, ...doc.data() });
            });
            return calls;
        }
    }

    async addCall(callData) {
        const counterRef = doc(dbInstance, "counters", "calls");

        return runTransaction(dbInstance, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let nextId = 1;
            
            if (counterDoc.exists()) {
                const data = counterDoc.data();
                if (data.nextId) nextId = data.nextId;
            }

            // Calculate dynamic prefix based on the current year
            const currentYear = new Date().getFullYear();
            const offset = currentYear - 2026;
            const index = 10 + Math.max(0, offset); // 10 is 'AK'
            
            const firstLetter = String.fromCharCode(65 + Math.floor(index / 26)); // 65 is 'A'
            const secondLetter = String.fromCharCode(65 + (index % 26));
            const prefix = `${firstLetter}${secondLetter}`;

            // Generate padded ID, e.g. AK0001
            const formattedId = `${prefix}${String(nextId).padStart(4, '0')}`;

            const callWithId = {
                ...callData,
                L_ID_Llamada: formattedId,
                createdAt: Timestamp.now()
            };

            const newCallRef = doc(collection(dbInstance, "calls"));
            transaction.set(newCallRef, callWithId);
            transaction.set(counterRef, { nextId: nextId + 1 }, { merge: true });

            return { id: newCallRef.id, L_ID_Llamada: formattedId, ...callData };
        });
    }

    async deleteCall(id) {
        await deleteDoc(doc(dbInstance, "calls", id));
    }

    async clearCalls() {
        // Batch delete simulation (Firestore client requires loop)
        const calls = await this.getCalls();
        const promises = calls.map(c => deleteDoc(doc(dbInstance, "calls", c.id)));
        await Promise.all(promises);
    }

    async migratePreProductionCalls() {
        const migrateCallable = httpsCallable(functionsInstance, 'migratePreProductionCalls');
        const result = await migrateCallable();
        return result.data;
    }
}

export const auth = new AuthService();
export const db = new DataService();
export const firestore = dbInstance; // Export raw instance for direct SDK usage

// Export SDK functions for direct usage if needed
export { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, Timestamp, onSnapshot };
