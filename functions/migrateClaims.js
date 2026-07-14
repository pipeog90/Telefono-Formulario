const admin = require("firebase-admin");

admin.initializeApp();

async function setClaims() {
    console.log("Fetching all users from Firestore...");
    const usersSnapshot = await admin.firestore().collection("users").get();
    
    let updated = 0;
    
    for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        const role = data.role || "orientador";
        const isSuperAdmin = (data.username === 'admin' || data.email === 'admin@te.org');
        
        const claimRole = isSuperAdmin ? 'admin' : role;
        
        try {
            await admin.auth().setCustomUserClaims(doc.id, { role: claimRole });
            console.log(`Set role '${claimRole}' for user ${doc.id} (${data.username})`);
            updated++;
        } catch (error) {
            console.error(`Error setting claims for ${doc.id}:`, error.message);
        }
    }
    
    console.log(`Finished updating claims for ${updated} users.`);
}

setClaims().catch(console.error);
