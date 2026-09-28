
import pg from 'pg';
const { Client } = pg;

// Connection details from your env
const user = 'postgres';
const password = 'spY3810'; // Hardcoded based on your .env
const host = 'localhost';
const database = 'complaint_hub'; // The one you want
const defaultDatabase = 'postgres'; // The default system db

async function test(port, dbName) {
    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
    console.log(`\nTesting connection to: ${host}:${port}/${dbName}`);

    // Check for "postgres" user
    const client = new Client({
        user,
        password,
        host,
        port,
        database: dbName
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS: Connected to '${dbName}' on port ${port} with user '${user}'`);

        // If we connected to default 'postgres' db, check if 'complaint_hub' exists
        if (dbName === 'postgres') {
            const res = await client.query("SELECT datname FROM pg_database WHERE datname = $1", [database]);
            if (res.rows.length > 0) {
                console.log(`   --> Database '${database}' EXISTS.`);
            } else {
                console.log(`   --> ❌ Database '${database}' DOES NOT EXIST. You need to create it!`);
            }
        }
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        // Common hint
        if (err.message.includes('authentication failed')) {
            console.log("   --> Double check PASSWORD.");
        }
        if (err.message.includes('does not exist')) {
            console.log(`   --> The database '${dbName}' might not exist.`);
        }
        return false;
    }
}

(async () => {
    console.log("--- Starting Diagnostic ---");

    // 1. Test default 'postgres' DB on 5432 (Standard port)
    await test(5432, defaultDatabase);

    // 2. Test default 'postgres' DB on 5433 (Alternative port)
    await test(5433, defaultDatabase);

    // 3. Test target 'complaint_hub' DB on 5432
    await test(5432, database);

    // 4. Test target 'complaint_hub' DB on 5433
    await test(5433, database);
})();
