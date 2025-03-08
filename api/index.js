const express = require("express");
const cors = require("cors");
const authRoutes = require("../src/controllers/auth/routes/routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(authRoutes);

module.exports = app;
