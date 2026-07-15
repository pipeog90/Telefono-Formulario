const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { BigQuery } = require("@google-cloud/bigquery");

admin.initializeApp();

// Callable function to toggle a user's active status (disable/enable)
// Only allows admins (we verify the caller's role from Firestore)
exports.toggleUserStatus = onCall({ enforceAppCheck: true }, async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "El usuario no está autenticado."
        );
    }

    const callerUid = request.auth.uid;
    const targetUid = request.data.uid;
    const disabled = request.data.disabled;

    if (!targetUid || typeof disabled !== 'boolean') {
        throw new HttpsError(
            "invalid-argument",
            "Se requiere el UID del usuario y el estado disabled (booleano)."
        );
    }

    try {
        // 2. Verify caller is an admin using Custom Auth Claims
        const callerRole = request.auth.token.role;
        const isSuperAdmin = request.auth.token.email === 'admin@te.org';

        if (callerRole !== "admin" && !isSuperAdmin) {
            throw new HttpsError(
                "permission-denied",
                "Solo los administradores pueden cambiar el estado de los usuarios."
            );
        }

        // 3. Prevent self-disabling and super-admin disabling
        if (callerUid === targetUid) {
            throw new HttpsError("permission-denied", "No puedes cambiar el estado de tu propia cuenta.");
        }

        const targetDoc = await admin.firestore().collection("users").doc(targetUid).get();
        if (targetDoc.exists) {
            const targetData = targetDoc.data();
            if (targetData.username === 'admin' || targetData.email === 'admin@te.org') {
                throw new HttpsError("permission-denied", "No se puede cambiar el estado del Super Administrador.");
            }
        }

        // 4. Update the Auth user (if they exist)
        try {
            await admin.auth().updateUser(targetUid, { disabled: disabled });
        } catch (authError) {
            if (authError.code !== 'auth/user-not-found') {
                throw authError; // Rethrow if it's not the user-not-found error
            }
            // If user-not-found, we gracefully continue to update Firestore (old users)
        }

        // 5. Update the Firestore document
        await admin.firestore().collection("users").doc(targetUid).update({ disabled: disabled });

        return { success: true, message: "Estado de usuario actualizado correctamente." };

    } catch (error) {
        console.error("Error cambiando estado de usuario:", error);
        throw new HttpsError("internal", error.message);
    }
});

// Callable function to update a user's Auth email
// Only allows admins
exports.updateUserEmailAuth = onCall({ enforceAppCheck: true }, async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    const callerUid = request.auth.uid;
    const { uid, newEmail } = request.data;

    if (!uid || !newEmail) {
        throw new HttpsError("invalid-argument", "Se requiere el UID y el nuevo email.");
    }

    try {
        // 2. Verify caller is an admin using Custom Auth Claims
        const callerRole = request.auth.token.role;
        const isSuperAdmin = request.auth.token.email === 'admin@te.org';

        if (callerRole !== "admin" && !isSuperAdmin) {
            throw new HttpsError("permission-denied", "Solo los administradores pueden modificar correos.");
        }

        // 3. Update the Auth user
        await admin.auth().updateUser(uid, { email: newEmail });

        return { success: true, message: "Email actualizado correctamente en Firebase Auth." };
    } catch (error) {
        console.error("Error actualizando email del usuario:", error);
        throw new HttpsError("internal", error.message);
    }
});

// Callable function to resolve a username to their real auth email
// Publicly accessible (no auth required) so users can login
exports.resolveEmailForLogin = onCall({ enforceAppCheck: true }, async (request) => {
    const { username } = request.data;

    if (!username) {
        throw new HttpsError("invalid-argument", "Se requiere el nombre de usuario.");
    }

    try {
        // Query Firestore for the user by exactly matching 'username'
        const usersSnapshot = await admin.firestore().collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            // If user doesn't exist, we just return the @te.org fallback, 
            // so Firebase Auth can throw the standard "user not found" when they try to login.
            return { email: `${username}@te.org` };
        }

        const userData = usersSnapshot.docs[0].data();

        // Return their realEmail if it exists and is not empty, otherwise return username@te.org
        const authEmail = (userData.realEmail && userData.realEmail.trim() !== '')
            ? userData.realEmail
            : `${username}@te.org`;

        return { email: authEmail };

    } catch (error) {
        console.error("Error resolviendo email:", error);
        throw new HttpsError("internal", "Error al buscar el usuario.");
    }
});

// Callable function to create a user with a custom UID (like MEO127)
// Only allows admins
exports.createUserAdmin = onCall({ enforceAppCheck: true }, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "El usuario no está autenticado.");

    const callerRole = request.auth.token.role;
    const isSuperAdmin = request.auth.token.email === 'admin@te.org';
    
    if (callerRole !== "admin" && !isSuperAdmin) {
        throw new HttpsError("permission-denied", "Solo los administradores pueden crear usuarios.");
    }

    const { authEmail, password, userData, uid } = request.data;
    if (!authEmail || !password || !uid || !userData) {
        throw new HttpsError("invalid-argument", "Faltan datos requeridos.");
    }

    try {
        // 1. Create user in Firebase Auth with the exact UID (e.g., MEO127)
        await admin.auth().createUser({
            uid: uid,
            email: authEmail,
            password: password
        });

        // Set the custom claim based on the role assigned to the user
        const newRole = userData.role || "orientador";
        await admin.auth().setCustomUserClaims(uid, { role: newRole });

        // 2. Create the Firestore document with the EXACT same UID
        await admin.firestore().collection("users").doc(uid).set({
            ...userData,
            createdAt: new Date().toISOString()
        });

        return { success: true, uid };
    } catch (error) {
        console.error("Error creando usuario:", error);
        throw new HttpsError("internal", error.message);
    }
});


exports.getCallsFromBigQuery = onCall({ enforceAppCheck: true }, async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    try {
        const bigquery = new BigQuery({ projectId: "singular-arbor-401018" });

        const { fechaInicio, fechaFin } = request.data || {};

        let query = `
            SELECT
                COALESCE(document_id, codigo_id) AS L_ID_Llamada,
                orientador                  AS L_Orientador,
                medio_contacto              AS L_Medio_Contacto,
                como_conocio                AS L_Como_Conoce,
                llamante_sexo               AS U_Sexo,
                llamante_edad               AS U_Edad,
                llamante_estado_civil       AS U_Estado_Civil,
                llamante_convive            AS U_Convive,
                llamante_asiduidad          AS U_Asiduidad,
                llamante_problematica_1     AS U_Problematica_1,
                llamante_problema_1         AS U_Problema_1,
                llamante_problematica_2     AS U_Problematica_2,
                llamante_problema_2         AS U_Problema_2,
                llamante_problematica_3     AS U_Problematica_3,
                llamante_problema_3         AS U_Problema_3,
                llamante_naturaleza         AS U_Naturaleza,
                llamante_inicio             AS U_Inicio,
                llamante_actitud_orientador AS U_Actitud_Orientador,
                llamante_presentacion       AS U_Presentacion,
                llamante_paralenguaje       AS U_Paralenguaje,
                llamante_procedencia        AS U_Procedencia,
                llamante_peticion           AS U_Peticion,
                llamante_actitud_problema_1 AS U_Actitud_Problema_1,
                llamante_actitud_problema_2 AS U_Actitud_Problema_2,
                llamante_condicion          AS U_Cond_Socioeconomica,
                llamante_llamada_derivada   AS L_Llamada_Derivada,
                tercero_sexo                AS T_Sexo_Tercero,
                tercero_edad                AS T_Edad_Tercero,
                tercero_estado_civil        AS T_Estado_Civil_Tercero,
                tercero_convive             AS T_Convive,
                tercero_relacion            AS T_Relacion,
                tercero_problematica_1      AS T_Problematica_1,
                tercero_problema_1          AS T_Problema_1,
                tercero_problematica_2      AS T_Problematica_2,
                tercero_problema_2          AS T_Problema_2,
                tercero_problematica_3      AS T_Problematica_3,
                tercero_problema_3          AS T_Problema_3,
                tercero_actitud_problema_1  AS T_Actitud_Problema_1,
                tercero_actitud_problema_2  AS T_Actitud_Problema_2,
                FORMAT_DATETIME('%Y-%m-%d', llamada_datetime) AS L_Fecha,
                FORMAT_DATETIME('%H:%M', llamada_datetime)    AS L_Hora,
                llamada_resultado           AS L_Resultado,
                llamada_duracion            AS L_Duracion,
                orientador_clave            AS O_Clave,
                orientador_autoevaluacion   AS O_Autoevaluacion,
                orientador_volvera_llamar   AS O_Volvera_Llamar,
                orientador_nivel_ayuda_1    AS O_Nivel_Ayuda_1,
                orientador_nivel_ayuda_2    AS O_Nivel_Ayuda_2,
                orientador_sentimientos_1   AS O_Sentimientos_1,
                orientador_sentimientos_2   AS O_Sentimientos_2,
                orientador_sentimientos_3   AS O_Sentimientos_3,
                orientador_actitudes_equivocadas_1 AS O_Actitudes_Equivocadas_1,
                orientador_actitudes_equivocadas_2 AS O_Actitudes_Equivocadas_2,
                orientador_satisfaccion_llamante_1 AS O_Satisfaccion_Llamante_1,
                orientador_satisfaccion_llamante_2 AS O_Satisfaccion_Llamante_2,
                sintesis                    AS L_Sintesis,
                source
            FROM \`singular-arbor-401018.marts.dashboard_union\`
            WHERE 1=1
        `;

        const params = {};

        if (fechaInicio) {
            query += ` AND DATE(llamada_datetime) >= DATE(@fechaInicio)`;
            params.fechaInicio = fechaInicio;
        }

        if (fechaFin) {
            query += ` AND DATE(llamada_datetime) <= DATE(@fechaFin)`;
            params.fechaFin = fechaFin;
        }

        query += ` ORDER BY llamada_datetime DESC LIMIT 2000`;

        const [rows] = await bigquery.query({ 
            query: query,
            params: params
        });
        return { calls: rows };

    } catch (error) {
        console.error("Error querying BigQuery:", error);
        throw new HttpsError("internal", "Error al consultar BigQuery: " + error.message);
    }
});

exports.getSchemaDebug = onCall(async (request) => {
    try {
        const usersSnapshot = await admin.firestore().collection("users").get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return { users };
    } catch (error) {
        throw new HttpsError("internal", error.message);
    }
});

exports.migratePreProductionCalls = onCall({ enforceAppCheck: true }, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "El usuario no está autenticado.");

    const callerRole = request.auth.token.role;
    const isSuperAdmin = request.auth.token.email === 'admin@te.org';

    if (callerRole !== "admin" && !isSuperAdmin) {
        throw new HttpsError("permission-denied", "Solo los administradores pueden ejecutar migraciones.");
    }

    try {
        const callsSnapshot = await admin.firestore().collection("calls").get();
        let updated = 0;
        const batch = admin.firestore().batch();

        callsSnapshot.forEach((doc) => {
            const data = doc.data();
            const currentId = doc.id;
            const targetId = data.L_ID_Llamada;
            
            if (targetId && currentId !== targetId) {
                const newRef = admin.firestore().collection("calls").doc(targetId);
                const oldRef = admin.firestore().collection("calls").doc(currentId);
                
                batch.set(newRef, data);
                batch.delete(oldRef);
                updated++;
            }
        });

        if (updated > 0) {
            await batch.commit();
        }

        return { success: true, message: `Migradas ${updated} llamadas con IDs aleatorios a IDs L_ID_Llamada.`, total: callsSnapshot.size, updated };
    } catch (error) {
        console.error("Error en migración:", error);
        throw new HttpsError("internal", "Error durante la migración: " + error.message);
    }
});

exports.migrateCustomClaims = onCall({ enforceAppCheck: true }, async (request) => {
    const isSuperAdmin = request.auth?.token?.email === 'admin@te.org';
    const isAdmin = request.auth?.token?.role === 'admin';
    if (!isSuperAdmin && !isAdmin) {
        throw new HttpsError("permission-denied", "No autorizado.");
    }

    console.log("Fetching all users from Firestore to migrate claims...");
    const usersSnapshot = await admin.firestore().collection("users").get();
    
    let updated = 0;
    
    for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        const role = data.role || "orientador";
        const isSuperUser = (data.username === 'admin' || data.email === 'admin@te.org');
        
        const claimRole = isSuperUser ? 'admin' : role;
        
        try {
            await admin.auth().setCustomUserClaims(doc.id, { role: claimRole });
            console.log(`Set role '${claimRole}' for user ${doc.id}`);
            updated++;
        } catch (error) {
            console.error(`Error setting claims for ${doc.id}:`, error.message);
        }
    }
    
    return { success: true, updated };
});

