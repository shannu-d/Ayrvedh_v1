# Ayurvedh — Ancient Wisdom, Modern Science

Ayurvedh is a comprehensive platform designed to bridge the gap between traditional Ayurvedic wisdom and modern e-commerce. It features a sophisticated **Herb Encyclopedia** and a robust e-commerce engine for Ayurvedic products.

## 🌟 Key Features

### 1. Ayurvedic Herb Encyclopedia (V2)
- **Deep Botanical Data**: Full taxonomical details, botanical names, and plant families for over 30+ herbs.
- **Traditional Properties**: Detailed classification by **Rasa** (Taste), **Guna** (Quality), **Virya** (Energy), and **Dosha** balance.
- **Clinical Insights**: Structured data on benefits, indications, precautions, and contraindications.
- **Standalone Management**: A dedicated admin interface to manage the encyclopedia entries independently.

### 2. Multi-Layer Intelligence
- **Layer 1**: AI Symptom-to-Herb Intelligence (powered by Groq).
- **Layer 3**: Scientific Validation with research badges and PubMed linking.
- **Layer 4**: Full Multilingual Support (Telugu, Hindi, Tamil, Malayalam) for all encyclopedia content.

### 3. E-commerce Integration
- Secure JWT-based authentication with OTP verification.
- Dynamic product catalog linked directly to the herb encyclopedia.
- Admin dashboard for product, order, and herb management.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Backend**: Node.js, Express, TypeScript (TSX).
- **Database**: MongoDB Atlas (Cloud-hosted).
- **AI Engine**: Groq SDK for lightning-fast intelligence.
- **Email**: Nodemailer for OTP delivery.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### Installation
1. Clone the repository.
2. **Backend**:
   ```bash
   cd Backend
   npm install
   # Configure .env with your MONGODB_URI and GROQ_API_KEY
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## 📜 Deployment
The project is optimized for deployment on **Vercel** (Frontend) and **Render** (Backend). Refer to the `deployment_guide.md` in the brain artifacts for detailed steps.

---
Built with ❤️ by the Ayurvedh Team.
