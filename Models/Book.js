var mongoose=require('mongoose');
var Schema=mongoose.Schema

const UserSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true,  
    },
    publication:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    }

});
module.exports=Book=mongoose.model('Book',UserSchema);