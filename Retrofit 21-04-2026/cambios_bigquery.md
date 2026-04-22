Add this at the bottom of functions/index.js

```bash
const { BigQuery } = require("@google-cloud/bigquery");

exports.getCallsFromBigQuery = onCall(async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    try {
        const bigquery = new BigQuery({ projectId: "singular-arbor-401018" });

        const query = `
            SELECT
                COALESCE(document_id, codigo_id) AS id,
                orientador,
                medio_contacto              AS medioContacto,
                como_conocio                AS comoConocio,
                llamante_sexo               AS l_sexo,
                llamante_edad               AS l_edad,
                llamante_estado_civil       AS l_ecivil,
                llamante_convive            AS l_convive,
                llamante_asiduidad          AS l_asiduidad,
                llamante_problematica_1     AS l_problematica_1,
                llamante_problema_1         AS l_problema_1,
                llamante_problematica_2     AS l_problematica_2,
                llamante_problema_2         AS l_problema_2,
                llamante_problematica_3     AS l_problematica_3,
                llamante_problema_3         AS l_problema_3,
                llamante_naturaleza         AS l_naturaleza,
                llamante_inicio             AS l_inicio,
                llamante_actitud_orientador AS l_actitud,
                llamante_presentacion       AS l_presentacion,
                llamante_paralenguaje       AS l_paralenguaje,
                llamante_procedencia        AS l_procedencia,
                llamante_peticion           AS l_peticion,
                llamante_actitud_problema_1 AS l_actitud_problema_1,
                llamante_actitud_problema_2 AS l_actitud_problema_2,
                llamante_condicion          AS l_condicion,
                llamante_llamada_derivada   AS l_derivada,
                tercero_sexo                AS t_sexo,
                tercero_edad                AS t_edad,
                tercero_estado_civil        AS t_ecivil,
                tercero_convive             AS t_convive,
                tercero_relacion            AS t_relacion,
                tercero_problematica_1      AS t_problematica_1,
                tercero_problema_1          AS t_problema_1,
                tercero_problematica_2      AS t_problematica_2,
                tercero_problema_2          AS t_problema_2,
                tercero_problematica_3      AS t_problematica_3,
                tercero_problema_3          AS t_problema_3,
                tercero_actitud_problema_1  AS t_actitud_problema_1,
                tercero_actitud_problema_2  AS t_actitud_problema_2,
                FORMAT_DATETIME('%Y-%m-%d', llamada_datetime) AS c_fecha,
                FORMAT_DATETIME('%H:%M', llamada_datetime)    AS c_hora,
                llamada_resultado           AS c_resultado,
                llamada_duracion            AS c_duracion,
                orientador_clave            AS o_clave,
                orientador_autoevaluacion   AS o_autoevaluacion,
                orientador_volvera_llamar   AS o_volvera_llamar,
                orientador_nivel_ayuda_1    AS o_nivel_ayuda_1,
                orientador_nivel_ayuda_2    AS o_nivel_ayuda_2,
                orientador_sentimientos_1   AS o_sentimientos_1,
                orientador_sentimientos_2   AS o_sentimientos_2,
                orientador_sentimientos_3   AS o_sentimientos_3,
                orientador_actitudes_equivocadas_1 AS o_actitudes_1,
                orientador_actitudes_equivocadas_2 AS o_actitudes_2,
                orientador_satisfaccion_llamante_1 AS o_satisfaccion_1,
                orientador_satisfaccion_llamante_2 AS o_satisfaccion_2,
                sintesis,
                source
            FROM \`singular-arbor-401018.marts.dashboard_union\`
            ORDER BY llamada_datetime DESC
        `;

        const [rows] = await bigquery.query({ query });
        return { calls: rows };

    } catch (error) {
        console.error("Error querying BigQuery:", error);
        throw new HttpsError("internal", "Error al consultar BigQuery: " + error.message);
    }
});
```

Install the BigQuery client in functions

```bash
cd functions
npm install @google-cloud/bigquery
```

Update getCalls() in firebase.js
```bash
#OLD
async getCalls() {
    const querySnapshot = await getDocs(collection(dbInstance, "calls"));
    const calls = [];
    querySnapshot.forEach((doc) => {
        calls.push({ id: doc.id, ...doc.data() });
    });
    return calls;
}

#NEW
async getCalls() {
    const getCallsFromBigQuery = httpsCallable(functionsInstance, 'getCallsFromBigQuery');
    const response = await getCallsFromBigQuery();
    return response.data.calls;
}
```
Deploy the new function

```bash
firebase deploy --only functions:getCallsFromBigQuery
```