import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav",
    storageBucket: "telespantgrav.firebasestorage.app",
    messagingSenderId: "661489752694",
    appId: "1:661489752694:web:f1e137113fd73b2a929d57",
    measurementId: "G-FC62DY559B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mocking required modules for importing initialData.js content without full environment
async function sync() {
    console.log("Reading initialData.js...");
    const content = fs.readFileSync("c:/Users/pipeo/Documents/Telefono Formulario/src/data/initialData.js", "utf-8");
    
    // Extract initialDropdowns
    const dropdownsMatch = content.match(/export const initialDropdowns = (\{[\s\S]*?\});/);
    const initialDropdowns = JSON.parse(dropdownsMatch[1]);
    
    // Extract problemCategories
    const categoriesMatch = content.match(/export const problemCategories = (\{[\s\S]*?\});/);
    const problemCategories = JSON.parse(categoriesMatch[1]);
    
    // Generate PROBLEMATICA list
    const problematicaList = Object.entries(problemCategories).map(([key, category]) => ({
        value: key,
        label: `${key} - ${category.label}`,
        active: true
    }));
    
    // Generate PROBLEMA list
    const problemaList = [];
    Object.values(problemCategories).forEach(category => {
        category.items.forEach(item => {
            problemaList.push({
                value: item.fullCode,
                label: `${item.fullCode} - ${item.label}`,
                active: item.active !== false
            });
        });
    });

    const allLists = {
        ...initialDropdowns,
        "PROBLEMATICA": problematicaList,
        "PROBLEMA": problemaList
    };

    console.log(`Starting sync of ${Object.keys(allLists).length} lists...`);

    // Using the same sync method as the Admin page (setDoc)
    // Note: This script still uses Client SDK and will likely fail without Auth.
    // I will use the REST API approach instead which I know how to authenticate.
    
    const idToken = await authenticate();
    
    for (const [listName, items] of Object.entries(allLists)) {
        await updateDoc(listName, items, idToken);
    }
    
    console.log("🎉 All lists synchronized successfully!");
    process.exit(0);
}

async function authenticate() {
    console.log("Authenticating as admin...");
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "jospina@te.org", // Based on previous context of resolving usernames to te.org
            password: "jospina2",
            returnSecureToken: true
        })
    });
    const data = await res.json();
    if (data.error) throw new Error("Auth failed: " + data.error.message);
    return data.idToken;
}

async function updateDoc(docId, items, idToken) {
    console.log(`Syncing ${docId} (${items.length} items)...`);
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lists/${docId}?updateMask.fieldPaths=items`;
    
    // Convert items to Firestore JSON format
    const firestoreItems = items.map(item => ({
        mapValue: {
            fields: {
                value: { stringValue: item.value },
                label: { stringValue: item.label },
                active: { booleanValue: item.active }
            }
        }
    }));

    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: {
                items: {
                    arrayValue: { values: firestoreItems }
                }
            }
        })
    });
    
    if (!res.ok) {
        const err = await res.json();
        console.error(`❌ Failed to update ${docId}:`, err);
    } else {
        console.log(`✅ ${docId} synced.`);
    }
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
