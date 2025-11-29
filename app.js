const express = require("express");
const app = express();

require("dotenv").config();

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const shoppingRoutes = require("./routes/shopping");
const connectDB = require('./utils/mongodb');
connectDB();
const passport = require('./config/passport');
const session = require('express-session');

const errorHandler = require("./middleware/error-handler");

app.use(session({
  secret: process.env.SESSION_SECRET || 'shopping-list-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root
app.use("/", indexRoutes);

// auth
app.use("/auth", authRoutes);

// users
app.use("/users", userRoutes);

// shopping lists
app.use("/shoppinglist-main/:awid", shoppingRoutes);

// health
app.get("/sys/health", (req, res) => 
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// error handler (must be last)
app.use(errorHandler);

// START SERVER (missing part - fixed)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
