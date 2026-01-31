# Visionary ERP 🚀

Visionary ERP is a modern, high-performance Enterprise Resource Planning (ERP) application designed for real-time inventory tracking, financial forecasting, and AI-driven business insights.

## ✨ Features

- **📊 Intelligent Dashboard**: Real-time overview of business health, including inventory value, profit margins, and active products.
- **📦 Inventory Management**: Robust product tracking with SKU management, category filtering, and velocity metrics.
- **💰 Financial Performance**: Detailed analysis of income, expenses, and net profit with interactive charts.
- **🔮 Predictive Forecasting**: Advanced trajectory charts predicting future profit based on historical data.
- **🤖 AI-Powered Insights**: Automated inventory analysis and business strategy recommendations powered by Groq (Llama 3.3).
- **💬 Visionary AI Chat**: An integrated assistant to help you query your inventory and get strategic advice.
- **⚡ Performance Optimized**: Multi-layered caching using `node-cache` on the backend and `React Query` on the frontend.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **State Management & Caching**: TanStack React Query v5
- **Styling**: Tailwind CSS
- **Icons & Charts**: Lucide React, Recharts
- **Auth**: Firebase Authentication

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Caching**: Node-cache (In-memory)
- **Database**: PostgreSQL (Prisma/Neon)
- **AI Integration**: Groq API (Llama 3.3 70B)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Firebase Project (for Auth)
- Groq API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd visionary-erp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

## 📈 Recent Updates
- **Frontend Caching**: Implemented React Query for all major modules (Inventory, Financials, Dashboard).
- **Backend Caching**: Added `node-cache` to dashboard endpoints to reduce database load.
- **Refactoring**: Decoupled components for better modularity and independent data fetching.
- **Type Safety**: Fully resolved TypeScript errors across the application.

---
Built with ❤️ by the Visionary Team.
