const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId: 'singular-arbor-401018'});
bq.query('SELECT * FROM `singular-arbor-401018.marts.dashboard_union` LIMIT 5')
  .then(r => console.log("SUCCESS!", r[0]))
  .catch(e => console.error("ERROR!", e.message));
