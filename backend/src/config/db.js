const sql = require("mssql/msnodesqlv8");

const config = {
  server: "(localdb)\\Vismotor",
  database: "VismotorDB",
  driver: "ODBC Driver 17 for SQL Server", // Ensure you have this driver installed
  options: {
    trustedConnection: true,
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
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
