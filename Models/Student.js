var mongoose=require('mongoose');
var Schema=mongoose.Schema

const UserSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    class:{
        type:String,
        required:true,  
    },
    photo:{
        type:Object,
        required:true
    },
   /* video:{
        type:String,
        required:true
    },*/
});
module.exports=Student=mongoose.model('Student',UserSchema);
