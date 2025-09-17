import dotenv from "dotenv";
import mariadb from "mariadb";

dotenv.config();
const userSchema = new mariadb.Schema({
  user: {
    id: { type: "int", primaryKey: true, autoIncrement: true },
    name: { type: "String", require: true },
    email: { type: "String", require: true, unique: true },
    password: { type: "String", require: true },
    role: {
      type: "String",
      default: "user",
      enum: ["user", "admin", "client"],
    },
    skills: [String],
    createdAt: { type: "timestamp", default: "CURRENT_TIMESTAMP" },
    updatedAt: { type: "timestamp", default: "CURRENT_TIMESTAMP" },
  },
});

export default pool.model("user", userSchema);
