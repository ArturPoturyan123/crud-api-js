const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product.model.js");
const productRoute = require("./routes/product.route.js");

const app = express();

//middleware
app.use(express.json());
//app.use(express.urlencoded({extended: true}))

// app.get("/", (req, res) => {
//     res.send("Hello world")
// });

//routes
app.use("/api/products", productRoute);

mongoose
  .connect(
    "mongodb+srv://hamletgalstyan20:RekYNAPOiuXMXY7f@nodedbapi.qpuz730.mongodb.net/nodeDBApi?retryWrites=true&w=majority&appName=nodeDBApi"
  )
  .then(() => {
    console.log("connected to databse");
    app.listen(3000, () => {
      console.log("servers is running on port 3000");
    });
  })
  .catch(() => {
    console.log("connection failed");
  });
