const Coupon = require('../../models/couponSchema');
const Order =require('../../models/orderSchema');
const Product= require('../../models/productSchema');
const Cart = require('../../models/cartSchema');
const User=require('../../models/userSchema');
const Address = require('../../models/addressSchema');


//---------list orders------------------------------

const loadOrders=async(req,res)=>{
    try {    

            let page=1;
            if(req.query.page){
                page=req.query.page;            
            }
            let limit=5;
            let count=0;         
            let search="";             
                console.log("search query: ",req.query.search);
                 if(req.query.search){
                     search=req.query.search;      
                 
                 }
                   
            let query = {};       
            // Date filter
            if (req.query.dateFrom || req.query.dateTo) {
                query.createdOn = {};
                if (req.query.dateFrom) {
                    query.createdOn.$gte = new Date(req.query.dateFrom);
                }
                if (req.query.dateTo) {
                    query.createdOn.$lte = new Date(req.query.dateTo);
                }
            }

            // ------------- filter -Date-, -status-,-price-,
            if (req.query.status) {
                query.status = { $in: req.query.status.split(',') };
            }

            // Price filter
            if (req.query.minPrice || req.query.maxPrice) {
                query.orderPrice = {};
                if (req.query.minPrice) {
                    query.orderPrice.$gte = parseFloat(req.query.minPrice);
                }
                if (req.query.maxPrice) {
                    query.orderPrice.$lte = parseFloat(req.query.maxPrice);
                }
            }

            console.log("query=",query);
            
            if(Object.keys(query).length !== 0){
                orderData = await Order.find(query)
                .populate('userId', 'name')
                .sort({ createdOn: -1 });

                count = await Order.find(query)
                .populate('userId', 'name')
                .sort({ createdOn: -1 }).countDocuments();
               
            }else{
                
                     orderData=await Order.find({            
                         $or:[
                             {orderId:{$regex:'.*'+search+'.*', $options: 'i'}},
                             
                             {status:{$regex:'.*'+search+'.*', $options: 'i' }}
                         ]
                     }).populate('userId')
                     .sort({createdOn:-1})
                     .limit(limit*1)
                     .skip((page-1)*limit)
                     .exec();
                         
                     count=await Order.find({            
                     $or:[
                         {orderId:{$regex:'.*'+search+'.*',$options: 'i'}},             
                         {status:{$regex:'.*'+search+'.*',$options: 'i'}}
                     ],
                     }).countDocuments();                           
                     
                 
            }   
     
        if(!orderData){
            console.log("no order found");
            res.render('orders',{message:"No order"});
        }
      
        res.render('orders',{orders:orderData,totalPages:Math.ceil(count/limit),currentPage:page});
    } catch (error) {
        console.error("server error",error);
        res.status(500).redirect('/pageError');
    }
}

//---------------------------view an Order---------------
const viewOrder =async(req,res)=>{
    try {
         
        const orderId=req.params.id;
        const orderStatusValues = Order.schema.path("status").enumValues;       
      
        const singleOrder=await Order.findOne({orderId:orderId}).populate('userId');
        if(!singleOrder){
            console.log(" order not found or error");
            return res.redirect('/admin/orders');
        }
        
        const userAddress=await Address.findOne({userId:singleOrder.userId});       
        userAddress.address.forEach((address)=>{
            if((address._id).toString===(singleOrder.address).toString){
                orderAddress=address;
            }
        })
        res.render('changeOrderStatus',{order:singleOrder,address:orderAddress,statusValues:orderStatusValues});
    } catch (error) {
        console.log("error fetching Order Details:",error);
        res.redirect("/pageError");
    }
}
//---------------------------Change status---------------------
const changeOrderStatus =async (req,res)=>{
    try {
        
        const orderId=req.params.id;
        const {changedStatus}= req.body;
        console.log(changedStatus,orderId);
        if(changedStatus==='Cancelled'){
            const orderData= await Order.findOne({orderId:orderId});
            if(!orderData){
                console.log("order not found");
                res.redirect(`/admin/orders/changeOrderStatus/${orderId}`);
            }
            for(let item of orderData.orderItems){
                console.log(item.quantity)
               updated= await Product.findByIdAndUpdate(item.product,{$inc:{quantity:item.quantity}}, { new: true });            
           }           
        }    
         
        const orderData= await Order.findOneAndUpdate({orderId:orderId}, { $set: { status: changedStatus } },{new:true});
        if(!orderData){
            console.log("order Status not changed!");
            return res.json({success:false,message:"order Status not updated!"})
        } 
      
        const orderStatusValues = Order.schema.path("status").enumValues;   
      
        console.log(orderStatusValues);

        res.status(200).json({success:true,changedStatus:changedStatus,statusvalues:orderStatusValues});
        console.log(`order Status  changed to  ! ${changedStatus}`);
    } catch (error) {
        console.log("Error:cannot change status");
        

    }
}


module.exports={
    loadOrders,
    viewOrder,
    changeOrderStatus,
}  