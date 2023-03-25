const createError = require("http-errors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
require("./models/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const io = require("./utils/socket")(server);
const port = process.env.PORT || 3001;

//socket
// io.on("connection", (socket) => {
//   console.log("user connected");
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });
module.exports = io;
//route
const indexRouter = require("./routes/index");
const vouchersRouter = require("./routes/vouchers")(io);
const randomRouter = require("./routes/random");
const campaignRouter = require("./routes/campaign");
const gameRouter = require("./routes/game");
const categoryRouter = require("./routes/category");
const counterpartRouter = require("./routes/counterpart");
const puzzleRouter = require("./routes/puzzle");
const employeeRouter = require("./routes/employee");
const historyRouter = require("./routes/history");
const statisticRouter = require("./routes/statistic");
const notificationRouter = require("./routes/notification");
const storeRouter = require("./routes/store");
const searchRouter = require("./routes/search");
const paymentRouter = require("./routes/payment");
const campaignAdminRouter = require("./routes/admin/campaign");
const userAdminRouter = require("./routes/admin/user");
const counterpartAdminRouter = require("./routes/admin/counterpart");
const storeAdminRouter = require("./routes/admin/store");
const statisticAdminRouter = require("./routes/admin/statistic");
const searchAdminRouter = require("./routes/admin/search");
const paymentAdminRouter = require("./routes/admin/payment");
const notificationAdminRouter = require("./routes/admin/notification");
const puzzleAdminRouter = require("./routes/admin/puzzle");
const userjoinRouter = require("./routes/userjoin");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const base = "/api";
const baseAdmin = "/api/admin";

app.use(base + "/", indexRouter);
app.use(base + "/vouchers", vouchersRouter);
app.use(base + "/random", randomRouter);
app.use(base + "/campaigns", campaignRouter);
app.use(base + "/games", gameRouter);
app.use(base + "/category", categoryRouter);
app.use(base + "/counterparts", counterpartRouter);
app.use(base + "/puzzle", puzzleRouter);
app.use(base + "/employees", employeeRouter);
app.use(base + "/history", historyRouter);
app.use(base + "/statistics", statisticRouter);
app.use(base + "/notification", notificationRouter);
app.use(base + "/stores", storeRouter);
app.use(base + "/search", searchRouter);
app.use(base + "/payment", paymentRouter);
app.use(base + "/userjoin", userjoinRouter)

//admin router
app.use(baseAdmin + "/campaigns", campaignAdminRouter);
app.use(baseAdmin + "/users", userAdminRouter);
app.use(baseAdmin + "/counterparts", counterpartAdminRouter);
app.use(baseAdmin + "/stores", storeAdminRouter);
app.use(baseAdmin + "/statistics", statisticAdminRouter);
app.use(baseAdmin + "/search", searchAdminRouter);
app.use(baseAdmin + "/payment", paymentAdminRouter);
app.use(baseAdmin + "/notification", notificationAdminRouter);
app.use(baseAdmin + "/puzzles", puzzleAdminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
