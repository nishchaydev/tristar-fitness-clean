# TriStar Fitness Backend API

A robust, production-ready backend API for the TriStar Fitness Gym Management System.

## 🚀 Features

### Core Functionality
- **Member Management**: Complete CRUD operations with advanced filtering and pagination
- **Trainer Management**: Trainer profiles, schedules, and session tracking
- **Visitor Management**: Check-in/check-out system for visitors
- **Invoice Management**: Generate, track, and manage invoices with PDF export
- **Session Management**: Personal training session scheduling and tracking
- **Follow-up System**: Automated follow-ups for payments and membership renewals
- **Activity Logging**: Comprehensive audit trail of all system activities
- **Analytics**: Real-time business insights and reporting

### Advanced Features
- **Authentication & Authorization**: JWT-based authentication with role-based access
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed error messages
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Security**: Helmet.js for security headers, CORS protection
- **Logging**: Structured logging with Morgan
- **Health Checks**: Built-in health monitoring endpoints
- **API Documentation**: Self-documenting API with endpoint information

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: morgan
- **Authentication**: JWT (JSON Web Tokens)
- **Data Storage**: In-memory (demo) / Database ready
- **Documentation**: OpenAPI/Swagger ready

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tristar-fitness-clean/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Members
- `GET /api/members` - Get all members (with filtering & pagination)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/expiring/soon` - Get expiring memberships
- `POST /api/members/:id/checkin` - Member check-in
- `POST /api/members/:id/renew` - Renew membership
- `GET /api/members/:id/stats` - Get member statistics

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer
- `POST /api/trainers/:id/checkin` - Trainer check-in
- `POST /api/trainers/:id/checkout` - Trainer check-out

### Visitors
- `GET /api/visitors` - Get all visitors
- `POST /api/visitors/checkin` - Visitor check-in
- `POST /api/visitors/:id/checkout` - Visitor check-out

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/stats` - Get invoice statistics

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `PUT /api/sessions/:id/status` - Update session status

### Follow-ups
- `GET /api/followups` - Get all follow-ups
- `GET /api/followups/:id` - Get follow-up by ID
- `POST /api/followups` - Create new follow-up
- `PUT /api/followups/:id` - Update follow-up
- `DELETE /api/followups/:id` - Delete follow-up
- `PUT /api/followups/:id/status` - Update follow-up status
- `GET /api/followups/pending` - Get pending follow-ups

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity

### Analytics
- `GET /api/analytics` - Get comprehensive analytics

### System
- `GET /health` - Health check
- `GET /api` - API information

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nikhil@tristarfitness.com",
    "password": "owner123"
  }'
```

## 📊 Sample Data

The API comes with comprehensive sample data including:

### Members (5)
- Rahul Sharma (Monthly membership)
- Priya Patel (Quarterly membership)
- Amit Kumar (Annual membership)
- Neha Singh (Monthly membership)
- Vikram Malhotra (Quarterly membership)

### Trainers (3)
- Yash (Strength Training & Bodybuilding)
- Mohit Sen (Cardio & Functional Training)
- Palak Dubey (Yoga & Flexibility)

### Sample Activities
- Member check-ins
- Trainer check-ins
- Invoice generation
- Session scheduling
- Follow-up creation

## 🔍 Advanced Features

### Filtering & Pagination
```bash
# Get members with filters
GET /api/members?status=active&membershipType=monthly&page=1&limit=10

# Search members
GET /api/members?search=rahul&sortBy=name&sortOrder=asc
```

### Member Statistics
```bash
# Get detailed member statistics
GET /api/members/:id/stats
```

### Analytics
```bash
# Get comprehensive analytics
GET /api/analytics
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:5000/health

# Get API info
curl http://localhost:5000/api

# Get members (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/members
```

### Automated Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS
- `JWT_SECRET`: Secret key for JWT tokens
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Returns 429 status code when exceeded

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

## 📈 Performance

### Optimization Features
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Reduces invalid requests
- **Error Handling**: Efficient error responses
- **Logging**: Structured logging for monitoring
- **CORS**: Optimized for frontend integration

### Monitoring
- Health check endpoint
- Request logging
- Error tracking
- Performance metrics

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔄 Database Integration

The current implementation uses in-memory storage for demonstration. For production:

1. **Choose a Database**:
   - PostgreSQL (recommended)
   - MongoDB
   - MySQL

2. **Update Data Layer**:
   - Replace in-memory storage with database queries
   - Add connection pooling
   - Implement migrations

3. **Environment Setup**:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/tristar_fitness
   ```

## 📝 API Documentation

### Request/Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [ ... ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Nishchay Gupta**
- GitHub: [@nishchaygupta](https://github.com/nishchaygupta)
- Email: nishchay@tristarfitness.com

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- The open-source community for various packages
- TriStar Fitness team for requirements and feedback

---

**Made with ❤️ for TriStar Fitness**
