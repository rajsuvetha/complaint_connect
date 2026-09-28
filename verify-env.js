
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const run = async () => {
    const connectionString = process.env.DATABASE_URL;
    console.log(`Connecting using ENV: ${connectionString}`);

    if (!connectionString) {
        console.error("❌ DATABASE_URL is missing from .env");
        return;
    }

    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("✅ SUCCESS: Connected successfully using .env configuration!");
        await client.end();
    } catch (err) {
        console.error("❌ FAILURE:", err.message);
    }
};

run();
