const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use("/api/boards", require("./routes/board.routes"));
app.use("/api/auth", require("./routes/auth.Routes"));
