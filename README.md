# ShortLnk

A modern, secure URL shortening service built with Node.js and Express. Transform long URLs into concise, shareable links with user authentication, email verification, and comprehensive link management.

---

## 🌟 Features

- **User Authentication** - Secure registration and login with JWT token-based authentication
- **Email Verification** - Automated email verification for new accounts
- **URL Shortening** - Generate unique short codes for long URLs
- **Link Management** - Create, retrieve, update, and delete shortened links
- **User Dashboard** - Manage all shortened links with a per-user limit
- **Token Refresh** - Automatic token refresh mechanism for extended sessions
- **Security** - Password hashing with bcrypt and secure cookie handling
- **Caching** - In-memory caching for improved performance

---

## 🛠 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for REST API |
| **Prisma** | Modern ORM for database management |
| **PostgreSQL** | Relational database |
| **JWT** | Secure token-based authentication |
| **Bcrypt** | Password encryption and hashing |
| **Nodemailer** | Email service for verification |
| **Node-Cache** | In-memory caching solution |

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sukhrajdev/ShortLnk.git
   cd ShortLnk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file with:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/shortlnk
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**
   ```bash
   npm run server
   ```

The API will be available at `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| POST | `/api/auth/refresh-token` | Refresh JWT token | ✅ |
| POST | `/api/auth/resend-verification-email` | Resend verification email | ✅ |
| GET | `/api/auth/verify-email` | Verify email address | ❌ |

### Link Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/links` | Create new shortened link | ✅ |
| GET | `/api/links` | Get all user's links | ✅ |
| PUT | `/api/links/:LinkCode` | Update link | ✅ |
| DELETE | `/api/links/:LinkCode` | Delete link | ✅ |
| GET | `/:LinkCode` | Redirect to original URL | ❌ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/users` | Get user profile | ✅ |
| PUT | `/api/users` | Update user profile | ✅ |

---

## 🚀 Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@gmail.com",
    "password": "SecurePass123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@gmail.com",
    "password": "SecurePass123"
  }'
```

### Create a Shortened Link
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "originalLink": "https://example.com/very/long/url/path"
  }'
```

### Retrieve All User's Links
```bash
curl -X GET http://localhost:3000/api/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📁 Project Structure

```
ShortLnk/
├── src/
│   ├── controllers/          # Business logic for routes
│   │   ├── auth.controller.js
│   │   ├── link.controller.js
│   │   └── user.controller.js
│   ├── routes/               # Express route definitions
│   │   ├── auth.routes.js
│   │   ├── links.routes.js
│   │   └── user.routes.js
│   ├── middlewares/          # Custom middleware functions
│   │   └── auth.middleware.js
│   ├── services/             # External service integrations
│   │   └── email/
│   │       ├── sendVerificationEmail.js
│   │       └── sendWelcomeEmail.js
│   ├── utils/                # Utility functions
│   │   ├── generateShortCode.js
│   │   └── generateToken.js
│   ├── config/               # Configuration files
│   │   └── prisma.js
│   └── server.js             # Main application file
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── package.json              # Dependencies and scripts
├── prisma.config.ts          # Prisma configuration
└── README.md                 # This file
```

---

## 💾 Database Schema

### User Model
- `id` - Unique identifier (CUID)
- `username` - User's display name
- `email` - Unique email address
- `password` - Hashed password
- `isVerified` - Email verification status
- `max_links` - Maximum allowed links (default: 5)
- `refreshToken` - Stored refresh token
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Link Model
- `id` - Unique identifier (UUID)
- `linkCode` - Unique short code
- `originalLink` - Original long URL
- `userId` - Reference to user (foreign key)
- `createdAt` - Link creation timestamp
- `updatedAt` - Last update timestamp

---

## 🔒 Security Features

- **Password Hashing** - Bcrypt with 10 salt rounds
- **JWT Authentication** - Token-based access control
- **Email Verification** - Validates user identity
- **CORS Support** - Configured for cross-origin requests
- **HTTP-Only Cookies** - Secure cookie handling
- **Input Validation** - Request validation for all endpoints
- **Error Handling** - Comprehensive error messages

---

## 📊 Validation Rules

| Field | Minimum Length | Format |
|-------|---|---|
| Username | 3 characters | Alphanumeric |
| Password | 8 characters | Any |
| Email | - | Valid Gmail address |
| Original URL | - | Valid HTTP/HTTPS URL |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sukhraj Dev**

- GitHub: [@sukhrajdev](https://github.com/sukhrajdev)
- Project: [ShortLnk](https://github.com/sukhrajdev/ShortLnk)

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an [issue](https://github.com/sukhrajdev/ShortLnk/issues) on GitHub.

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated:** January 2026 | **Version:** 1.0.0
