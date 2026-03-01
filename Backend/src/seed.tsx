/**
 * Product Seeder — run with: npx tsx src/seed.tsx
 * Connects to MongoDB and inserts initial Ayurvedh products.
 * Safe to run multiple times (clears existing products first).
 */

import { connectDB } from './config/db';
import { Product } from './models/Product';

const productImages = [
    "https://img.freepik.com/premium-photo/astragalus-closeup-also-called-milk-vetch-goat-sthorn-vinelike-spring-green-background-wild-plant_115509-3238.jpg",
    "https://euphoricgreens.in/cdn/shop/files/743137BF-E2AD-432C-8728-3B8B16C17303.jpg?v=1742410886",
    "https://trustherb.com/wp-content/uploads/2020/07/Webp.net-compress-image-1067x800.jpg",
    "https://media.istockphoto.com/id/1188067568/photo/azadirachta-indica-a-branch-of-neem-tree-leaves-natural-medicine.jpg",
    "https://t4.ftcdn.net/jpg/02/03/62/31/360_F_203623141_kwux1raxI9Eo1OqWwqWZM6ne6lYTBfdm.jpg",
    "https://t4.ftcdn.net/jpg/03/88/41/55/360_F_388415502_Q2Mhpzt9rf4nxOogCHRBqlGwsycrCevS.jpg",
    "https://5.imimg.com/data5/OS/TH/MY-42987627/triphala-herbal-plant.jpg",
    "https://media.istockphoto.com/id/1253676637/photo/holy-basil.jpg",
    "https://t3.ftcdn.net/jpg/17/03/72/72/360_F_1703727287_NLYmPbITAvcGvLpXHZNScpKt1XmaT2wI.jpg",
    "https://media.istockphoto.com/id/637366858/photo/the-herbal-plant-liquorice.jpg",
];

const seedProducts = [
    {
        name: "Tulasi (Holy Basil)",
        price: 189,
        originalPrice: 249,
        description: "Anti-bacterial, anti-inflammatory, helps in relieving stress and anxiety. Known as the 'Queen of Herbs' in Ayurveda.",
        category: "Anti-Bacterial",
        image: productImages[7],
        images: [productImages[7], productImages[0]],
        rating: 4.8,
        numReviews: 124,
        stock: 50,
        featured: true,
    },
    {
        name: "Amla (Indian Gooseberry)",
        price: 299,
        description: "Rich in Vitamin C, used to treat bacterial infections, boost immunity, and support digestion.",
        category: "Anti-Bacterial",
        image: productImages[1],
        images: [productImages[1], productImages[0]],
        rating: 4.6,
        numReviews: 89,
        stock: 45,
        featured: true,
    },
    {
        name: "Neem",
        price: 165,
        description: "Anti-bacterial, anti-fungal, boosts immunity, improves skin health. Widely used in Ayurvedic medicine.",
        category: "Anti-Bacterial",
        image: productImages[3],
        images: [productImages[3], productImages[0]],
        rating: 4.7,
        numReviews: 203,
        stock: 60,
        featured: true,
    },
    {
        name: "Guduchi (Giloy)",
        price: 95,
        description: "Anti-cancer properties, powerful immunity booster. Used in traditional medicine to fight chronic conditions.",
        category: "Anti-Cancer",
        image: productImages[4],
        images: [productImages[4], productImages[0]],
        rating: 4.9,
        numReviews: 67,
        stock: 30,
        featured: true,
    },
    {
        name: "Triphala",
        price: 245,
        description: "Anti-cancer, detoxifies and rejuvenates. A combination of Amalaki, Bibhitaki and Haritaki.",
        category: "Anti-Cancer",
        image: productImages[6],
        images: [productImages[6], productImages[5]],
        rating: 4.8,
        numReviews: 78,
        stock: 40,
        featured: false,
    },
    {
        name: "Ashwagandha",
        price: 78,
        description: "Boosts energy, reduces stress, improves concentration, anti-cancer properties. Powerful adaptogen.",
        category: "Anti-Cancer",
        image: productImages[5],
        images: [productImages[5], productImages[4]],
        rating: 4.3,
        numReviews: 145,
        stock: 55,
        featured: false,
    },
    {
        name: "Licorice Root (Mulethi)",
        price: 65,
        description: "Anti-viral, used for treating respiratory and digestive infections. Soothes sore throats naturally.",
        category: "Anti-Viral",
        image: productImages[9],
        images: [productImages[9], productImages[6]],
        rating: 4.7,
        numReviews: 34,
        stock: 25,
        featured: false,
    },
    {
        name: "Astragalus Root",
        price: 149,
        description: "Anti-viral, boosts immunity, treats respiratory infections. Traditional adaptogen from Eastern medicine.",
        category: "Anti-Viral",
        image: productImages[0],
        images: [productImages[0], productImages[1]],
        rating: 4.4,
        numReviews: 187,
        stock: 35,
        featured: true,
    },
    {
        name: "Shankhapushpi",
        price: 179,
        originalPrice: 220,
        description: "Known for enhancing memory, reducing stress, and calming the mind. Supports neurological health.",
        category: "Anti-Viral",
        image: productImages[8],
        images: [productImages[8], productImages[7]],
        rating: 4.5,
        numReviews: 312,
        stock: 45,
        featured: false,
    },
    {
        name: "Vidanga",
        price: 129,
        originalPrice: 159,
        description: "Known for treating parasitic infections, digestive issues, and as a natural detoxifying agent.",
        category: "Anti-Bacterial",
        image: productImages[2],
        images: [productImages[2], productImages[0]],
        rating: 4.4,
        numReviews: 56,
        stock: 20,
        featured: false,
    },
];

const seed = async () => {
    await connectDB();

    // Clear existing products
    const deleted = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing products`);

    // Insert seed data
    const inserted = await Product.insertMany(seedProducts);
    console.log(`✅ Seeded ${inserted.length} products successfully!`);

    inserted.forEach((p) => console.log(`   📦 ${p.name} — ₹${p.price} [${p.category}]`));

    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
