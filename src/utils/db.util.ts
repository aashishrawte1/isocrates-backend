import mongoose from 'mongoose';
import config from '../config/config';

export const connect = () => {
    mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
        .then(() => {
        console.info(`Running on ENV = ${process.env.NODE_ENV}`);
        console.info('Connected to mongoDB.');
        })
        .catch((error) => {
        console.error('Unable to connect.');
        console.error(error);
    });

};

