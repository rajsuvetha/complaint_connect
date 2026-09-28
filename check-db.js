
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const testConnection = async (connString, label) => {
    console.log(`[${label}] Testing: ${connString}`);
    const client = new Client({ connectionString: connString });
    try {
        await client.connect();
        console.log(`[${label}] SUCCESS! Connected.`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`[${label}] FAILED: ${err.message}`);
        return false;
    }
};

(async () => {
    const currentEnv = process.env.DATABASE_URL;
    await testConnection(currentEnv, 'ENV_SETTING');

    // Also test 5432 if 5433 fails
    if (currentEnv.includes('5433')) {
        const altEnv = currentEnv.replace('5433', '5432');
        await testConnection(altEnv, 'ALT_PORT_5432');
    }
})();
