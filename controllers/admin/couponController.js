const  Coupon = require('../../models/couponSchema');



//----------------show coupons-----------------
const loadCoupon = async(req,res)=>{
    try {
        
        const allCoupons= await Coupon.find({});
        return res.render('coupons',{coupons:allCoupons}); 
        
    } catch (error) {
        return res.redirect('/pageError');
    }
   
}

//-----------------Create coupon------------
const createCoupon =async(req,res)=>{
    try {
     
        const {couponCode,createdOn,expireOn,discountValue,minimumPrice}=req.body;
        console.log(couponCode,createdOn,expireOn,discountValue,minimumPrice);
        const allCoupons= await Coupon.find({});
        const cCode =couponCode.toUpperCase();
        const existingCoupon = await Coupon.findOne({ couponCode:cCode });
        if (existingCoupon) {
            console.log("Coupon Code already exists");
            return res.status(400).render('coupons',{coupons:allCoupons ,message: "Coupon code already exists" });
        }
        
        const createdDate = new Date(createdOn);
        const expireDate = new Date(expireOn);
        const newCoupon =new Coupon({                            
            couponCode:cCode,
            createdOn:createdDate,
            expireOn:expireDate,
            discountValue,
            minimumPrice
       });
     
        const couponAdded = await newCoupon.save();
        if(!couponAdded){
            return res.redirect('/pageError');    
        }
        console.log("coupon Added");
        return res.redirect('/admin/coupons');     
    } catch (error) {
        console.log("error creating coupon",error);
        res.redirect('/admin/pageError');
    }
}


//---------------edit coupon--------------------
const editCoupon= async(req,res)=>{
    try {
        
         const id= req.params.id;
         const findCoupon = await Coupon.findById(id);
         if(!findCoupon){
            console.log(" Coupon not found");
            return res.redirect('/pageError');
         }
        return res.render('editCoupon',{coupon:findCoupon});

    } catch (error) {
        console.log(" Coupon not found",error);
            return res.sataus(500).redirect('/pageError');
    }
}
//----updating coupon-------------
const updateCoupon= async(req,res)=>{
    try {
        const id= req.params.id;
        console.log(id);
        const {couponCode,createdOn,expireOn,discountValue,minimumPrice}=req.body;
        let cCode=couponCode.toUpperCase();
        const createdDate = new Date(createdOn);
        const expireDate = new Date(expireOn);
        const existingCoupon= await Coupon.findOne({couponCode:cCode});
        if(existingCoupon){
           return  res.status(400).render('editCoupon',{coupon:existingCoupon,message:"Coupon Code already  exist please enter another name"});
        }
       const updatedCoupon= await Coupon.findByIdAndUpdate(id,
            {couponCode:cCode,
            createdOn:createdDate,
            expireOn:expireDate,
            discountValue,
            minimumPrice},{new:true});
        if(updatedCoupon)
           return  res.redirect('/admin/coupons');
        else
            res.status(404).json({error:"coupon not found"});

    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
    
}
//------------------delete coupon-----------------
const deleteCoupon=async(req,res)=>{
    try {
        console.log('---------------');
        const id=req.params.id;
        console.log(id);
        const findCoupon = await Coupon.findById(id);
        console.log(findCoupon);
        if(!findCoupon){
            console.log(" Coupon not found");
            return res.redirect('/pageError');
        }
        await Coupon.deleteOne({_id:id});
        
        console.log("coupon Removed successfully");
        return res.redirect('/admin/coupons');
    } catch (error) {
        console.log("Error while deleting  Coupon ",error);
        return res.status(500).redirect('/pageError');
    }
    
    
}




module .exports={
    loadCoupon,
    createCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon
}