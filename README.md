# BharatMesh - Offline-First Service Platform

A comprehensive MERN stack application designed for Tier 2/3 Indian SMBs, featuring offline-first architecture, real-time sync, and vernacular UI support.

## 🎯 Project Overview

**BharatMesh** is a complete business management solution built with modern web technologies. It provides essential business functions like billing, inventory management, order processing, and attendance tracking - all designed to work offline-first for reliable operation in areas with poor internet connectivity.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MERN
```

2. **Install dependencies**
```bash
npm install --workspaces
```

3. **Environment Setup**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your API URL
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api
- MongoDB: localhost:27017

## 📱 Features

### Core Business Modules
- **🔐 Authentication**: JWT-based authentication with role management
- **💰 Billing**: Complete invoicing system with GST calculation and payment tracking
- **📦 Inventory**: Product management, stock tracking, and batch management
- **📋 Orders**: Order processing, status tracking, and customer management
- **👥 Attendance**: Clock in/out system with geofencing and location tracking
- **📊 Analytics**: Business intelligence dashboard with charts and reports

### Technical Features
- **📱 Offline-First**: Works without internet using IndexedDB (Dexie)
- **🔄 Real-time Sync**: Socket.io for real-time data synchronization
- **📱 PWA**: Installable progressive web app with service workers
- **🌐 Multi-Language**: English and Hindi support with i18next
- **📱 Responsive**: Mobile-first design with Material-UI
- **🔒 TypeScript**: Full type safety across frontend and backend
- **🎨 Modern UI**: Clean, intuitive interface with Material Design

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **RESTful API** design with proper HTTP methods
- **JWT Authentication** with refresh tokens
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **Role-based Access Control** (RBAC)
- **Input validation** and sanitization
- **Error handling** and logging

### Frontend (React + TypeScript + Material-UI)
- **React 18** with TypeScript
- **Material-UI** component library
- **Zustand** for state management
- **React Router** for navigation
- **i18next** for internationalization
- **Dexie** for IndexedDB operations
- **PWA** with service workers

### Database (MongoDB)
- **User management** with roles and permissions
- **Business data storage** with proper relationships
- **Optimized queries** and indexing
- **Data validation** and constraints

## 🎯 Key Business Features

### 1. Billing System
- Create and manage invoices
- GST calculation (5%, 12%, 18%, 28%)
- Multiple payment methods (Cash, UPI, Card)
- Customer management
- Payment tracking

### 2. Inventory Management
- Product catalog with categories
- Stock level tracking
- Low stock alerts
- Batch management with expiry dates
- Supplier management
- Stock adjustments

### 3. Order Management
- Order creation and tracking
- Multiple channels (WhatsApp, Counter, Phone, Web)
- Order status management
- Customer communication
- Order analytics

### 4. Attendance System
- Clock in/out with GPS verification
- Geofencing for location validation
- Selfie capture for verification
- Attendance reports and analytics
- Overtime calculation

### 5. Analytics Dashboard
- Revenue trends and charts
- Sales performance metrics
- Inventory health indicators
- Staff performance tracking
- Business intelligence reports

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Configure reverse proxy (nginx)

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh access token

### Billing Endpoints
- `GET /api/billing/invoices` - List invoices
- `POST /api/billing/invoices` - Create invoice
- `GET /api/billing/invoices/:id` - Get invoice details
- `PUT /api/billing/invoices/:id` - Update invoice
- `GET /api/billing/stats` - Billing statistics

### Inventory Endpoints
- `GET /api/inventory/products` - List products
- `POST /api/inventory/products` - Create product
- `PUT /api/inventory/products/:id` - Update product
- `DELETE /api/inventory/products/:id` - Delete product
- `GET /api/inventory/stats` - Inventory statistics

### Orders Endpoints
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Attendance Endpoints
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/stats` - Attendance statistics

## 🛠️ Development

### Project Structure
```
MERN/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Utility functions
│   └── package.json
├── frontend/             # React + TypeScript UI
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── modules/      # Feature modules
│   │   ├── services/     # API services
│   │   └── stores/       # State management
│   └── package.json
├── shared/               # Shared TypeScript types
│   └── src/types/        # Type definitions
├── docker-compose.yml    # Docker configuration
└── README.md
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

## 🎯 Demo Credentials

**Test User:**
- Phone: 9999999999
- PIN: 1234
- Role: Owner

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@bharatmesh.in or create an issue in the repository.

---

**Built with ❤️ for Indian SMBs**