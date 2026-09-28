
import pg from 'pg';
const { Client } = pg;

const tryConnect = async (host, port) => {
    const connectionString = `postgresql://postgres:spY3810@${host}:${port}/complaint_hub`;
    console.log(`Trying to connect to: ${connectionString}`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`Successfully connected to ${host}:${port}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed to connect to ${host}:${port}: ${err.message}`); // Changed from console.error to console.log to avoid alarming red output
        return false;
    }
};

(async () => {
    // Try 'base' first just in case
    await tryConnect('base', 5433);

    // Try 'localhost' on 5433
    await tryConnect('localhost', 5433);

    // Try 'localhost' on 5432 (default)
    await tryConnect('localhost', 5432);
})();
