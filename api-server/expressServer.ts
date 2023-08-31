// Dendencies 
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as client from 'prom-client';
import '../metrics/metrics';
//
import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize('postgres://tsdbadmin:bobsaget101!@i1milkhm0b.cdjcn2iy17.tsdb.cloud.timescale.com:38603/tsdb?sslmode=require', {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  }
})
async function setupDatabase() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        time TIMESTAMPTZ NOT NULL,
        latency INT
      );
    `);
    console.log('Table created successfully.');

    await sequelize.query(`SELECT create_hypertable('metrics', 'time');`);
    console.log('Converted to hypertable successfully.');

    // Now that the DB is set up, start the Express app
    console.log('DB Setup successfully');
    // ... rest of your Express setup
  } catch (err) {
    console.error('Failed to set up database:', err);
  }
}
setupDatabase();

const app = express();
app.use(cors());
const PORT = 3000;

app.get('/', (req, res) => {
  sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  res.send('hi')
})


app.get('/metrics', async (req,res)=> {
  res.set('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  console.log("metrics here: ", metrics)
  res.send(metrics)
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
