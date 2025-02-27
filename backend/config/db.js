const sql = require("mssql");

// Database configuration
const config = {
  server: "(localdb)\\Vismotor", // Default LocalDB instance
  database: "VismotorDB",
  authentication: {
    type: "default",
  },
  options: {
    encrypt: false, // Set to 'true' only for Azure
    trustServerCertificate: true, // Required for self-signed certificates
  },
};

// Create a connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect()
  .then(() => console.log("✅ Database Connected Successfully!"))
  .catch((err) => console.error("❌ Database Connection Failed:", err));

// Export the pool and poolConnect for use in other files
module.exports = {
  pool,
  poolConnect,
};
