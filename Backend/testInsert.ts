import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Herb } from './src/models/Herb';

dotenv.config();

const testInsert = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to', mongoose.connection.db.databaseName);

        const testHerb = {
            name: "Test Herb",
            category: ["Test"],
            description: "Test description"
        };

        await Herb.deleteMany({ name: "Test Herb" });
        const res = await Herb.create(testHerb);
        console.log('✅ Successfully inserted:', res.name);

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Insert failed:');
        console.dir(err, { depth: null });
        process.exit(1);
    }
};

testInsert();
