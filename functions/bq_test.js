const { BigQuery } = require('@google-cloud/bigquery');

async function checkSchema() {
  const bigquery = new BigQuery({ projectId: 'singular-arbor-401018' });
  const query = `
    SELECT column_name
    FROM \`singular-arbor-401018.marts.INFORMATION_SCHEMA.COLUMNS\`
    WHERE table_name = 'dashboard_union'
  `;
  
  try {
    const [rows] = await bigquery.query({ query });
    console.log("Columns in BigQuery table:");
    rows.forEach(row => console.log(row.column_name));
  } catch (error) {
    console.error("Error querying BigQuery:", error);
  }
}

checkSchema();
