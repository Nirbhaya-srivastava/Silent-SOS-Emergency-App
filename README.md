# 🚨 Silent SOS Emergency App

A full-stack emergency alert platform designed to help users quickly send an SOS alert and share their emergency status and location with registered emergency contacts.

The application provides a simple interface for triggering an emergency alert while managing users, emergency contacts, alert history, authentication, and notification services.

## ✨ Features

* 🚨 **One-Tap SOS Alert** — Quickly trigger an emergency alert.
* 📍 **Live Location Sharing** — Share the user's current location during an emergency.
* 👥 **Emergency Contacts** — Add, manage, and store trusted emergency contacts.
* 📧 **Email Notifications** — Send emergency notifications to registered contacts.
* 🔔 **Alert Status Tracking** — Track the status and progress of SOS alerts.
* 📜 **Alert History** — View previous emergency alerts and activity.
* 🔐 **User Authentication** — Secure registration and login functionality.
* 👨‍💼 **Admin Dashboard** — Manage and monitor application data.
* 🛡️ **Protected API Routes** — Authentication middleware protects sensitive backend endpoints.
* 🗄️ **MongoDB Integration** — Store users, contacts, and emergency alert data.

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript / JSX
* CSS

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* MongoDB / Mongoose

### Development Tools

* Git
* GitHub
* Visual Studio Code
* npm

## 📂 Project Structure

```text
Silent-SOS-Emergency-App/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       └── index.js
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── .gitignore
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nirbhaya-srivastava/Silent-SOS-Emergency-App.git
```

Navigate into the project:

```bash
cd Silent-SOS-Emergency-App
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create the required environment files locally.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If notification services are enabled, configure their required API credentials as well.

> ⚠️ Never commit `.env` or `.env.local` files to GitHub. Keep API keys, database credentials, authentication secrets, and other sensitive information private.

### 5. Start the Application

Start the frontend:

```bash
npm run dev
```

Start the backend from the `backend` directory using the backend's configured start command.

The application can then be opened in your browser using the local URL displayed by Vite.

## 🔐 Security

This project uses several security practices, including:

* JWT-based authentication
* Protected backend routes
* Environment variables for sensitive configuration
* `.gitignore` protection for local secrets
* Authentication middleware
* Server-side request validation

## 📡 API Functionality

The backend provides REST API functionality for areas such as:

* Authentication
* User management
* Emergency contacts
* SOS alerts
* Alert history
* Administrative operations
* Notification services

## 🚨 Emergency Alert Flow

```text
User
  │
  ▼
Press SOS Button
  │
  ▼
Create Emergency Alert
  │
  ├──► Capture Location
  │
  ├──► Store Alert
  │
  └──► Notify Emergency Contacts
              │
              ▼
       Alert Status Tracking
```

## 🎯 Project Objectives

The main objectives of this project are to:

* Provide a fast and accessible emergency alert mechanism.
* Simplify emergency contact management.
* Enable location-based emergency information sharing.
* Provide centralized alert history and status tracking.
* Demonstrate full-stack web development using React and Node.js.
* Build a RESTful backend with authentication and database integration.

## 🔮 Future Improvements

Potential future enhancements include:

* 📱 Progressive Web App / mobile application support
* 📞 Automated emergency phone calls
* 💬 SMS notification integration
* 🗺️ Improved real-time location tracking
* 🔴 Real-time alert updates using WebSockets
* 🔔 Push notifications
* 🧭 Integration with mapping services
* ☁️ Cloud deployment and monitoring
* 📊 Advanced analytics for administrators

## 💡 What I Learned

Through this project, I worked with:

* React component development
* Vite-based frontend development
* Node.js and Express REST APIs
* MongoDB database integration
* JWT authentication
* Middleware and API security
* CRUD operations
* Emergency notification workflows
* Git and GitHub version control
* Full-stack project structure and deployment concepts

## 👨‍💻 Author

**Nirbhaya Srivastava**

GitHub:
https://github.com/Nirbhaya-srivastava

## 📄 License

This project is intended for educational and portfolio purposes.