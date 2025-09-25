# Personal Finance Assistant

## Project Overview

The Personal Finance Assistant is a comprehensive full-stack web application designed to provide users with robust financial tracking and management capabilities. The application features an intuitive interface for managing income and expenses, transaction categorization, and data visualization through analytical charts and reports.

## Core Functionality

### Transaction Management
- Complete CRUD operations for income and expense entries
- User-friendly interface for transaction management
- Real-time data updates and validation

### Data Visualization
- Interactive charts displaying expense breakdowns by category
- Temporal analysis of spending patterns
- Comprehensive financial summaries and insights

### Historical Data Analysis
- Advanced filtering capabilities for transaction history
- Customizable date range selection
- Export functionality for financial reports

### Automated Data Entry
- OCR-powered receipt processing for automatic expense entry
- Supports for image receipt formats
- Intelligent data extraction and categorization

## Bonus & Advanced Features

### Multi-User Architecture
- Secure user authentication and authorization
- Individual user account isolation
- Privacy-focused data management

### Performance Optimization
- Paginated API responses for efficient data handling
- Optimized database queries
- Scalable architecture design


## Technology Stack

### Frontend
- **Framework**: React 18 with Vite build tool
- **Styling**: CSS3 with modern responsive design
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JSON Web Tokens (JWT)

### Additional Libraries
- **OCR Processing**: Tesseract.js
- **Security**: bcrypt for password hashing
- **Validation**: Express-validator

## Architecture Overview

### Backend Architecture
```
Backend/
├── config/
│   └── db.js                     # Database configuration and connection
├── controllers/
│   ├── authController.js         # Authentication logic
│   ├── transactionController.js  # Transaction CRUD operations
│   ├── categoryController.js     # Category management
│   ├── analyticsController.js    # Data analytics processing
│   └── receiptController.js      # OCR and receipt processing
├── middleware/
│   └── authMiddleware.js         # JWT authentication middleware
├── models/
│   └── createTables.js           # Database schema initialization
├── routes/
│   ├── authRoutes.js             # Authentication endpoints
│   ├── transactionRoutes.js      # Transaction API routes
│   ├── categoryRoutes.js         # Category management routes
│   ├── analyticsRoutes.js        # Analytics data endpoints
│   └── receiptRoutes.js          # Receipt processing endpoints
└── server.js                     # Application entry point
```

### Frontend Architecture
```
Frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/Dashboard.jsx     # Main dashboard component
│   │   ├── Auth/
│   │   │   ├── Login.jsx              # User authentication
│   │   │   └── Register.jsx           # User registration
│   │   ├── Transactions/Transactions.jsx # Transaction management
│   │   ├── Analytics/Analytics.jsx       # Data visualization
│   │   ├── Receipt/ReceiptUpload.jsx     # File upload interface
│   │   └── Layout/
│   │       ├── Header.jsx              # Navigation header
│   │       └── Sidebar.jsx             # Application sidebar
│   ├── context/
│   │   └── AuthContext.jsx             # Global authentication state
│   ├── App.jsx                         # Root application component
│   └── main.jsx                        # Application entry point
└── index.html                          # HTML template
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Transaction Management
- `GET /api/transactions` - Retrieve paginated transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update existing transaction
- `DELETE /api/transactions/:id` - Remove transaction

### Analytics Endpoints
- `GET /api/analytics/summary` - Financial summary data
- `GET /api/analytics/categories` - Category-based analysis
- `GET /api/analytics/trends` - Temporal spending analysis

## Database Schema

### Users Table
- Primary key: `user_id`
- Fields: username, email, password_hash, created_at

### Transactions Table
- Primary key: `transaction_id`
- Foreign key: `user_id`
- Fields: amount, category, description, date, type (income/expense)

### Categories Table
- Primary key: `category_id`
- Fields: name, description, color_code

## Installation and Setup

### Prerequisites
- Node.js (version 18.0 or higher)
- npm or yarn package manager
- MySQL database server
- Git version control

### Backend Setup

In a new terminal, navigate to the Backend directory and follow these steps.

# 1. Go to the backend directory
cd Backend

# 2. Install all required dependencies
npm install

# 3. Set up environment variables
#    Create a .env file and add your database credentials and a JWT secret.
#    You can copy the example file to get started:
cp .env.example .env

# 4. Create the necessary database tables by running the setup script
node models/createTables.js

# 5. Start the development server
npm start


### Frontend Setup

Open a new terminal window, navigate to the Frontend directory, and follow these steps.

# 1. Go to the frontend directory
cd Frontend

# 2. Install all required dependencies
npm install

# 3. Start the development server
npm run dev


## Development Features

### Code Quality
- ESLint configuration for consistent code style
- Modular architecture with separation of concerns
- Comprehensive error handling and validation
- Security best practices implementation

### Testing Considerations
- Structured codebase for unit testing implementation
- API endpoints designed for integration testing
- Component isolation for frontend testing

## Production Readiness

### Security Features
- JWT-based stateless authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Input validation and sanitization

### Performance Optimizations
- Database connection pooling
- Pagination for large datasets
- Efficient query optimization
- File upload size limitations

## Future Enhancements
- Comprehensive test suite implementation
- Docker containerization
- CI/CD pipeline configuration
- Advanced reporting features

## Technical Specifications

- **Node.js Version**: 18.x LTS
- **Database**: MySQL 8.0+
- **Browser Support**: Modern browsers (ES6+ support)
- **API Standard**: RESTful architecture
- **Authentication**: JWT with 24-hour expiration

This project demonstrates proficiency in full-stack development, modern JavaScript frameworks, database design, API development, and implementation of advanced features such as OCR processing and data visualization.