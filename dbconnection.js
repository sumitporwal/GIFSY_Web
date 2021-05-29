const mongoose=require("mongoose");
const mongoURI='mongodb://localhost:27017/Gifsy';
mongoose.connect(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log("MongoDB Connected"))
.catch(()=>console.log(err));
module.exports=mongoURI;