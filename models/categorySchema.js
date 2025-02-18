const mongoose = require('mongoose'); 
const {Schema}= mongoose;
// Declare the Schema of the Mongo model
const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,       
    },
    description:{
        type:String,
        required:true,       
    },
    isListed:{
        type:Boolean,
        default:true,        
    },
   createdAt:{
        type:Date,
        default:Date.now,      
    },
});



//Export the model
const Category = mongoose.model('Category', categorySchema);
module.exports= Category;