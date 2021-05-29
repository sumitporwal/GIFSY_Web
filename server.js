var express=require("express");
var path=require('path');
var bodyParser=require('body-parser');
var cors=require('cors');
var route=require('./Routes/route');
const Port=process.env.PORT||5000;
var connection=require('./dbconnection');
var User=require('./Models/User');
const cookieParser = require('cookie-parser');
var app=express();
var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.set('view engine','ejs');
app.use('/assets', express.static(path.join(__dirname, "./views/assets")));
app.use("/",route);
app.listen(Port,(req,res)=>{
    console.log("server started at port"+Port);
});