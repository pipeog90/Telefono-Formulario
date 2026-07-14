const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery({ projectId: 'singular-arbor-401018' });

async function query() {
  const q = `SELECT U_Problematica_1, U_Problema_1, U_Problema_2, U_Problema_3 FROM \`singular-arbor-401018.telefono_data.llamadas\` WHERE U_Problematica_1 = 'B' OR U_Problema_1 LIKE 'B%' LIMIT 10`;
  const [rows] = await bigquery.query({ query: q });
  console.log(JSON.stringify(rows, null, 2));
}
query().catch(console.error);
