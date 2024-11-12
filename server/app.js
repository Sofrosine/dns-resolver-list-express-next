const express = require('express');
const cron = require('node-cron');
const {Client} = require("pg");
const cors = require('cors');
const importDomainsAndCheckRecords = require("./utils/dns");
const {domainRoute} = require("./routes/domain_route");

const app = express();
const PORT = 3000;
require('dotenv').config();
app.use(express.json());
app.use(cors());

const getConnection = async () => {
    const client = new Client({
        user: process.env.DATABASE_USERNAME,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
    });
    await client.connect();
    return client;
};



// Create an async function for the routes setup
const setupRoutes = async () => {
    const client = await getConnection(); // Await the connection
    // Run importDomainsAndCheckRecords every minute
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log("Starting scheduled DNS check at...", new Date());
            await importDomainsAndCheckRecords(client);
            console.log("DNS check completed successfully at...", new Date());
        } catch (error) {
            console.error("Error running DNS check:", error);
        }
    });
    const router = express.Router();
    // Use the connection in your route
    app.use('/api/domains', domainRoute(router, client)); // Pass the client directly
};

// Initialize routes
setupRoutes().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to setup routes:", err);
})

module.exports = app;
