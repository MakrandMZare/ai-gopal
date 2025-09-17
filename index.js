import cors from "cors";
import express from "express";
import mariadb from "mariadb";
import userRoutes from "./routes/user.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);

mariadb
  .createConnection(process.env.MARIADB_URI)
  .then(() => {
    console.log("MariaDB connected ");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MariaDB connection error: ", err));
