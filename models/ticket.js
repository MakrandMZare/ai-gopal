import dotenv from "dotenv";
import mariadb from "mariadb";

dotenv.config();
const ticketSchema = new mariadb.Schema({
  ticket: {
    id: { type: "int", primaryKey: true, autoIncrement: true },
    title: { type: "String" },
    description: { type: "String" },
    status: { type: "String", default: "TODO" },
    createdBy: { type: mariadb.Schema.Types.ObjectId, ref: "user" },
    assignedTo: {
      type: mariadb.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  priority: String,
  deadline: Date,
  helpfulNotes: String,
  relatedSkills: [String],
  createdAt: { type: "Date", default: "Date.now()" },
  updatedAt: { type: "Date", default: "Date.now()" },
});

export default pool.model("ticket", ticketSchema);
