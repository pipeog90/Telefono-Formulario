import fs from "fs";

const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav"
};

async function authenticate() {
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
        return { integerValue: val };
    }
    if (val === null || val === undefined) {
        return { nullValue: null };
    }
    return { stringValue: String(val) };
}

async function generateMeos() {
    console.log("Authenticating...");
    let idToken;
    try {
        idToken = await authenticate();
    } catch(err) {
        console.error("❌ Authentication failed:", err.message);
        return;
    }

    console.log("Starting generation...");
    for (let i = 100; i <= 125; i++) {
        const docId = `placeholder_meo_${i}`; // uid will be placeholder
        const user = {
            Código_Orientador: `MEO${i}`,
            name: `(Placeholder MEO${i})`,
            username: `meo_${i}`,
            role: 'user',
            active: false
        };

        const fields = {};
        for (const [key, val] of Object.entries(user)) {
            fields[key] = getFirestoreValue(val);
        }

        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${docId}`;
        
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
                "Referer": "https://telespantgrav.web.app/"
            },
            body: JSON.stringify({ fields })
        });

        if (!res.ok) {
            console.error(`❌ Failed MEO${i}`);
        } else {
            console.log(`✅ Generated MEO${i}`);
        }
    }
    console.log("Done!");
}

generateMeos().catch(console.error);
