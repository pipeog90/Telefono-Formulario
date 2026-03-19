/**
 * Mock Firebase Service
 * Simulates Firebase Authentication and Firestore using localStorage.
 */

const STORAGE_KEYS = {
    USERS: 'angel_phone_users',
    CURRENT_USER: 'angel_phone_current_user',
    CALLS: 'angel_phone_calls',
    LISTS: 'angel_phone_lists'
};

// Initial Seed Data
const INITIAL_USERS = [
    { uid: 'admin123', email: 'admin', password: 'admin', role: 'admin', name: 'Administrador Principal' },
    { uid: 'user123', email: 'user', password: 'user', role: 'user', name: 'Orientador Voluntario' }
];

const INITIAL_LISTS = {
    'Medio de contacto': [
        { value: '1', label: 'Teléfono', active: true },
        { value: '2', label: 'WhatsApp', active: true },
        { value: '3', label: 'Sede', active: true },
        { value: '4', label: 'Correo Electrónico', active: true }
    ],
    'Sexo': [
        { value: '1', label: 'Masculino', active: true },
        { value: '2', label: 'Femenino', active: true },
        { value: '3', label: 'Otro', active: true }
    ],
    'Rango de Edad': [
        { value: '1', label: '0-12 Niñez', active: true },
        { value: '2', label: '13-17 Adolescencia', active: true },
        { value: '3', label: '18-26 Juventud', active: true },
        { value: '4', label: '27-59 Adultez', active: true },
        { value: '5', label: '60+ Vejez', active: true }
    ],
    'Estado Civil': [
        { value: '1', label: 'Soltero/a', active: true },
        { value: '2', label: 'Casado/a', active: true },
        { value: '3', label: 'Unión Libre', active: true },
        { value: '4', label: 'Separado/a', active: true },
        { value: '5', label: 'Divorciado/a', active: true },
        { value: '6', label: 'Viudo/a', active: true }
    ],
    'Nivel Educativo': [
        { value: '1', label: 'Primaria', active: true },
        { value: '2', label: 'Bachillerato', active: true },
        { value: '3', label: 'Técnico/Tecnológico', active: true },
        { value: '4', label: 'Universitario', active: true },
        { value: '5', label: 'Posgrado', active: true },
        { value: '6', label: 'Ninguno', active: true }
    ],
    'Problemática': [
        { value: '100', label: 'Salud Mental', active: true },
        { value: '200', label: 'Violencia', active: true },
        { value: '300', label: 'Relaciones Familiares', active: true },
        { value: '400', label: 'Crisis', active: true }
    ],
    'Problema': [
        // Salud Mental (100)
        { value: '101', label: 'Depresión', parentId: '100', active: true },
        { value: '102', label: 'Ansiedad', parentId: '100', active: true },
        { value: '103', label: 'Ideación Suicida', parentId: '100', active: true },
        { value: '104', label: 'Trastorno Bipolar', parentId: '100', active: true },
        // Violencia (200)
        { value: '201', label: 'Violencia Intrafamiliar', parentId: '200', active: true },
        { value: '202', label: 'Violencia de Género', parentId: '200', active: true },
        { value: '203', label: 'Abuso Sexual', parentId: '200', active: true },
        // Relaciones Familiares (300)
        { value: '301', label: 'Conflicto de Pareja', parentId: '300', active: true },
        { value: '302', label: 'Conflicto Padres/Hijos', parentId: '300', active: true },
        // Crisis (400)
        { value: '401', label: 'Duelo', parentId: '400', active: true },
        { value: '402', label: 'Crisis Económica', parentId: '400', active: true },
        { value: '403', label: 'Soledad', parentId: '400', active: true }
    ],
    'Municipio': [
        { value: '1', label: 'Medellín', active: true },
        { value: '2', label: 'Bello', active: true },
        { value: '3', label: 'Envigado', active: true },
        { value: '4', label: 'Itagüí', active: true },
        { value: '5', label: 'Sabaneta', active: true }
    ]
};

class MockAuth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
        this._initUsers();
    }

    _initUsers() {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
    }

    async signInWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    this.currentUser = userWithoutPassword;
                    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
                    resolve({ user: userWithoutPassword });
                } else {
                    reject({ code: 'auth/invalid-credential', message: 'Usuario o contraseña incorrectos.' });
                }
            }, 800); // Simulate network delay
        });
    }

    async signOut() {
        return new Promise((resolve) => {
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            resolve();
        });
    }

    onAuthStateChanged(callback) {
        callback(this.currentUser);
        return () => { };
    }

    // User Management (Admin)
    async getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    async createUser(userData) {
        const users = await this.getUsers();
        if (users.find(u => u.email === userData.email)) {
            throw new Error("El usuario ya existe.");
        }
        const newUser = { ...userData, uid: Date.now().toString() };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    }

    async deleteUser(uid) {
        let users = await this.getUsers();
        users = users.filter(u => u.uid !== uid);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    async updateUser(uid, updates) {
        let users = await this.getUsers();
        const index = users.findIndex(u => u.uid === uid);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        throw new Error("Usuario no encontrado.");
    }

    async changePassword(email, oldPassword, newPassword) {
        let users = await this.getUsers();
        const index = users.findIndex(u => u.email === email);

        if (index === -1) {
            throw new Error("Usuario no encontrado.");
        }

        if (users[index].password !== oldPassword) {
            throw new Error("La contraseña actual es incorrecta.");
        }

        users[index].password = newPassword;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return true;
    }
}

class MockFirestore {
    constructor() {
        this._initLists();
    }

    _initLists() {
        if (!localStorage.getItem(STORAGE_KEYS.LISTS)) {
            localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(INITIAL_LISTS));
        }
    }

    async getLists() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTS));
    }

    // Generic add for collections
    async add(collectionName, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const key = collectionName === 'calls' ? STORAGE_KEYS.CALLS : `angel_phone_${collectionName}`;
                const items = JSON.parse(localStorage.getItem(key)) || [];
                const newItem = {
                    id: Date.now().toString(),
                    ...data
                };
                items.push(newItem);
                localStorage.setItem(key, JSON.stringify(items));
                resolve({ id: newItem.id, ...newItem });
            }, 500);
        });
    }

    // Legacy support if needed, but we'll use generic add
    async addCall(callData) {
        return this.add('calls', { ...callData, timestamp: new Date().toISOString() });
    }

    async getCalls() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CALLS)) || [];
    }

    async deleteCall(id) {
        let calls = await this.getCalls();
        calls = calls.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
    }

    async clearCalls() {
        localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify([]));
    }
}

export const auth = new MockAuth();
export const db = new MockFirestore();

// Firestore SDK Shims
export const collection = (db, path) => path;
export const doc = (db, path, id) => ({ path, id });
export const addDoc = async (collectionRef, data) => {
    return await db.add(collectionRef, data);
};
export const setDoc = async (docRef, data) => {
    // Mock setDoc implementation
    const collectionName = docRef.path; // Assuming path is collection name for simplicity in mock
    const key = collectionName === 'lists' ? STORAGE_KEYS.LISTS : `angel_phone_${collectionName}`;

    // Special handling for 'lists' which is a single object in our mock
    if (collectionName === 'lists') {
        const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTS)) || {};
        lists[docRef.id] = data.items || data; // Handle {items: []} structure
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
        return;
    }

    // Generic setDoc
    // This is a simplified mock. In real Firestore, docRef would be collection/id
};
export const getDocs = async (collectionRef) => {
    if (collectionRef === 'lists') {
        const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTS)) || {};
        const docs = Object.entries(lists).map(([key, value]) => ({
            id: key,
            data: () => ({ items: value })
        }));
        return {
            empty: docs.length === 0,
            forEach: (cb) => docs.forEach(cb)
        };
    }
    return { empty: true, forEach: () => { } };
};

export const Timestamp = {
    now: () => new Date().toISOString()
};
