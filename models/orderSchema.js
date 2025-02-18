const mongoose = require('mongoose'); // Erase if already required
const {Schema}=mongoose; 
const { v4: uuidv4 } = require('uuid');

// Declare the Schema of the Mongo model
const orderSchema = new Schema({
    orderId: {
        type: String,
        unique: true,
        default: uuidv4,
    }, 
  userId:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  orderItems:[{
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    productImage:{
        type:String,
        required:true
    },
    
    price:{
        type:Number,
        default:0        
    },
    quantity:{
        type:Number,
        required:true
    },
    subtotal:{
        type:Number,
        required:true
    }
  }],
  totalPrice:{
    type:Number,
    requred:true
  },
  discount:{
    type:Number,
    default:0
  },
  deliveryPrice:{
    type:Number,
    default:0
  },
  orderPrice:{
    type:Number,
    required:true
  },
  address:{
    type:Schema.Types.ObjectId,
    ref:'Address',
    required:true
  },
  paymentMethod:{
    type:String,
    required:true
  },
  invoiceDate:{
    type:Date,
  },
  status:{
    type:String,
    required:true,
    enum:['Placed','Processing','Shipped','Delivered','Cancelled','Return Request',"Returned"]
  },
  createdOn:{
    type:Date,
    default:Date.now,
    required:true
  },
  coupon:{
    type:String,
    default:''
  }
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);
