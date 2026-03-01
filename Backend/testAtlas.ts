import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const testConn = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('Testing connection to:', uri?.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await mongoose.connect(uri!);
        const db = mongoose.connection.db;
        console.log('--- Connected to Atlas ---');
        console.log('Host:', mongoose.connection.host);
        console.log('Target Database:', db?.databaseName);

        const collections = await db?.listCollections().toArray();
        console.log('Found Collections:', collections?.map(c => c.name));

        if (collections?.some(c => c.name === 'herbs')) {
            const count = await db?.collection('herbs').countDocuments();
            console.log('✅ Found "herbs" collection with', count, 'documents');
        } else {
            console.log('❌ "herbs" collection NOT found in this database!');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConn();
