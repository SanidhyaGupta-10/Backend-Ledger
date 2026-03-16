import "dotenv/config";
import app from './src/app.js';
import { connectToDB } from './src/config/db.js';
const PORT = process.env.PORT || 8000;
connectToDB();
app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
