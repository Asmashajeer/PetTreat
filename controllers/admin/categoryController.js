const Category = require('../../models/categorySchema');


//---------------category information-------
const categoryInfo= async (req,res)=>{
    try {
        const page=req.query.page||1;
        const limit=4;
        const skip=(page-1)*limit;

        const categoryData=await Category.find({})
        .sort({createsAt:1})
        .skip(skip)
        .limit(limit);


        const totalCategories=await Category.countDocuments();
        const totalPages= Math.ceil(totalCategories/limit);
        res.render('category',{data:categoryData,currentPage:page,totalPages:totalPages,totalCategories:totalCategories});

    } catch (error) {
        console.log("Error while fetching categories ");
        res.redirect('/pageError');
    }
}


//-----------------add a new catogory-------------------
const addCategory=async(req,res)=>{
    try {   

        const {name,description}= req.body;
        let cname = name.toUpperCase();  
        console.log(cname);
        let findCategory= await Category.findOne({name:cname});
        if(findCategory){
            return res.status(400).json({error:'Category already exist'});            
        }
        let newCategory= new Category({
            name:cname,
            description
        });
        await newCategory.save();
        res.status(200).json ({message:"Category Added successfully  "});

        
    } catch (error) {
        res.status(500).json({error:'Internal server error'});
        
    }
}


//-------------------list a catogory=-----------------
const listCategory= async (req,res)=>{
   
        try {
            const id=req.query.id;
           
            const updateResult=await Category.updateOne({_id:id},{$set:{isListed:true}});
            if (updateResult)
                { console.log("Success: Category updated"); 
    
                 } else { 
                        console.log("Error: Category not found"); 
                }
           res.redirect('/admin/category');
        } catch (error) {
           console.log(`error while listing`);
           res.redirect('/pageError');
        }
}


//-------------------Unlist a catogory-----------------
const unlistCategory= async(req,res)=>{
    try {
        const id=req.query.id;
        console.log(  "categoryid  "+id);
        const updateResult=await Category.updateOne({_id:id},{$set:{isListed:false}});
        if (updateResult)
            { console.log("Success: Category updated"); 

             } else { 
                    console.log("Error: Category not found"); 
            }
       res.redirect('/admin/category');
    } catch (error) {
       console.log(`error while unlisting`);
       res.redirect('/pageError');
    }
}




//---------------edit category-----------------

const getEditCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        
        const category = await Category.findOne({_id:id});
        if(category){
                
            res.render('editCategory',{category:category});
        }else{
             console.log(`Error while fetching`);
        }
    } catch (error) {
        console.log(`error while fetching`);
        res.redirect('/pageError');
    }
}


const updateCategory= async(req,res)=>{
    try {
        const id= req.params.id;
        const{name,description}=req.body;
        let cname=name.toUpperCase();
        const existingCategory= await Category.findOne({name:cname});
        if(existingCategory){
           return  res.status(400).render('editCategory',{category:existingCategory,message:"category exist please enter another name"});
        }
       const updated= await Category.findByIdAndUpdate(id,{name:cname,description:description},{new:true});
        if(updated)
            res.redirect('/admin/category');
        else
            res.status(404).json({error:"category not found"});

    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
    
}
module.exports={
    categoryInfo,
    addCategory,
    listCategory,
    unlistCategory,
    getEditCategory,
    updateCategory
   
}