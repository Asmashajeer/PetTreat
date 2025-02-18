
const nodemailer =require('nodemailer');
const bcrypt= require('bcrypt');
const env =require('dotenv').config();


//-------------secure Password----------
const securePassword= async(password)=>{
    try{
         const secPassword=await bcrypt.hash(password,10)
         return secPassword;
        
    } catch (error) {
        console.log("ERROR WHILE HASHING OF PASSWORD");
        return false;
    }

    }

function generateOtp(){
    return String(Math.floor(100000 + Math.random() *900000));
}

//--------to send email verification-----------
const sendVerificationEmail=async function(email,otp){
    try{
        const transporter =nodemailer.createTransport({
             host:'smtp.gmail.com',
             port:587,
             secure:false,
            //  require:true,
             auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASSWORD
             }
        })
            
        
        const info = await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:'Verify your account',
            text:`Your OTP is ${otp}`,
            html:`<p>Your OTP:${otp}</p>`
             });
            return info.accepted.length>0
    }
    catch(error){
        console.log(`Error sending email`);
        return false;
    }
}



module.exports={
    generateOtp,
    sendVerificationEmail,
    securePassword
}
