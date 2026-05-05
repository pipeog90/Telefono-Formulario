import fs from "fs";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav"
};

async function authenticate() {
    console.log("Authenticating...");
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Referer": "https://telespantgrav.web.app/"
        },
        body: JSON.stringify({
            email: "pipeog90@gmail.com",
            password: "jospina2",
            returnSecureToken: true
        })
    });
    const data = await res.json();
    if (data.error) throw new Error("Auth failed: " + data.error.message);
    return data.idToken;
}

async function cleanupUsers() {
    let idToken;
    try {
        idToken = await authenticate();
        console.log("✅ Authentication successful!");
    } catch(err) {
        console.error("❌ Authentication failed:", err.message);
        return;
    }

    console.log("Fetching all users...");
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users?pageSize=300`;
    
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${idToken}`,
            "Referer": "https://telespantgrav.web.app/"
        }
    });

    const data = await res.json();
    if (!data.documents) {
        console.log("No users found or error:", data);
        return;
    }

    const users = data.documents;
    console.log(`Fetched ${users.length} users.`);

    const meoMap = new Map();
    const duplicates = [];

    users.forEach(doc => {
        // Find Código_Orientador field
        const fields = doc.fields || {};
        let cod = null;
        if (fields.Código_Orientador && fields.Código_Orientador.stringValue) {
            cod = fields.Código_Orientador.stringValue;
        }

        if (cod && cod.startsWith('MEO')) {
            if (meoMap.has(cod)) {
                // Determine which one to keep. Let's keep the one that we already have in map, and push the current one to duplicates.
                // We'll extract the uid from doc.name
                const uid = doc.name.split('/').pop();
                duplicates.push(uid);
            } else {
                meoMap.set(cod, doc.name);
            }
        }
    });

    console.log(`Found ${duplicates.length} duplicate user documents.`);

    for (const uid of duplicates) {
        console.log(`Deleting user with UID: ${uid}...`);
        
        // Delete Firestore document
        const delUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
        const delRes = await fetch(delUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Referer": "https://telespantgrav.web.app/"
            }
        });
        
        if (!delRes.ok) {
            console.error(`❌ Failed to delete Firestore doc for ${uid}`);
        } else {
            console.log(`✅ Deleted Firestore doc for ${uid}`);
        }

        // Call Cloud Function to delete Auth user
        try {
            const cfUrl = `https://us-central1-telespantgrav.cloudfunctions.net/deleteUserAuth`;
            const cfRes = await fetch(cfUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ data: { uid } })
            });

            if (!cfRes.ok) {
                 const text = await cfRes.text();
                 console.error(`❌ Failed to delete Auth user for ${uid}:`, text);
            } else {
                 console.log(`✅ Deleted Auth user for ${uid}`);
            }
        } catch (e) {
            console.error(`❌ Error calling Cloud Function for ${uid}:`, e);
        }
    }

    console.log("Cleanup complete!");
}

cleanupUsers().catch(console.error);
