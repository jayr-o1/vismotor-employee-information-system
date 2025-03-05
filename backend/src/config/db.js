const sql = require("mssql/msnodesqlv8");

const config = {
  server: "(localdb)\\Vismotor",  // Name of your LocalDB instance
  database: "VismotorDB",         // Your database name
  driver: "msnodesqlv8",          // Correct driver for LocalDB
  options: {
    trustedConnection: true,     // Use Windows Authentication
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("Database connection failed!", err);
    process.exit(1);  // Exit the process if unable to connect to the database
  });

module.exports = {
  sql,
  poolPromise,
};
