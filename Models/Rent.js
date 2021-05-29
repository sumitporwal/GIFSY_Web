var mongoose=require('mongoose');
var Schema=mongoose.Schema

const UserSchema=new Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Student',
        required:true
    },
    book:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Book',
        required:true,  
    },
    start_date:{
        type:String,
        required:true
    },
    due_date:{
        type:String,
        required:true
    },
});
module.exports=Rent=mongoose.model('Rent',UserSchema);
