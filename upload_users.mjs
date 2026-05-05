import fs from "fs";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav"
};

const jsonPath = "c:/Users/pipeo/Documents/Telefono Formulario/orientadores_data.json";

async function authenticate() {
    console.log("Authenticating with provided credentials (pipeog90@gmail.com)...");
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

function getFirestoreValue(val) {
    if (typeof val === 'boolean') {
        return { booleanValue: val };
    }
    if (typeof val === 'number') {
        return { doubleValue: val };
    }
    return { stringValue: String(val) };
}

async function uploadUsers() {
    const content = fs.readFileSync(jsonPath, "utf-8");
    const usersData = JSON.parse(content);
    
    console.log(`Found ${usersData.length} users. Attempting login...`);
    let idToken;
    try {
        idToken = await authenticate();
        console.log("✅ Authentication successful!");
    } catch(err) {
        console.error("❌ Authentication failed:", err.message);
        return;
    }

    let successCount = 0;
    for (let i = 0; i < usersData.length; i++) {
        const user = usersData[i];
        const docId = user["Código_Orientador"] || `MEO_AUTO_${Date.now()}_${i}`;
        
        const fields = {};
        for (const [key, val] of Object.entries(user)) {
            fields[key] = getFirestoreValue(val);
        }

        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${docId}`;
        
        const res = await fetch(url, {
            method: "PATCH", // PATCH with no updateMask will create or overwrite
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
                "Referer": "https://telespantgrav.web.app/"
            },
            body: JSON.stringify({ fields })
        });

        if (!res.ok) {
            const err = await res.json();
            console.error(`❌ Failed to upload user ${docId}:`, err);
        } else {
            successCount++;
        }
    }

    console.log(`\n🎉 Successfully uploaded ${successCount}/${usersData.length} users to Firestore!`);
}

uploadUsers().catch(console.error);
