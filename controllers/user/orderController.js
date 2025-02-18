const Coupon = require('../../models/couponSchema');
const Order =require('../../models/orderSchema');
const Product= require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const User=require('../../models/userSchema');
const Address= require('../../models/addressSchema');



//----------------create order
const createOrder= async(req,res)=>{
    try {
        const id=req.session.user;
        console.log(id);
        const { addressId,paymentMethod, discount, deliveryPrice,orderPrice} = req.body;
        const user=await User.findById(id);
        if(!user){
            console.login("user not found");
            return res.redirect('/');
        }
         //---fetching Cart
         const mycart= await Cart.findOne({userId:id}).populate('items.productId');    
         if (!mycart){
            console.log('No Cart!');
            return res.redirect("/cart");             
         }   
         const orderItems=mycart.items.map(item=>({
             product: item.productId._id, // Product ID
             productName: item.productId.productName,   // Product Name
             productImage:item.productId.productImages[0],
             price: item.productId.regularPrice, // Product Price
             quantity: item.quantity,    // Quantity
             subtotal: item.quantity * item.productId.regularPrice, // Total for item
         }));
         const totalPrice = mycart.totalPrice;
       
        const coupon=null;
        if(req.session.Coupon){
           coupon=req.session.Coupon.code;
        }
        const newOrder = new Order({
            userId:id,
            orderItems,
            totalPrice,
            discount,
            deliveryPrice,
            orderPrice,
            address: addressId,
            paymentMethod,
            invoiceDate: new Date(),
            status: "Placed",
            Coupon:coupon
        });
        await newOrder.save();
        //----reduce stock of product---------------
       for(let item of orderItems){
            console.log(item.quantity)
           updated= await Product.findByIdAndUpdate(item.product,{$inc:{stock:-item.quantity}}, { new: true });            
       }

       //---------------addcoupon to user database-----------
        const usedcoupon=await User.findByIdAndUpdate(id,{$push:{usedCoupons:coupon}})   
        if(usedcoupon){
            console.log("usec coupon added");
        }

        //----------empty the cart------------
        const emptyCart=await Cart.findOneAndDelete({userId:id });
        if(!emptyCart){
            console.log("error while removing Cart items");
        }
        console.log(newOrder);
        res.json({ success: true, orderId: newOrder.orderId, message: "Order placed successfully!" });

       
        
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//---------------succcess order----------
const orderSuccess =async (req,res)=>{
   try {
        const orderId=req.query.id;
        console.log(`orderId:${orderId}`);
        const orderData=await Order.findOne({orderId:orderId});
        if(!orderData){
            console.log("order details not found");
                return res.redirect('/pageNotFound');
        }
        res.render('orderSuccess',{orderData:orderData});
    } catch (error) {
        console.log("error loading order succcessspage");
        res.redirect('/pageNotFound');
   } 
}
//------------------------detailed Order View-----------------
const detailedOrderView =async(req,res)=>{
    try {
        const orderId=req.params.id;
        console.log(orderId);
          const singleOrder=await Order.findOne({orderId:orderId}).populate('userId');// First populate User details
          
        if(!singleOrder){
            console.log(" order not found or error");
            return res.redirect('/profile#orders');
        }
        console.log(singleOrder.address);
        const userAddress=await Address.findOne({userId:singleOrder.userId});       
        userAddress.address.forEach((address)=>{
            if((address._id).toString===(singleOrder.address).toString){
                orderAddress=address;
            }
        })
        
       res.render('detailedOrderView',{order:singleOrder,address:orderAddress});
    } catch (error) {
        console.log("error fetching order details:",error);
        res.redirect("/pageNotFound");
    }
}


//---------------------request for cancellation------
const cancelRequest= async(req,res)=>{
    try {
        const orderId= req.params.id;
        const userId=req.session.user;
        const userOrder= await Order.findOne({orderId:orderId ,userId:userId});
        if(!userOrder){
            console.log(`order ID:${orderId} order not found`);
            res.redirect('/pageNotFound');
        }
        console.log(userOrder.status);
        if(userOrder.status!=='Shipped' && userOrder.status!=='Delivered' && userOrder.status!=='Cancelled' ){
            const changeStatus=await Order.updateOne({orderId:orderId},{$set:{status:'Cancellation Requested'}});
            if(changeStatus.modifiedCount>0){
                console.log("error:cannot request to cancel");
                res.redirect('/profile?tab=orders');
            }
        }else{
            console.log(":Cannot  cancel this order its shipped");
            res.redirect(`/profile/?tab=addresses`);
        }
    } catch (error) {
        console.log("Error in cancellation request",error);
        res.redirect('/pageNotFound');
    }
}


//----------------------track order---------------

const trackOrder= async(req,res)=>{
    try {
        const orderId=req.params .id;
        const selectedOrder= await Order.findOne({orderId:orderId});
        if(!selectedOrder){
            console.log("Not found the Order!");
            res.redirect("/PageNotFound");
        }

        res.render("trackOrder",{order:selectedOrder});
    } catch (error) {
        console.log('tracking order error',error);
        res.redirect('/pageNotFound');
    }
}
module.exports={
    createOrder,
    orderSuccess,
    detailedOrderView,
    cancelRequest,
    trackOrder
}   