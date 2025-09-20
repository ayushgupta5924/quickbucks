# QuickBucks Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start MongoDB
```bash
# Using MongoDB locally
mongod

# Or use MongoDB Atlas cloud database
```

### 4. Run Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task (supports natural language)
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `DELETE /api/tasks/:id` - Delete task

### Analytics
- `GET /api/analytics/stats` - Get user statistics
- `GET /api/analytics/insights` - Get AI-powered insights
- `GET /api/analytics/patterns` - Get productivity patterns

## Features

### Enhanced AI Processing
- **Natural Language Processing**: Advanced text parsing using Natural.js
- **Pattern Recognition**: Behavioral analysis and trend identification
- **Predictive Analytics**: Task completion likelihood prediction
- **Personalized Insights**: Tailored productivity recommendations

### Database Schema
- **Users**: Authentication, preferences, wallet
- **Tasks**: Complete task management with AI categorization
- **Indexes**: Optimized queries for analytics

### Security
- JWT authentication
- Password hashing with bcrypt
- Protected routes with middleware

## Technology Stack
- **Node.js + Express**: RESTful API server
- **MongoDB + Mongoose**: Database and ODM
- **Natural.js**: Advanced NLP processing
- **JWT**: Secure authentication
- **bcryptjs**: Password encryption