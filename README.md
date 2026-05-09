🏛️ CIVIC SETU

Empowering Citizens, Improving Communities
A comprehensive crowdsourced civic issue reporting and resolution system designed to connect citizens with municipal authorities for transparent and efficient complaint management.

License Node React Native MongoDB

📋 Table of Contents

Overview
Features
Tech Stack
Architecture
Getting Started
Documentation
Contributing
License
Support
🎯 Overview

CIVIC SETU is a mobile-first platform that empowers citizens to report civic issues (potholes, water supply problems, garbage, etc.) with photo/video evidence, track complaint status in real-time, and ensure transparent municipal accountability.

The platform consists of:

Mobile App (React Native) - For citizens to report and track issues
Admin Dashboard (React Web) - For municipal staff to manage and resolve complaints
Backend API (Node.js) - RESTful API with MongoDB database
Key Highlights

✅ Real-time Tracking - Citizens can monitor complaint resolution progress ✅ Media Support - Upload photos/videos with automatic GPS tagging ✅ Offline Mode - Report issues even without internet connectivity ✅ Multi-language - Support for Hindi, English, and regional languages ✅ Admin Dashboard - Comprehensive management portal with analytics ✅ Secure & Scalable - JWT authentication with role-based access control

🚀 Features

For Citizens (Mobile App)

📸 Report Issues - Capture photos/videos with automatic GPS location
📍 Geolocation - Auto-tagging with reverse geocoding
📶 Offline Support - Queue reports for sync when back online
🔔 Push Notifications - Get updates on complaint status
📊 Track Progress - Stage-wise status updates (Submitted → Acknowledged → Assigned → In Progress → Resolved)
🌐 Multilingual UI - Hindi, English, and local language support
For Municipal Staff (Admin Dashboard)

🔐 Role-based Access - Admin, Supervisor, and Field Staff roles
🗃️ Complaint Management - Dashboard with advanced filters
🗺️ Map View - Visualize complaints with clustering
✅ Task Assignment - Assign/reassign complaints to staff
📈 Analytics - Performance metrics and insights
💬 Comments & Status Updates - Add notes and update resolution progress
🛠️ Tech Stack

Frontend

Mobile App: React Native (Expo)
Admin Dashboard: React.js + Material-UI
State Management: Context API / Redux
Maps: React-Leaflet with clustering
Backend

Runtime: Node.js (Express.js)
Database: MongoDB (Mongoose ODM)
Authentication: JWT (JSON Web Tokens)
Media Storage: Cloudinary / AWS S3
Notifications: Firebase Cloud Messaging (FCM)
DevOps

Version Control: Git / GitHub
Deployment: Railway / Heroku (Backend), Vercel / Netlify (Frontend)
CI/CD: GitHub Actions
Monitoring: PM2 + MongoDB Atlas
🏗️ Architecture

┌─────────────────┐         ┌─────────────────┐
│  Mobile App     │◄───────►│   Backend API   │
│  (React Native) │         │   (Node.js)     │
└─────────────────┘         └────────┬────────┘
                                     │
┌─────────────────┐                  │
│  Admin Dashboard│◄─────────────────┤
│  (React Web)    │                  │
└─────────────────┘                  │
                                     ▼
                            ┌─────────────────┐
                            │    MongoDB      │
                            │    Database     │
                            └─────────────────┘
                                     │
                            ┌────────┴────────┐
                            │   Cloudinary    │
                            │  (Media Store)  │
                            └─────────────────┘
🚀 Getting Started

Prerequisites

Node.js (v16 or higher)
MongoDB (local or MongoDB Atlas)
Expo CLI (for mobile development)
Git
Installation

Clone the repository

git clone https://github.com/yourusername/CIVIC_SETU.git
cd CIVIC_SETU
Setup Backend

cd civic-backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
Setup Admin Dashboard

cd civic-admin
cp .env.example .env
# Edit .env with backend API URL
npm install
npm start
Setup Mobile App

cd civic-mobile
cp .env.example .env
# Edit .env with backend API URL
npm install
npx expo start
Environment Variables

Create .env files based on .env.example templates in each directory:

Backend (.env)

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Admin & Mobile (.env)

REACT_APP_API_URL=http://localhost:5000/api  # For admin
API_URL=http://localhost:5000/api            # For mobile
📚 Documentation

Setup Guide - Complete setup and deployment instructions
Project Overview - Detailed project specifications and roadmap
Security - Security best practices and guidelines
API Documentation - REST API endpoints (coming soon)
Contributing - How to contribute to the project
🗂️ Project Structure

CIVIC_SETU/
├── civic-backend/          # Node.js Express API
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   └── server.js          # Entry point
│
├── civic-admin/           # React Admin Dashboard
│   ├── src/
│   │   ├── pages/        # Dashboard pages
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # State management
│   │   └── constants/    # Config & constants
│   └── package.json
│
├── civic-mobile/         # React Native Mobile App
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── services/    # API integration
│   │   ├── navigation/  # App navigation
│   │   └── constants/   # Config & constants
│   └── package.json
│
└── docs/                # Additional documentation
🤝 Contributing

We welcome contributions from the community! Please read our Contributing Guidelines before submitting pull requests.

How to Contribute

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
Development Workflow

Follow the existing code style and conventions
Write meaningful commit messages
Add tests for new features
Update documentation as needed
Ensure all tests pass before submitting PR
🐛 Bug Reports & Feature Requests

Found a bug? Have a feature idea? Please open an issue with:

Clear description
Steps to reproduce (for bugs)
Expected vs actual behavior
Screenshots/videos (if applicable)
📊 Report Categories

The platform supports the following civic issue categories:

🛣️ Road Issues - Potholes, cracks, road damage
💧 Water Supply - Pipeline leaks, water scarcity
⚡ Electricity - Power outages, faulty lines
🗑️ Garbage - Waste collection, littering
🚰 Drainage - Blocked drains, sewage issues
💡 Street Lights - Non-functional lights
🚦 Traffic - Signal problems, congestion
🏭 Pollution - Air/water/noise pollution
🏗️ Encroachment - Illegal construction
📝 Other - Miscellaneous issues
🔒 Security

Security is a top priority. Please report security vulnerabilities privately to security@civicsetu.com.

See SECURITY.md for our security policies and best practices.

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

👥 Team & Acknowledgments

Built with ❤️ by the CIVIC SETU Team

Special thanks to:

All contributors who helped improve this project
Open source community for amazing libraries and tools
Municipal authorities for their feedback and support
📞 Support & Contact

Documentation: docs.civicsetu.com
Email: support@civicsetu.com
Issue Tracker: GitHub Issues
🗺️ Roadmap

Phase 1 (Current) ✅

✅ Mobile app with report creation
✅ Admin dashboard with management features
✅ Real-time status tracking
✅ Media upload with Cloudinary
Phase 2 (In Progress) 🚧

🔄 Push notifications via FCM
🔄 Advanced map clustering
🔄 Offline mode enhancement
🔄 Multi-language support
Phase 3 (Planned) 📅

📅 ML-based auto-routing
📅 WhatsApp/SMS fallback reporting
📅 Citizen engagement features (voting, comments)
📅 Integration with government APIs
