import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// Firebase Configuration (from update-lists.mjs)
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

async function sync() {
    console.log("Reading initialData.js...");
    const content = fs.readFileSync("c:/Users/pipeo/Documents/Telefono Formulario/src/data/initialData.js", "utf-8");
    
    // Extract problemCategories using regex (since it's a large object)
    const match = content.match(/export const problemCategories = (\{[\s\S]*?\});/);
    if (!match) {
        console.error("Could not find problemCategories in initialData.js");
        return;
    }
    
    const problemCategories = JSON.parse(match[1]);
    
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
    
    console.log(`Syncing PROBLEMATICA (${problematicaList.length} items)...`);
    await setDoc(doc(db, "lists", "PROBLEMATICA"), { items: problematicaList });
    
    console.log(`Syncing PROBLEMA (${problemaList.length} items)...`);
    await setDoc(doc(db, "lists", "PROBLEMA"), { items: problemaList });
    
    console.log("✅ Success! Firestore lists updated.");
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
