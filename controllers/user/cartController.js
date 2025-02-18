const Cart =require('../../models/cartSchema');
const User= require('../../models/userSchema');
const Product =require('../../models/productSchema');

//--------------------show Cart-----------------
const showCart=async(req,res)=>{
   try {
        const userId=req.session.user;
        const user=await User.findById({_id:userId});
        if(!user){
            console.log("user not signed in")
            return res.rdirect('/signIn');
        }
        const myCart= await Cart.findOne({userId:userId}).populate('items.productId');

        if(!myCart){
            
            console.log("cart is empty");
            return res.render('shopingCart');
        }

        res.render('shopingCart',{cart:myCart,user:user});
   } catch (error) {
        console.error("unable fetch from Cart",error);
        res.status(500).redirect('/pageNotFound');
   }
   
}



//-----------------------add to cart---------------
const addToCart =async(req,res)=>{
    try {
        const userId= req.session.user;
        const pId=req.query.id;
       
        const{quantity}=req.body;
        console.log(pId,'--',quantity);
        if (!pId || !quantity) {
            return res.status(400).json({ message: "Missing product details" });
        }
        const findUser= await User.findById({_id:userId});
        if(!findUser){
            console.log('userNotFound')
            return res.status(404).json({message:"user not found"});
        }
        const product=await Product.findOne({_id:pId,isBlocked:false,stock:{$gt:0}});
        if(!product){
            console.log('product rNotFound')
            return res.status(404).json({message:"product not found"});
        }else if(product.stock<quantity){
            console.log('product Out Of Stock')
            return res.status(404).json({message:"product Out Of Stock"});
        }
        const productId=product._id;
       
        let cart=await Cart.findOne({userId}).populate('items.productId');
       
        
        if(!cart){
                cart=new Cart({
                userId:findUser._id,
                items:[{ productId,quantity}],
                totalQty:quantity,
                totalPrice:product.regularPrice*quantity
            });
             await cart.save();
            
        }else{ 
            let itemFound = false;

            for (let item of cart.items) {
                if (item.productId._id.equals(pId)) {  //if item is already in the cart
                    await Cart.updateOne(
                        { userId: userId, 'items.productId': productId },
                        { $inc: { 'items.$.stock': quantity ,totalQty: quantity,totalPrice:product.regularPrice*quantity} }
                    ).then(result => {
                        console.log('updated');
                        itemFound = true;
                    }).catch(error => {
                        console.log("error updating");
                        return res.redirect('/pageNotFound');
                    });
                    break; // Exit the loop once the item is found and updated
                }
            }
                //item not in the cart
            if (!itemFound) {
                cart.items.push({ productId, quantity });
                cart.totalQty+=quantity;
                cart.totalPrice+=product.regularPrice*quantity;
                await cart.save();
            }       
       
        }
        req.session.cart=cart;
        return res.json({success:true,cart});
    } catch (error) {
        console.error("unable to add to Cart",error);
        res.status(500).json({message:'internal server error'})
    }
}
//-------------------remove One item---------------


const removeOne=async(req,res)=>{
  try {
        const userId=req.session.user;
        const id=req.params.id;
        const {quantity}=req.body;
        console.log('---',id,quantity)
        if (!id || !quantity) {
            return res.json({ success: false, message: 'Missing parameters' });
        }
       
        const product= await Product.findById(id);
        
        const cart= await Cart.findOne({userId:userId,
            items:{$elemMatch:{productId:id}}
         });
        
         if(!cart){
            return console.log('product rNotFound in cart')
            return res.status(404).json({message:"product not found in cart "});
         }
        
         await Cart.updateOne({userId:userId,items:{$elemMatch:{productId:id}}},
            {$inc:{'items.$.stock':-quantity,totalQty:-quantity,totalPrice:-product.regularPrice*quantity}})
            .then(result=>{
                console.log(`remove ${quantity} of${product.productName}removed from cart`);
                return res.status(200).json({success:true, message: "cart updated successfully" });
            }).catch(error => {
                console.log("error updating cart");
                return res.status(500).json({ success: false,message: "changes to cart failed", error });
            });
         
    } catch (error) {
        console.error("unable to change to Cart",error);
        res.status(500).json({message:'internal server error'})
    } 
}

//---------------------addOne item to quantityof cart

const addOne=async(req,res)=>{
    try {
          const userId=req.session.user;
          const id=req.params.id;
          const {quantity}=req.body;
          console.log('---',id,quantity)
          if (!id || !quantity) {
              return res.json({ success: false, message: 'Missing parameters' });
          }
         
          const product= await Product.findById(id);
          if(quantity>product.stock){
             console.log("product Out of Stock");
             return res.status(400).json({success: false,message: 'Item is out of stock' }); // Send message in response           
          }
          
          const cart= await Cart.findOne({userId:userId,
              items:{$elemMatch:{productId:id}}
           });
          
           if(!cart){
              console.log('product rNotFound in cart')
              return res.status(404).json({message:"product not found in cart "});
           }
          
           await Cart.updateOne({userId:userId,items:{$elemMatch:{productId:id}}},
              {$inc:{'items.$.stock':quantity,totalQty:quantity,totalPrice:product.regularPrice*quantity}})
              .then(result=>{
                  console.log(`add ${quantity} of${product.productName}to cart`);
                  return res.status(200).json({success:true, message: "cart updated successfully" });
              }).catch(error => {
                  console.log("error updating cart");
                  return res.status(500).json({ success: false,message: "changes to cart failed", error });
              });
           
      } catch (error) {
          console.error("unable to change to Cart",error);
          res.status(500).json({message:'internal server error'})
      } 
  }

//------------------delete item FromCart---------------

const deleteFromCart=async(req,res)=>{
  try {
        const userId=req.session.user;
        console.log(userId);
        const productIdToDelete= req.params.id;
    
        const product=await Product.findById(productIdToDelete);
        if(!product){
            console.log("product T Delete  not found in productList");
           return res.redirect('/shopingCart');
        }
                 
        const userCart= await Cart.findOne({userId:userId});
        if(!userCart){
            console.log(" user Cart not Found");
            return res.redirect('/shopingCart');
        }
        console.log('-------------------');
        const itemToDelete=userCart.items.find(item=>item.productId.toString()===productIdToDelete);
              deletedQuantity = itemToDelete.quantity;
              reducedPrice = deletedQuantity * product.regularPrice;    
                   
              const deletedProduct = await Cart.updateOne({userId:userId},
                    {   $pull:{items:{productId:productIdToDelete}},
                        $inc:{totalQty:-deletedQuantity,totalPrice:-reducedPrice}
                    }
                    ); 
                console.log('-////-----------');
                if(deletedProduct.modifiedCount>0){
                    console.log("product deleted from cart");
                     return res.redirect('/shopingCart');
                }else{
                    console.log("product cannot  remove from cart");
                }       
            
    }catch (error) {
      console.error("server error while deleting",error);
      res.redirect('/pageNotFound');
    }  

  
}


module.exports={
    showCart,
    addToCart,
    removeOne,
    addOne,
    deleteFromCart
}