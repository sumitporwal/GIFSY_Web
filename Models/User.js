var mongoose=require('mongoose');
var Schema=mongoose.Schema

const VendorSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    }
})
module.exports=User=mongoose.model('User',VendorSchema);