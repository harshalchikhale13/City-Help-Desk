# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Git

### Step 1: Clone/Setup Project

```bash
cd complaint-system
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_NAME=civic_complaints_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key_here
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE civic_complaints_db;"

# Import schema
psql -U postgres -d civic_complaints_db -f ../database/schema.sql

# Verify connection
psql -U postgres -d civic_complaints_db -c "SELECT COUNT(*) FROM users;"
```

### Step 4: Start Backend

```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════╗
║   Civic Complaint Management System       ║
║   Backend Server Running                  ║
╠════════════════════════════════════════════╣
║   Port: 5000                         ║
║   Environment: development                ║
│   Frontend URL: http://localhost:3000     ║
╚════════════════════════════════════════════╝
```

### Step 5: Frontend Setup (New Terminal)

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

### Step 6: Start Frontend

```bash
npm start
```

Application opens at `http://localhost:3000`

---

## 🔐 Demo Credentials

Login with:
```
Email: citizen@example.com
Password: Password123!
```

Or create a new account

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview |
| [docs/SETUP.md](docs/SETUP.md) | Detailed setup guide |
| [docs/API.md](docs/API.md) | API documentation |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project details |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Deployment guide |

---

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

### Frontend
```bash
npm start            # Start development server
npm run build        # Create production build
npm test             # Run tests
```

### Database
```bash
# Connect to database
psql -U postgres -d civic_complaints_db

# View database schema
\dt

# Exit psql
\q
```

---

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Windows: Services > PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -h localhost
```

### Dependencies Error
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Structure

```
complaint-system/
├── backend/              # Node.js + Express API
├── frontend/             # React.js app
├── database/             # SQL schema
├── docs/                 # Documentation
├── README.md             # Main documentation
└── PROJECT_SUMMARY.md    # Complete details
```

---

## ✨ Key Features

✅ User Registration & Login
✅ Create & Track Complaints
✅ Real-time Status Updates
✅ Admin Dashboard
✅ Email Notifications
✅ Secure JWT Authentication
✅ Responsive Design
✅ Role-Based Access Control

---

## 📖 Documentation

- **[README.md](README.md)** - Features, tech stack, and overview
- **[docs/SETUP.md](docs/SETUP.md)** - Installation and deployment
- **[docs/API.md](docs/API.md)** - Complete API reference
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Detailed project information

---

## 🤝 Support

**Email**: support@civiccomplaints.com
**Phone**: +1-800-COMPLAINT
**GitHub**: Create an issue

---

## 📝 Version

**Version**: 1.0.0
**Last Updated**: January 18, 2026
**Status**: Production Ready ✅

---

## 🎯 Next Steps

1. ✅ Start the backend and frontend
2. ✅ Register a new account
3. ✅ Create a test complaint
4. ✅ View complaint in dashboard
5. ✅ Review API documentation

---

**Happy coding! 🚀**
