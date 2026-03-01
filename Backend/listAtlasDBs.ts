import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listDBs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        const admin = mongoose.connection.useDb('admin').db;
        const dbs = await admin?.admin().listDatabases();
        console.log('Available Databases:', dbs?.databases.map(d => d.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Could not list databases:');
        console.dir(err, { depth: null });
        process.exit(1);
    }
};

listDBs();
