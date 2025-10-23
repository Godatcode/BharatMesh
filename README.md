# BharatMesh - Offline-First Business Management Platform

<div align="center">

![BharatMesh Logo](https://via.placeholder.com/200x80/667eea/ffffff?text=BharatMesh)

**A comprehensive MERN stack application designed for Tier 2/3 Indian SMBs**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

## 🎯 Overview

**BharatMesh** is a revolutionary offline-first business management platform specifically designed for Small and Medium Businesses (SMBs) in Tier 2/3 Indian cities. Built with modern web technologies, it provides essential business functions like billing, inventory management, order processing, and attendance tracking - all designed to work seamlessly offline for reliable operation in areas with poor internet connectivity.

### 🌟 Key Highlights

- **📱 Offline-First Architecture**: Works without internet using IndexedDB and service workers
- **🔄 Real-time Sync**: Socket.io for seamless data synchronization when online
- **🌐 Multi-Language Support**: English and Hindi with framework for additional Indian languages
- **📱 Progressive Web App**: Installable on mobile devices with native-like experience
- **🔒 Enterprise Security**: JWT authentication, RBAC, and AES-256 encryption
- **📊 Business Intelligence**: Comprehensive analytics and reporting dashboard

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6+
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/bharatmesh.git
cd bharatmesh
```

2. **Install dependencies**
```bash
npm install --workspaces
```

3. **Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your API URL
```

4. **Start Development Servers**
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

5. **Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **API Health**: http://localhost:5001/health

## 📱 Core Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with refresh tokens
- **Role-based Access Control** (Owner, Manager, Employee, Auditor, Family)
- **Phone + PIN Authentication** for easy access
- **Multi-device Support** with device registration

### 💰 Billing & Invoicing
- **Complete Invoice Management** with GST calculation (5%, 12%, 18%, 28%)
- **Multiple Payment Methods** (Cash, UPI, Card, Cheque)
- **Customer Management** with contact details
- **Payment Tracking** and reconciliation
- **Thermal Printer Integration** for receipts

### 📦 Inventory Management
- **Product Catalog** with categories and variants
- **Stock Level Tracking** with real-time updates
- **Low Stock Alerts** and notifications
- **Batch Management** with expiry date tracking
- **Supplier Management** and quick reorder
- **Stock Adjustments** and transfers

### 📋 Order Management
- **Multi-channel Orders** (WhatsApp, Counter, Phone, Web)
- **Order Status Tracking** with real-time updates
- **Customer Communication** via WhatsApp integration
- **Order Analytics** and performance metrics
- **Voice Note Transcription** for voice orders

### 👥 Attendance System
- **Clock In/Out** with GPS verification
- **Geofencing** for location validation
- **Selfie Capture** for verification
- **Shift Management** and overtime calculation
- **Leave Approval Workflow**
- **Attendance Reports** and analytics

### 📊 Analytics Dashboard
- **Revenue Trends** with interactive charts
- **Sales Performance** metrics
- **Inventory Health** indicators
- **Staff Performance** tracking
- **Business Intelligence** reports
- **Export to PDF/CSV**

## 🏗️ Technical Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── src/
│   ├── models/          # MongoDB models (User, Product, Invoice, etc.)
│   ├── routes/          # API routes (auth, billing, inventory, etc.)
│   ├── middleware/     # Custom middleware (auth, validation, etc.)
│   ├── utils/           # Utility functions (encryption, logging, etc.)
│   └── types/           # TypeScript type definitions
├── dist/                # Compiled JavaScript
└── logs/                # Application logs
```

**Key Technologies:**
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Winston** for logging
- **Helmet** for security headers

### Frontend (React + TypeScript + Material-UI)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── modules/         # Feature modules (billing, inventory, etc.)
│   ├── services/        # API services and offline storage
│   ├── stores/          # State management (Zustand)
│   ├── hooks/           # Custom React hooks
│   └── i18n/            # Internationalization
├── public/              # Static assets
└── dist/                # Production build
```

**Key Technologies:**
- **React 18** with TypeScript
- **Material-UI** component library
- **Zustand** for state management
- **React Router** for navigation
- **i18next** for internationalization
- **Dexie** for IndexedDB operations
- **PWA** with service workers

### Shared Types
```
shared/
├── src/
│   └── types/           # Shared TypeScript definitions
└── dist/                # Compiled types
```

## 🌐 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login with phone and PIN |
| `POST` | `/api/auth/register` | User registration |
| `GET` | `/api/auth/me` | Get user profile |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `PUT` | `/api/auth/me` | Update user profile |

### Billing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/billing/invoices` | List all invoices |
| `POST` | `/api/billing/invoices` | Create new invoice |
| `GET` | `/api/billing/invoices/:id` | Get invoice details |
| `PUT` | `/api/billing/invoices/:id` | Update invoice |
| `DELETE` | `/api/billing/invoices/:id` | Delete invoice |
| `GET` | `/api/billing/stats` | Get billing statistics |

### Inventory Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/products` | List all products |
| `POST` | `/api/inventory/products` | Create new product |
| `GET` | `/api/inventory/products/:id` | Get product details |
| `PUT` | `/api/inventory/products/:id` | Update product |
| `DELETE` | `/api/inventory/products/:id` | Delete product |
| `POST` | `/api/inventory/adjust` | Stock adjustment |
| `GET` | `/api/inventory/alerts` | Low stock alerts |

### Orders Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List all orders |
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/:id` | Get order details |
| `PUT` | `/api/orders/:id` | Update order status |
| `DELETE` | `/api/orders/:id` | Cancel order |

### Attendance Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attendance/clock-in` | Clock in with location |
| `POST` | `/api/attendance/clock-out` | Clock out |
| `GET` | `/api/attendance` | Get attendance records |
| `GET` | `/api/attendance/stats` | Attendance statistics |

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services in development mode
docker-compose --profile dev up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production with Docker Compose
```bash
# Build and start production services
docker-compose --profile prod up -d --build

# Access application at http://localhost
```

### Individual Service Management
```bash
# Start only database services
docker-compose up -d mongodb redis

# Start backend
docker-compose up -d backend

# Rebuild specific service
docker-compose up -d --build backend
```

## 🛠️ Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both backend and frontend in development mode |
| `npm run dev:backend` | Start only backend development server |
| `npm run dev:frontend` | Start only frontend development server |
| `npm run build` | Build all packages for production |
| `npm run build:backend` | Build backend for production |
| `npm run build:frontend` | Build frontend for production |
| `npm run start` | Start production backend server |
| `npm run install:all` | Install dependencies for all workspaces |

### Project Structure
```
bharatmesh/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── types/         # TypeScript types
│   ├── dist/               # Compiled JavaScript
│   ├── logs/               # Application logs
│   └── package.json
├── frontend/               # React + TypeScript UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── modules/        # Feature modules
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── hooks/          # Custom hooks
│   │   └── i18n/           # Internationalization
│   ├── public/             # Static assets
│   ├── dist/               # Production build
│   └── package.json
├── shared/                 # Shared TypeScript types
│   ├── src/types/          # Type definitions
│   └── package.json
├── docker-compose.yml      # Docker configuration
├── package.json            # Root package.json
└── README.md
```

## 🎯 Demo Credentials

**Test User Account:**
- **Phone**: `9999999999`
- **PIN**: `1234`
- **Role**: Owner

## 🌍 Internationalization

BharatMesh supports multiple Indian languages:

- ✅ **English** (en)
- ✅ **Hindi** (हिंदी)
- 🚧 **Tamil** (தமிழ்) - Coming soon
- 🚧 **Telugu** (తెలుగు) - Coming soon
- 🚧 **Bengali** (বাংলা) - Coming soon
- 🚧 **Marathi** (मराठी) - Coming soon
- 🚧 **Gujarati** (ગુજરાતી) - Coming soon
- 🚧 **Kannada** (ಕನ್ನಡ) - Coming soon
- 🚧 **Malayalam** (മലയാളം) - Coming soon

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **AES-256-GCM Encryption** for sensitive data
- **PBKDF2 Password Hashing** with salt
- **Role-based Access Control** (RBAC)
- **CORS Protection** and security headers
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **SQL Injection Protection** via Mongoose

## 📊 Performance & Scalability

- **Offline-First Architecture** for reliability
- **IndexedDB** for local data storage
- **Service Workers** for background sync
- **WebRTC P2P** for device-to-device sync
- **Socket.io** for real-time updates
- **MongoDB Indexing** for fast queries
- **Code Splitting** for optimized loading
- **PWA Caching** for instant access

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### Getting Help

- **📧 Email**: support@bharatmesh.in
- **💬 GitHub Issues**: [Create an issue](https://github.com/your-username/bharatmesh/issues)
- **📱 WhatsApp**: +91-XXXX-XXXXXX
- **📖 Documentation**: [docs.bharatmesh.in](https://docs.bharatmesh.in)

### Community

- **🌟 Star** this repository if you find it helpful
- **🐛 Report bugs** and request features
- **💡 Share ideas** and suggestions
- **🤝 Contribute** to the project

## 🗺️ Roadmap

### Phase 1: Core Modules (Q1 2024)
- [x] Authentication & Authorization
- [x] Basic Billing System
- [x] Inventory Management
- [ ] Order Management
- [ ] Attendance System

### Phase 2: Advanced Features (Q2 2024)
- [ ] WhatsApp Integration
- [ ] UPI Reconciliation
- [ ] Advanced Analytics
- [ ] Multi-language Support
- [ ] P2P Sync Engine

### Phase 3: Enterprise Features (Q3 2024)
- [ ] Multi-tenant Architecture
- [ ] Advanced Reporting
- [ ] API Integrations
- [ ] Mobile Apps
- [ ] Franchise Management

## 🙏 Acknowledgments

- **Material-UI** for the beautiful component library
- **MongoDB** for the robust database solution
- **Socket.io** for real-time communication
- **React** team for the amazing framework
- **TypeScript** team for type safety
- **Indian SMB Community** for inspiration and feedback

---

<div align="center">

**Built with ❤️ for Indian SMBs**

[Website](https://bharatmesh.in) • [Documentation](https://docs.bharatmesh.in) • [Support](mailto:support@bharatmesh.in)

</div>