/**
 * Creates a default admin account.
 * Run: npx tsx src/createAdmin.tsx
 */
import { connectDB } from './config/db';
import { User } from './models/User';

const run = async () => {
    await connectDB();

    const email = 'admin@ayurvedh.com';
    const existing = await User.findOne({ email });
    if (existing) {
        await User.findOneAndUpdate({ email }, { role: 'admin', isVerified: true });
        console.log('✅ Admin account already exists — role confirmed.');
    } else {
        await User.create({ name: 'Admin', email, password: 'Admin@123', role: 'admin', isVerified: true });
        console.log('✅ Admin account created!');
    }
    console.log('\n─────────────────────────────');
    console.log('  Email   : admin@ayurvedh.com');
    console.log('  Password: Admin@123');
    console.log('  URL     : http://localhost:8080/login');
    console.log('─────────────────────────────\n');
    process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
