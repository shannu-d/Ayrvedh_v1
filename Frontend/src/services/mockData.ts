export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  rating: number;
  numReviews: number;
  stock: number;
  featured?: boolean;
}

export interface Order {
  _id: string;
  items: { product: Product; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

const productImages = [
  "https://img.freepik.com/premium-photo/astragalus-closeup-also-called-milk-vetch-goat-sthorn-vinelike-spring-green-background-wild-plant_115509-3238.jpg",
  "https://euphoricgreens.in/cdn/shop/files/743137BF-E2AD-432C-8728-3B8B16C17303.jpg?v=1742410886",
  "https://trustherb.com/wp-content/uploads/2020/07/Webp.net-compress-image-1067x800.jpg",
  "https://media.istockphoto.com/id/1188067568/photo/azadirachta-indica-a-branch-of-neem-tree-leaves-natural-medicine.jpg?s=612x612&w=0&k=20&c=UwDQ2iD0hvdVgUby2cGOZtLleSGguxsB_-4izFTJaYw=",
  "https://t4.ftcdn.net/jpg/02/03/62/31/360_F_203623141_kwux1raxI9Eo1OqWwqWZM6ne6lYTBfdm.jpg",
  "https://www.shutterstock.com/shutterstock/videos/3519162279/thumb/1.jpg?ip=x480",
  "https://t4.ftcdn.net/jpg/03/88/41/55/360_F_388415502_Q2Mhpzt9rf4nxOogCHRBqlGwsycrCevS.jpg",
  "https://5.imimg.com/data5/OS/TH/MY-42987627/triphala-herbal-plant.jpg",
  "https://media.istockphoto.com/id/1253676637/photo/holy-basil.jpg?s=612x612&w=0&k=20&c=4kZxa85rXwQ1yBZIgxKy8q3gHRrH796dTsZrVCUOoIs=",
  "https://t3.ftcdn.net/jpg/17/03/72/72/360_F_1703727287_NLYmPbITAvcGvLpXHZNScpKt1XmaT2wI.jpg",
  "https://media.istockphoto.com/id/637366858/photo/the-herbal-plant-liquorice.jpg?s=612x612&w=0&k=20&c=W0jxUTdNVpkg2K3SgqOG1OztKOCfd6Zy5iqvjD8TIRg=",
  "https://static.wixstatic.com/media/6171ad_b9cb3ec64c5448f1b4ef62e5287fffe1~mv2.jpg/v1/fill/w_2500,h_2342,al_c/6171ad_b9cb3ec64c5448f1b4ef62e5287fffe1~mv2.jpg",
];

export const categories = [
  "Anti-Backterial",
  "Anti-Cancer",
  "Anti-Viral",
];

export const products: Product[] = [
  {
    _id: "1",
    name: "Tulasi",
    price: 189,
    originalPrice: 249,
    description: "Anti-bacterial, anti-inflammatory, helps in relieving stress and anxiety.",
    category: "Anti-Backterial",
    image: productImages[8],
    images: [productImages[8], productImages[0], productImages[4]],
    rating: 4.8,
    numReviews: 124,
    stock: 15,
    featured: true,
  },
  {
    _id: "2",
    name: "Amla (Indian Gooseberry)",
    price: 299,
    description: "Used to treat bacterial infections and boost immunity.",
    category: "Anti-Backterial",
    image: productImages[1],
    images: [productImages[1], productImages[0]],
    rating: 4.6,
    numReviews: 89,
    stock: 23,
    featured: true,
  },
  {
    _id: "3",
    name: "Vidanga",
    price: 129,
    originalPrice: 159,
    description: "Known for treating parasitic infections, digestive issues, and as a detoxifying agent.",
    category: "Electronics",
    image: productImages[2],
    images: [productImages[2], productImages[0]],
    rating: 4.4,
    numReviews: 56,
    stock: 8,
    featured: true,
  },
  {
    _id: "4",
    name: "Neem",
    price: 165,
    description: "Anti-bacterial, anti-fungal, boosts immunity, improves skin health.",
    category: "Accessories",
    image: productImages[3],
    images: [productImages[3], productImages[0]],
    rating: 4.7,
    numReviews: 203,
    stock: 30,
    featured: true,
  },
  {
    _id: "5",
    name: "Guduchi",
    price: 95,
    description: "Anti-cancer properties, boosts immunity.",
    category: "Beauty",
    image: productImages[4],
    images: [productImages[4], productImages[0]],
    rating: 4.9,
    numReviews: 67,
    stock: 12,
  },
  {
    _id: "6",
    name: "Shankhapushpi",
    price: 179,
    originalPrice: 220,
    description: "Known for enhancing memory, reducing stress, and calming the mind.",
    category: "Sports",
    image: productImages[5],
    images: [productImages[5], productImages[7]],
    rating: 4.5,
    numReviews: 312,
    stock: 45,
  },
  {
    _id: "7",
    name: "Ashwagandha",
    price: 78,
    description: "Boosts energy, reduces stress, improves concentration, anti-cancer properties.",
    category: "Beauty",
    image: productImages[6],
    images: [productImages[6], productImages[4]],
    rating: 4.3,
    numReviews: 145,
    stock: 20,
  },
  {
    _id: "8",
    name: "Triphala",
    price: 245,
    description: "Anti-cancer, detoxifies and rejuvenates.",
    category: "Fashion",
    image: productImages[7],
    images: [productImages[7], productImages[5]],
    rating: 4.8,
    numReviews: 78,
    stock: 3,
  },
  {
    _id: "9",
    name: "Amla",
    price: 89,
    description: "Anti-viral, boosts immunity, rich in Vitamin C, supports digestion.",
    category: "Accessories",
    image: productImages[9],
    images: [productImages[9], productImages[0]],
    rating: 4.6,
    numReviews: 92,
    stock: 18,
  },
  {
    _id: "10",
    name: "Astragalus",
    price: 149,
    description: "Boosts immunity and treats respiratory infections..",
    category: "Electronics",
    image: productImages[0],
    images: [productImages[0], productImages[1]],
    rating: 4.4,
    numReviews: 187,
    stock: 35,
  },
  {
    _id: "11",
    name: "Licorice Root",
    price: 65,
    description: "Antiviral, used for treating respiratory and digestive infections.",
    category: "Home & Living",
    image: productImages[10],
    images: [productImages[10], productImages[6]],
    rating: 4.7,
    numReviews: 34,
    stock: 10,
  },
  {
    _id: "12",
    name: "Astragalus Root",
    price: 45,
    description: "Antiviral, used for immune support and treating infections.",
    category: "Fashion",
    image: productImages[11],
    images: [productImages[11], productImages[9]],
    rating: 4.2,
    numReviews: 56,
    stock: 50,
  },
];

export const mockOrders: Order[] = [
  {
    _id: "ord-001",
    items: [
      { product: products[0], quantity: 1 },
      { product: products[4], quantity: 2 },
    ],
    total: 379,
    status: "Delivered",
    createdAt: "2024-12-15",
    shippingAddress: { fullName: "John Doe", address: "123 Main St", city: "New York", postalCode: "10001", country: "US" },
  },
  {
    _id: "ord-002",
    items: [{ product: products[1], quantity: 1 }],
    total: 299,
    status: "Processing",
    createdAt: "2025-01-20",
    shippingAddress: { fullName: "John Doe", address: "123 Main St", city: "New York", postalCode: "10001", country: "US" },
  },
  {
    _id: "ord-003",
    items: [{ product: products[7], quantity: 1 }, { product: products[5], quantity: 1 }],
    total: 424,
    status: "Shipped",
    createdAt: "2025-02-10",
    shippingAddress: { fullName: "Jane Smith", address: "456 Oak Ave", city: "LA", postalCode: "90001", country: "US" },
  },
];

export const mockUsers: User[] = [
  { _id: "u1", name: "John Doe", email: "john@example.com", isAdmin: false, createdAt: "2024-06-01" },
  { _id: "u2", name: "Jane Smith", email: "jane@example.com", isAdmin: false, createdAt: "2024-08-15" },
  { _id: "u3", name: "Admin User", email: "admin@example.com", isAdmin: true, createdAt: "2024-01-01" },
  { _id: "u4", name: "Bob Wilson", email: "bob@example.com", isAdmin: false, createdAt: "2024-11-20" },
  { _id: "u5", name: "Alice Brown", email: "alice@example.com", isAdmin: false, createdAt: "2025-01-05" },
];