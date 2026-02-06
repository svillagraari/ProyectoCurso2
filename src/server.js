require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
require("../config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const swaggerDocs = require("./swagger");

//Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
app.use("/api/v1/auth/", require("./routes/auth.route"));
app.use("/api/v1/posts/", require("./routes/posts.route"));
app.use("/api/v1/stories/", require("./routes/stories.route"));
app.use("/api/v1/users", require("./routes/users.route"));
app.use("/api/v1/relationships/", require("./routes/relationships.route"));

// Root route
app.get("/", (req, res) => {
  return res.redirect("/api-docs");
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    swaggerDocs(app, PORT);
  });
}

module.exports = app;
