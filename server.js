import express from "express";
import connectDB from "./config/db.js";
import userRouter from "./routes/users.route.js";
import followRouter from "./routes/follow.route.js";

const app = express();
const port = 3200;

connectDB();

app.use(express.json());

app.use("/user", userRouter);
app.use("/user", followRouter);

app.listen(port, () => console.log(`serving listening on port ${port}!`));
