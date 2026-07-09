# User Sign Up and Login Process - Complete Setup Guide

This document provides a comprehensive guide to implementing the user sign up and login process used in the Complaint Management System. It covers both backend and frontend implementation, database schema, email verification, and security features.

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Authentication Flow](#authentication-flow)
6. [Email Verification](#email-verification)
7. [Security Features](#security-features)
8. [Environment Variables](#environment-variables)
9. [Dependencies](#dependencies)

---

## Overview

The authentication system implements:
- **User Registration** with email verification
- **User Login** with JWT token authentication
- **Role-based access control** (user, admin, technician)
- **Email verification** using Nodemailer
- **Password hashing** with bcrypt
- **Session management** using sessionStorage
- **Protected routes** with middleware

---

## Database Schema

### Users Table Structure

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('user','admin','technician') DEFAULT 'user',
  `verification_token` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Key Fields
- `id`: Auto-incrementing primary key
- `email`: Unique email address (used for login)
- `password`: Hashed password (bcrypt)
- `role`: User role (user, admin, technician)
- `verification_token`: Token for email verification
- `is_verified`: Boolean flag for email verification status

---

## Backend Setup

### Project Structure
```
backend/
├── config/
│   └── db.js                    # Database configuration
├── controllers/
│   └── authController.js         # Authentication logic
├── middleware/
│   └── authMiddleware.js         # JWT verification middleware
├── routes/
│   └── authRoutes.js             # Authentication routes
├── utils/
│   └── emailService.js           # Email sending service
├── templates/
│   └── welcome-email.html        # Welcome email template
├── .env                          # Environment variables
└── server.js                     # Main server file
```

### 1. Database Configuration (`backend/config/db.js`)

```javascript
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "complaint_management",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

module.exports = pool;
```

### 2. Authentication Controller (`backend/controllers/authController.js`)

#### Register Function
```javascript
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert user into database
    const result = await query(
      "INSERT INTO users (email, password, name, role, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, name || "User", role || "user", verificationToken, false]
    );

    // Send verification email
    sendVerificationEmail(result.insertId, email, verificationToken);

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      userId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};
```

#### Login Function
```javascript
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const rows = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address || null,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
```

#### Verify Email Function
```javascript
exports.verifyEmail = async (req, res) => {
  try {
    let { token } = req.params;

    // Find user with this token
    const users = await query(
      "SELECT id, email, name, is_verified, verification_token FROM users WHERE verification_token = ?",
      [token]
    );

    if (!users || users.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification token. You may already be verified."
      });
    }

    const user = users[0];

    if (user.is_verified) {
      return res.json({ message: "Email is already verified. You can now login." });
    }

    // Update user: verify and clear token
    await query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    // Send welcome email
    sendWelcomeEmail(user.id, user.email, user.name);

    res.json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};
```

### 3. Authentication Routes (`backend/routes/authRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/change-email", authMiddleware, authController.changeEmail);
router.put("/change-password", authMiddleware, authController.changePassword);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
```

### 4. Authentication Middleware (`backend/middleware/authMiddleware.js`)

```javascript
const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Session expired / invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate user still exists in database
    const rows = await query(
      "SELECT id, role, is_verified FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        message: "Session expired / user not found. Please login again"
      });
    }

    const user = rows[0];

    // Block unverified users
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email first."
      });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired / invalid token" });
  }
};
```

### 5. Email Service (`backend/utils/emailService.js`)

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.sendVerificationEmail = async (userId, userEmail, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const subject = "Verify Your Email Address - Harmony";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering. Please click the button below to verify your email:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      </div>
      <p>If the button doesn't work, paste this link in your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Harmony" <${process.env.SMTP_MAIL}>`,
    to: userEmail,
    subject,
    html,
  });
};

exports.sendWelcomeEmail = async (userId, userEmail, userName) => {
  const subject = "Welcome to Harmony – We're Here to Help You";
  // Read and process welcome email template
  // Send email with template
};
```

### 6. Server Setup (`backend/server.js`)

```javascript
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "../frontend-react/dist")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Frontend Setup

### Project Structure
```
frontend-react/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route protection wrapper
│   ├── hooks/
│   │   └── useAuth.js             # Authentication custom hook
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   └── VerifyEmail.jsx        # Email verification page
│   ├── utils/
│   │   ├── api.js                 # Axios API configuration
│   │   └── authUtils.js           # Authentication utilities
│   └── App.jsx                    # Main app component
├── .env                           # Environment variables
└── package.json                   # Dependencies
```

### 1. Authentication Utilities (`frontend-react/src/utils/authUtils.js`)

```javascript
export const getAuthToken = () => sessionStorage.getItem("token");
export const getAuthRole = () => sessionStorage.getItem("role");
export const getAuthUser = () => JSON.parse(sessionStorage.getItem("user") || "{}");

export const setAuth = (token, role, user) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", role);
  sessionStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(
    new CustomEvent("authChanged", { detail: { token, role, user } })
  );
};

export const clearAuth = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user");
  window.dispatchEvent(
    new CustomEvent("authChanged", {
      detail: { token: null, role: null, user: null }
    })
  );
};

export const isAuthenticated = () => !!getAuthToken();
```

### 2. API Configuration (`frontend-react/src/utils/api.js`)

```javascript
import axios from "axios";

const getApiBaseUrl = () => {
  const baseHost = window.location.hostname;
  const backendPort = import.meta.env.VITE_BACKEND_PORT || 5001;
  return `http://${baseHost}:${backendPort}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.baseURL = getApiBaseUrl();
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/user/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Authentication Hook (`frontend-react/src/hooks/useAuth.js`)

```javascript
import { useState, useCallback } from "react";
import { setAuth, clearAuth, getAuthToken, getAuthRole, getAuthUser } from "../utils/authUtils";
import api from "../utils/api";

export const useAuth = () => {
  const [token, setToken] = useState(getAuthToken());
  const [role, setRole] = useState(getAuthRole());
  const [user, setUser] = useState(getAuthUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, role: newRole, user: userData } = response.data;
      setAuth(newToken, newRole, userData);
      setToken(newToken);
      setRole(newRole);
      setUser(userData);
      return { success: true, role: newRole };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/register", userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setRole(null);
    setUser({});
  }, []);

  return {
    token,
    role,
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };
};
```

### 4. Login Page (`frontend-react/src/pages/Login.jsx`)

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const role = result.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "technician") {
        navigate("/technician/dashboard");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/user/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
```

### 5. Register Page (`frontend-react/src/pages/Register.jsx`)

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [userError, setUserError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUserError("");

    if (formData.password !== formData.confirmPassword) {
      setUserError("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      alert("Registration successful! Please check your email to verify your account.");
      navigate("/user/login");
    } else {
      setUserError(result.error);
    }
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      {error && <div className="error">{error}</div>}
      {userError && <div className="error">{userError}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/user/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;
```

### 6. Email Verification Page (`frontend-react/src/pages/VerifyEmail.jsx`)

```javascript
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const hasCalled = React.useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Connection error. Please check if the server is running.");
      }
    };

    verify();
  }, [token]);

  const handleLogin = () => {
    navigate("/user/login");
  };

  return (
    <div className="verify-container">
      {status === "verifying" && <h2>Verifying your email...</h2>}
      {status === "success" && (
        <div>
          <h2>Email Verified!</h2>
          <p>{message}</p>
          <button onClick={handleLogin}>Go to Login</button>
        </div>
      )}
      {status === "error" && (
        <div>
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <button onClick={handleLogin}>Go to Login</button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
```

### 7. Protected Route Component (`frontend-react/src/components/ProtectedRoute.jsx`)

```javascript
import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authUtils";

const ProtectedRoute = ({ children, requiredRole }) => {
  const authenticated = isAuthenticated();
  const userRole = sessionStorage.getItem("role");

  if (!authenticated) {
    return <Navigate to="/user/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## Authentication Flow

### Registration Flow

1. **User submits registration form**
   - Frontend: `Register.jsx` → `useAuth.register()`
   - API call: `POST /api/auth/register`

2. **Backend processes registration**
   - Validates email and password
   - Hashes password with bcrypt (salt rounds: 10)
   - Generates verification token (32 bytes hex)
   - Inserts user into database with `is_verified = false`
   - Sends verification email via Nodemailer

3. **Email verification**
   - User clicks verification link in email
   - Frontend: `VerifyEmail.jsx` → `GET /api/auth/verify-email/:token`
   - Backend validates token, sets `is_verified = true`
   - Sends welcome email
   - User redirected to login page

### Login Flow

1. **User submits login form**
   - Frontend: `Login.jsx` → `useAuth.login()`
   - API call: `POST /api/auth/login`

2. **Backend processes login**
   - Finds user by email
   - Checks if email is verified
   - Compares password with bcrypt
   - Generates JWT token (expires in 24h)
   - Returns token, role, and user data

3. **Frontend stores session**
   - Stores token in sessionStorage
   - Stores role in sessionStorage
   - Stores user data in sessionStorage
   - Redirects based on role (admin/technician/user)

### Protected Route Access

1. **User attempts to access protected route**
   - Frontend: `ProtectedRoute` component checks authentication
   - Redirects to login if not authenticated

2. **API call with protected route**
   - Request interceptor adds `Authorization: Bearer <token>` header
   - Backend middleware verifies JWT token
   - Middleware checks if user exists and is verified
   - Request proceeds if valid, 401/403 if invalid

---

## Email Verification

### Setup Requirements

1. **SMTP Configuration** (in `.env`)
   - SMTP service (Gmail, Outlook, etc.)
   - SMTP email and password
   - SMTP host and port

2. **Email Templates**
   - Verification email template
   - Welcome email template
   - Located in `backend/templates/`

3. **Verification Process**
   - Token generated during registration
   - Token stored in database
   - Email sent with verification link
   - Link format: `{FRONTEND_URL}/verify-email/{token}`
   - Token cleared after successful verification

---

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Validation**: Minimum 6 characters
- **Comparison**: Never stored in plain text

### JWT Security
- **Secret key**: Stored in environment variable
- **Expiration**: 24 hours
- **Payload**: Contains user ID and role only
- **Verification**: Checked on every protected request

### Email Security
- **Verification tokens**: 32-byte random hex strings
- **Token storage**: Cleared after verification
- **Rate limiting**: Recommended for production

### Session Security
- **Storage**: sessionStorage (cleared on browser close)
- **Token validation**: Checked against database on each request
- **User existence**: Verified on each request
- **Verification status**: Checked on each request

---

## Environment Variables

### Backend `.env` File

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=complaint_management

# Server Configuration
PORT=5001

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (SMTP)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` File

```env
VITE_BACKEND_PORT=5001
```

---

## Dependencies

### Backend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mysql2": "^3.2.0",
    "nodemailer": "^6.9.0"
  }
}
```

Install with:
```bash
npm install bcrypt cors dotenv express jsonwebtoken mysql2 nodemailer
```

### Frontend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-router-dom": "^6.10.0"
  }
}
```

Install with:
```bash
npm install axios react react-router-dom
```

---

## Complete Setup Instructions

### Step 1: Database Setup
1. Create MySQL database: `complaint_management`
2. Run the users table schema SQL
3. Verify table structure

### Step 2: Backend Setup
1. Create backend folder structure
2. Install backend dependencies
3. Configure `.env` file with database and SMTP credentials
4. Create all controller, middleware, route, and utility files
5. Start server: `node server.js`

### Step 3: Frontend Setup
1. Create React app: `npm create vite@latest frontend-react -- --template react`
2. Install frontend dependencies
3. Configure `.env` file with backend port
4. Create all components, pages, hooks, and utility files
5. Start frontend: `npm run dev`

### Step 4: Testing
1. Register a new user
2. Check email for verification link
3. Click verification link
4. Login with verified credentials
5. Test protected routes
6. Test logout functionality

---

## Additional Features

### Profile Management
- Update profile (name, phone, address)
- Change email (requires password)
- Change password (requires current password)

### Account Deletion
- Delete account (requires password)
- Hard delete from database

### Role-Based Access
- User: Basic access
- Admin: Full access
- Technician: Limited access

---

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Use app password for Gmail
   - Check firewall settings

2. **Login fails after verification**
   - Check `is_verified` flag in database
   - Verify JWT secret matches
   - Check token expiration

3. **Protected routes not working**
   - Check token storage
   - Verify middleware implementation
   - Check role assignment

4. **Database connection errors**
   - Check database credentials
   - Verify MySQL is running
   - Check database name

---

## Production Considerations

1. **Security**
   - Use strong JWT secret
   - Enable HTTPS
   - Implement rate limiting
   - Use environment-specific configs

2. **Email**
   - Use production SMTP service
   - Implement email queue
   - Add retry logic

3. **Database**
   - Use connection pooling
   - Implement backups
   - Use read replicas for scaling

4. **Frontend**
   - Implement proper error handling
   - Add loading states
   - Implement proper logging

---

This guide provides a complete reference for implementing the user sign up and login process. Follow the structure and code examples to replicate the authentication system in your project.
