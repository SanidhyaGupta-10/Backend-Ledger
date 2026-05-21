import express from 'express';
import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/account.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import cookieParser from "cookie-parser";
import cors from 'cors';


const app = express();

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: "Ledger API is online" });
});

app.get('/health', (req, res) => {
  res.json({ message: "Ledger API is working correctly" });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;