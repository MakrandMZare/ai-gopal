import cors from "cors";
import express from "express";
import mariadb from "mariadb";
import ticketRoutes from "./routes/ticket.js";
import userRoutes from "./routes/user.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

mariadb
  .createConnection(process.env.MARIADB_URI)
  .then(() => {
    console.log("MariaDB connected ");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MariaDB connection error: ", err));
