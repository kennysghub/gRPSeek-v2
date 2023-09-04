import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
const PORT = 8082;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/** Request for static files */
app.use('/build', express.static(path.join(__dirname, '../build')));


/** Catch-all route handler for unknown routes */
app.use((req:Request, res:Response) => res.status(404).send('Invalid page'));

/** Global error handler */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middlware error',
    status: 400,
    message: { err: 'An error occurred' },
  };

  const errorObj = { ...defaultErr, ...err};
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});


/** Starting server */
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});

export default app;