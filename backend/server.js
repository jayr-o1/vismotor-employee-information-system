const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/controllers/auth/routes/routes");

const app = express();
const PORT = 5000;

// Allow requests from the frontend
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});