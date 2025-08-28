import express from 'express';
import dotenv from 'dotenv';
import { db } from './config/db.js';

dotenv.config();
const app = express();

async function checkDB(): Promise<boolean> {
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

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Welcome to Quizzling API!");
});

const PORT = process.env.PORT || 3007;

(async () => {
    await checkDB();
    app.listen(PORT, () =>
        console.log("[🔥🚀 QUIZZLING API]: Web Server running at: http://localhost:" + PORT)
    );
})();
