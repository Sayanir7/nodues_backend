import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/connectDb.js';
import dotenv from 'dotenv';
import uploadDues from './routes/upload_due.js';
import getDues from './routes/get_dues.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload-dues", uploadDues);
app.use("/api/get-dues", getDues);


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
};

const db = await connectDB(dbConfig);
export { db };

app.get('/test', (req, res) =>{
    res.json('Hello world');
});

app.listen(3000,() =>{
    console.log('Server is running on port 3000');
})