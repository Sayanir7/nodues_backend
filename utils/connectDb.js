import mysql from 'mysql2/promise';

export const connectDB = async(dbConfig) => {
    try {
        const db = await mysql.createConnection(dbConfig);
        console.log('Connected to MariaDB');
        return db;
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
};