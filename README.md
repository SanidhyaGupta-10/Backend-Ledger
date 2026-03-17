# Backend Ledger API

A robust financial ledger backend API built with Node.js, Express, TypeScript, and MongoDB. This application provides a comprehensive set of features for managing users, accounts, and financial transactions with a strong focus on data integrity through an immutable ledger system.

## Features

- **Authentication & User Management**: Secure user registration and login using JWT (JSON Web Tokens) with a token blacklist for secure logout. Passwords are securely hashed using bcryptjs.
- **Account Management**: Create and manage financial accounts linked to users. Calculates accurate account balances on the fly using MongoDB aggregation over the immutable ledger entries.
- **Idempotent Transactions**: Secure transaction handling between accounts with built-in support for idempotency keys to prevent duplicate transaction processing.
- **Immutable Ledger**: All financial movements (credits and debits) are recorded in a strictly immutable ledger collection using Mongoose middleware to prevent alterations or deletions.
- **Role-Based Access Control**: Differentiates between regular users and system users for privileged operations like creating initial funds.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT for auth, bcryptjs for password hashing
- **Other utilities**: nodemailer for email notifications

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance running

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd 13-Backend-Ledger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=8000
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=your_mongodb_connection_string
   # Add your email configuration variables as well
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive a JWT
- `POST /api/auth/logout` - Securely logout and blacklist the current token

### Accounts
- `POST /api/accounts/` - Create a new account
- `GET /api/accounts/` - Retrieve all accounts for the authenticated user
- `GET /api/accounts/balance/:accountId` - Get the current balance of a specific account

### Transactions
- `POST /api/transactions/` - Create a standard transaction between accounts
- `POST /api/transactions/system/initial-funds` - System-level endpoint to seed an account with initial funds (requires system user privileges)
