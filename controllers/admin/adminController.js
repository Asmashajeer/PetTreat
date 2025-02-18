const User= require('../../models/userSchema');
const mongoose=require('mongoose');
const bcrypt =require('bcrypt');




const loadLogin=async (req,res)=>{
    try {
        if(req.session.admin){
           return res.redirect('    ');
        }
        res.render('adminLogin',{message:null});
    } catch (error) {
        console.log('error loading login page');
    }
}
  const login= async(req,res)=>{
    try {
        const {email,password}=req.body;
        const  admin= await User.findOne({email,isAdmin:true});
        if(admin){
            const passwordMatch= bcrypt.compare(password,admin.password);
            if(passwordMatch){
                req.session.admin=true;
                return res.redirect('/admin');
            }
            else{
               return res.redirect('/login');
            }
        }
        else{
            return res.redirect('/login');
        }
        
    } catch (error) {
        console.log("login eroor",error.message);
        return res.redirect('/admin/pageError');
    }
  }

const loadDashboard=async (req,res)=>{
    try {
        if(req.session.admin){
            res.render('dashBoard');
        }
    } catch (error) {
        console.log('error in dashboard load');
        return res.redirect('/admin/pageError');
    }
    
}
const pageError=async(req,res)=>{
    res.render("pageError");
}



const logOut=async(req,res)=>{
    try {
        req.session.destroy((err=>{
            if(err){
                console.log("Erroe destroying seession",err);
                return res.redirect('/pageError');
            }
            res.redirect('/admin/login');
        }))
    } catch (error) {
        console.log("unexpected error during loggout");
        res.redirect('/pageError');
    }
}
module.exports={
    loadLogin,
    login,
    loadDashboard,
    pageError,
    logOut
}