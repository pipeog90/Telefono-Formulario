const admin = require("firebase-admin");
admin.initializeApp();

async function migrateCalls() {
    console.log("Starting calls migration...");
    const db = admin.firestore();
    const callsSnap = await db.collection("calls").get();
    
    let toMigrate = [];
    callsSnap.forEach(snap => {
        const data = snap.data();
        const currentId = snap.id;
        const targetId = data.L_ID_Llamada;
        
        if (targetId && currentId !== targetId) {
            toMigrate.push({ currentId, targetId, data });
        }
    });

    console.log(`Found ${toMigrate.length} calls to migrate.`);
    
    const batch = db.batch();
    
    for (let i = 0; i < toMigrate.length; i++) {
        const { currentId, targetId, data } = toMigrate[i];
        
        console.log(`Migrating ${currentId} -> ${targetId}`);
        
        const newRef = db.collection("calls").doc(targetId);
        const oldRef = db.collection("calls").doc(currentId);
        
        batch.set(newRef, data);
        batch.delete(oldRef);
        
        if ((i + 1) % 200 === 0) {
            await batch.commit();
            console.log(`Committed ${i + 1} migrations...`);
        }
    }
    
    if (toMigrate.length % 200 !== 0) {
        await batch.commit();
    }
    
    console.log("Migration completed successfully!");
    process.exit(0);
}

migrateCalls().catch(err => {
    console.error(err);
    process.exit(1);
});
