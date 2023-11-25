import cors from 'cors';
import express from 'express';
// import mongoose from 'mongoose';
import config from './config/config';
import { server } from './routers/user-routes';

const app = express();
const port = config.server.port;

const corsOptions = {
  origin: 'http://localhost:4200', // Replace with your Angular app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(server);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(config.server.port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
