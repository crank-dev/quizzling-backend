import express from 'express';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import AuthRoutes from './routes/auth.routes.js';
import cors from 'cors'; // <--- importa o cors

dotenv.config();
const app = express();

async function checkDB() {
    try {
        const [rows] = await db.query("SELECT 1 AS result");
        console.log('[🔥🚀 QUIZZLING API]: Database Working ✔');
        return true;
    } catch (error) {
        console.error('[🔥🚀 QUIZZLING API]: Database connection failed ❌', error);
        process.exit(1);
    }
}

app.use(express.json());

// habilita CORS global (qualquer origem)
app.use(cors());

// rotas
app.use('/api/v1/auth', AuthRoutes);

app.get('/api/v1/welcome', (req, res) => {
    res.send("Welcome to Quizzling API!");
});

const PORT = process.env.PORT || 3007;

(async () => {
    await checkDB();
    app.listen(PORT, () =>
        console.log("[🔥🚀 QUIZZLING API]: Web Server running at: http://localhost:" + PORT + "/api/v1/welcome")
    );
})();
