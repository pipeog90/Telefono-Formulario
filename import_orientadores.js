const admin = require("./functions/node_modules/firebase-admin");
const fs = require("fs");
const path = require("path");

// Attempt to initialize firebase-admin using default config
try {
    admin.initializeApp({
        projectId: "telespantgrav"
    });
} catch (e) {
    console.log("Default init failed, trying with local config...", e);
}

const db = admin.firestore();
const jsonPath = path.join(__dirname, "orientadores_data.json");

async function importOrientadores() {
    console.log("Reading orientadores_data.json...");
    let usersData;
    try {
        const content = fs.readFileSync(jsonPath, "utf-8");
        usersData = JSON.parse(content);
    } catch (error) {
        console.error("Failed to read JSON file. Make sure dump_users.py ran successfully.", error);
        process.exit(1);
    }

    console.log(`Found ${usersData.length} users. Starting migration to Firestore...`);

    const batch = db.batch();
    const usersCollection = db.collection("users"); // Assuming 'users' is the collection name

    let count = 0;
    for (const user of usersData) {
        // Use Código_Orientador as the document ID if possible, else auto-generate
        const docId = user["Código_Orientador"] || `MEO_AUTO_${Date.now()}_${count}`;
        
        // Remove empty strings to treat them as blank/non-existent if required, 
        // but user said "white spaces are considered blank so please let them blank is firebase".
        // We leave them as empty strings based on the previous python clean up.

        const userRef = usersCollection.doc(docId);
        
        // Assuming we just set the whole object
        batch.set(userRef, user, { merge: true });
        count++;
    }

    try {
        await batch.commit();
        console.log(`✅ Successfully imported/updated ${count} orientadores in Firestore!`);
    } catch (error) {
        console.error("❌ Error committing batch to Firestore:", error);
    }

    process.exit(0);
}

importOrientadores().catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
