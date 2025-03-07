const mongoose = require('mongoose'); // Erase if already required
const {Schema}= mongoose;
const referralSchema = new Schema({
    refererId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,        
    },
    refereeId:[{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,        
    }],
  
    addedOn:{
        type:Date,
        default:Date.now,
    }
    
   
});

module.exports=mongoose.model('Referral',referralSchema);