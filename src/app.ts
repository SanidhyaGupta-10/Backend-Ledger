import express from 'express';
import authRoutes from './routes/auth.routes.js'
import cookieParser from "cookie-parser";


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: "Ledger API is online" });
});

app.use("/api/auth", authRoutes);

export default app;