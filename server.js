const express = require("express");
const app = express();
const db = require('./config/db.js');
const port = 3200;
const userRouter = require('./routes/users.route.js');
const followRouter = require("./routes/follow.route.js");

db();


app.use(express.json());

app.use("/user", userRouter);
app.use("/user", followRouter);


app.listen(port, () => console.log(`serving listening on port ${port}!`));
