const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Callable function to delete a user's Auth account
// Only allows admins (we verify the caller's role from Firestore)
exports.deleteUserAuth = onCall(async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "El usuario no está autenticado."
        );
    }

    const callerUid = request.auth.uid;
    const targetUid = request.data.uid;

    if (!targetUid) {
        throw new HttpsError(
            "invalid-argument",
            "Se requiere el UID del usuario a eliminar."
        );
    }

    try {
        // 2. Verify caller is an admin
        const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
        if (!callerDoc.exists) {
            throw new HttpsError("permission-denied", "Usuario llamante no encontrado.");
        }

        const callerRole = callerDoc.data().role;
        // Super admin email/username check just in case, plus role check
        const isSuperAdmin = (callerDoc.data().username === 'admin' || callerDoc.data().email === 'admin@te.org');

        if (callerRole !== "admin" && !isSuperAdmin) {
            throw new HttpsError(
                "permission-denied",
                "Solo los administradores pueden eliminar usuarios."
            );
        }

        // 3. Prevent self-deletion and super-admin deletion
        if (callerUid === targetUid) {
            throw new HttpsError("permission-denied", "No puedes eliminar tu propia cuenta a través de este método.");
        }

        const targetDoc = await admin.firestore().collection("users").doc(targetUid).get();
        if (targetDoc.exists) {
            const targetData = targetDoc.data();
            if (targetData.username === 'admin' || targetData.email === 'admin@te.org') {
                throw new HttpsError("permission-denied", "No se puede eliminar al Super Administrador.");
            }
        }

        // 4. Delete the Auth user
        await admin.auth().deleteUser(targetUid);

        // 5. Delete the Firestore document (so frontend doesn't have to do it separately)
        await admin.firestore().collection("users").doc(targetUid).delete();

        return { success: true, message: "Usuario eliminado correctamente de Firebase Auth y Firestore." };

    } catch (error) {
        console.error("Error eliminando usuario:", error);
        throw new HttpsError("internal", error.message);
    }
});

// Callable function to update a user's Auth email
// Only allows admins
exports.updateUserEmailAuth = onCall(async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    const callerUid = request.auth.uid;
    const { uid, newEmail } = request.data;

    if (!uid || !newEmail) {
        throw new HttpsError("invalid-argument", "Se requiere el UID y el nuevo email.");
    }

    try {
        // 2. Verify caller is an admin
        const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
        if (!callerDoc.exists) {
            throw new HttpsError("permission-denied", "Usuario llamante no encontrado.");
        }

        const callerRole = callerDoc.data().role;
        const isSuperAdmin = (callerDoc.data().username === 'admin' || callerDoc.data().email === 'admin@te.org');

        if (callerRole !== "admin" && !isSuperAdmin) {
            throw new HttpsError("permission-denied", "Solo los administradores pueden modificar correos.");
        }

        // 3. Update the Auth user
        await admin.auth().updateUser(uid, { email: newEmail });

        return { success: true, message: "Email actualizado correctamente en Firebase Auth." };
    } catch (error) {
        console.error("Error actualizando email del usuario:", error);
        throw new HttpsError("internal", error.message);
    }
});

// Callable function to resolve a username to their real auth email
// Publicly accessible (no auth required) so users can login
exports.resolveEmailForLogin = onCall(async (request) => {
    const { username } = request.data;

    if (!username) {
        throw new HttpsError("invalid-argument", "Se requiere el nombre de usuario.");
    }

    try {
        // Query Firestore for the user by exactly matching 'username'
        const usersSnapshot = await admin.firestore().collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            // If user doesn't exist, we just return the @te.org fallback, 
            // so Firebase Auth can throw the standard "user not found" when they try to login.
            return { email: `${username}@te.org` };
        }

        const userData = usersSnapshot.docs[0].data();

        // Return their realEmail if it exists and is not empty, otherwise return username@te.org
        const authEmail = (userData.realEmail && userData.realEmail.trim() !== '')
            ? userData.realEmail
            : `${username}@te.org`;

        return { email: authEmail };

    } catch (error) {
        console.error("Error resolviendo email:", error);
        throw new HttpsError("internal", "Error al buscar el usuario.");
    }
});


