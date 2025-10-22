# BharatMesh Setup Guide

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+ and npm
- MongoDB 7+
- Redis (optional, for advanced features)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Environment Setup

Create `.env` files for backend:

```bash
# backend/.env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bharatmesh
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGIN=http://localhost:5173
```

Create `.env` for frontend:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# OR install MongoDB locally
# macOS: brew install mongodb-community@7.0
# Ubuntu: sudo apt install mongodb
```

### 4. Start Development Servers

```bash
# Start both backend and frontend concurrently
npm run dev

# Backend will run on http://localhost:5000
# Frontend will run on http://localhost:5173
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/health

---

## Docker Setup (Recommended for Production)

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

---

## Database Setup

### Create Initial Admin User

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/bharatmesh

# Create admin user
db.users.insertOne({
  name: "Admin User",
  phone: "9999999999",
  pin: "$2b$10$...", // Hash of "1234" - change in production
  role: "owner",
  langs: ["hi", "en"],
  preferredLang: "hi",
  biometricEnabled: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Seed Sample Data (Optional)

```bash
cd backend
npm run seed # (if seed script is created)
```

---

## Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Failed

- Ensure MongoDB is running: `docker ps` or `brew services list`
- Check connection string in `.env`
- Verify firewall settings

### CORS Errors

- Update `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches exactly (including protocol)

### Module Not Found Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run install:all
```

---

## Production Deployment

### Environment Variables

Set these in production:

```bash
NODE_ENV=production
MONGO_URI=mongodb://your-production-mongodb:27017/bharatmesh
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
ENCRYPTION_KEY=<32-character-random-key>
CORS_ORIGIN=https://yourdomain.com
```

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update nginx.conf with SSL configuration
3. Update environment variables with https:// URLs

### PM2 Process Manager (Alternative to Docker)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/server.js --name bharatmesh-backend

# Start on system boot
pm2 startup
pm2 save
```

---

## Backup & Restore

### Backup MongoDB

```bash
mongodump --uri="mongodb://localhost:27017/bharatmesh" --out=./backup
```

### Restore MongoDB

```bash
mongorestore --uri="mongodb://localhost:27017/bharatmesh" ./backup/bharatmesh
```

---

## Monitoring

### Health Checks

- Backend: http://localhost:5000/health
- MongoDB: `mongosh` then `db.stats()`

### Logs

```bash
# Docker logs
docker-compose logs -f backend

# PM2 logs
pm2 logs bharatmesh-backend

# File logs
tail -f backend/logs/bharatmesh.log
```

---

## Support

For issues or questions:
- GitHub Issues: [github.com/bharatmesh/bharatmesh]
- Email: support@bharatmesh.in
- WhatsApp: +91-XXXX-XXXXXX

---

**Built with ❤️ for Bharat SMBs**

