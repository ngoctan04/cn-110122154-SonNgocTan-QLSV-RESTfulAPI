import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import route from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import classRoute from './routes/classRoute.js';
import majorRoute from './routes/majorRoute.js';
import courseRoute from './routes/courseRoute.js';
import gradeRoute from './routes/gradeRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import auditRoute from './routes/auditRoute.js';
// Finance feature temporarily disabled due to issues
// import financeRoute from './routes/financeRoute.js';
import cors from 'cors';
const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

// Phục vụ file tĩnh cho ảnh đại diện

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 7000;

async function startServer() {
    try {
        let MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.log('No MONGODB_URI in environment — starting in-memory MongoDB for development');
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            MONGODB_URI = mongod.getUri();
        }

        await mongoose.connect(MONGODB_URI);
        console.log('DB Connected successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
}

app.use('/api', route);
app.use('/api/auth', authRoute);
app.use('/api/class', classRoute);
app.use('/api/major', majorRoute);
app.use('/api/course', courseRoute);
app.use('/api/grade', gradeRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/audit', auditRoute);

startServer();
// Finance routes disabled while troubleshooting
// app.use('/api/finance', financeRoute);