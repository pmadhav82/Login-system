require("dotenv").config()
const express = require("express");
const handlebars = require("express-handlebars");
const PORT = process.env.PORT || 8000
const mongoose = require("mongoose");
const route = require("./route");
const app = express();




app.use(express.urlencoded({extended:true}))

//database connection

mongoose.connect(process.env.MONGO_URL);
let db = mongoose.connection;
db.once("open",()=>{
    console.log("connect successfully..");
})
db.on("error",()=>{
    console.log("error occured..")
})

//router connection
app.use("/", route);



//uses of public folder
app.use(express.static("public"))

//init handlebars
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");


app.listen(PORT,()=>console.log(`Server is running on ${PORT}`))
