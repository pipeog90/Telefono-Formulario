const admin = require("c:/Users/pipeo/Documents/Telefono Formulario/functions/node_modules/firebase-admin");
const fs = require("fs");

// Attempt to use default credentials (might work if firebase CLI is logged in)
try {
    admin.initializeApp({
        projectId: "telespantgrav"
    });
} catch (e) {
    console.log("Default init failed, trying with local config...");
}

const db = admin.firestore();

async function sync() {
    console.log("Reading initialData.js...");
    const content = fs.readFileSync("c:/Users/pipeo/Documents/Telefono Formulario/src/data/initialData.js", "utf-8");
    const match = content.match(/export const problemCategories = (\{[\s\S]*?\});/);
    const problemCategories = JSON.parse(match[1]);

    const problematicaList = Object.entries(problemCategories).map(([key, category]) => ({
        value: key,
        label: `${key} - ${category.label}`,
        active: true
    }));

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

    console.log("Updating Firestore...");
    await db.collection("lists").doc("PROBLEMATICA").set({ items: problematicaList });
    await db.collection("lists").doc("PROBLEMA").set({ items: problemaList });
    
    console.log("✅ Synchronization complete!");
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
