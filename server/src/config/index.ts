import { MongoClient, Db } from 'mongodb';
import config from './db.json';

const env = process.env.NODE_ENV || 'development';
const { url, database } = config[env];

// Singleton instance
let db: Db;
let client: MongoClient;

// Inisialisasi koneksi database
export const connectDB = async () => {
    try {
        client = await MongoClient.connect(url);
        db = client.db(database);
        console.log('✅ MongoDB connected successfully!');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Helper utk akses database
export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
};

// Pastikan db terkoneksi dulu
await connectDB();

// Export db utk kemudahan penggunaan
export { db };