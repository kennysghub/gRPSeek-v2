// Dendencies 
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as client from 'prom-client';
import '../metrics/metrics';

const app = express();
app.use(cors());
const PORT = 3000;


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
