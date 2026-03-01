/**
 * Admin Seeder — run with: npx tsx src/makeAdmin.tsx <email>
 * Example: npx tsx src/makeAdmin.tsx shanmukhasuraz@mail.com
 */
import { connectDB } from './config/db';
import { User } from './models/User';

const email = process.argv[2];

if (!email) {
    console.error('❌ Usage: npx tsx src/makeAdmin.tsx <email>');
    process.exit(1);
}

const run = async () => {
    await connectDB();
    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: 'admin' },
        { new: true }
    );
    if (!user) {
        console.error(`❌ No user found with email: ${email}`);
        console.log('   Make sure to register the account first at http://localhost:8080/register');
    } else {
        console.log(`✅ Success! ${user.name} (${user.email}) is now an ADMIN.`);
        console.log(`   Log in at: http://localhost:8080/login`);
    }
    process.exit(0);
};

run().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
