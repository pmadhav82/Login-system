const express = require ("express");
const router = express.Router();
const Users = require("./user");
const bcrypt = require("bcrypt");
const  session = require("express-session");
const flash = require("connect-flash");

let errorMessages ={};


router.use(session({secret: process.env.SECRET
, resave:true,saveUninitialized:true}))

router.use(flash())





//middleware function to check user is already login or not
let islogin = (req,res,next)=>{
    if(req.session.name){
        res.redirect("welcome")
    }else{
        next()
    }

}



//get routes
router.get("/welcome",(req,res, next)=>{
    if(req.session.name && req.session.email){
res.render("welcome",{
    name:req.session.name,
    email:req.session.email
})
    }else{
        res.redirect("login");
    }
})


router.get("/", islogin, (req,res)=>{
    
res.render("home",{
    message:req.flash('message'),
 
    
});
})

router.get("/login" , islogin, (req,res)=>{
    res.render("login");
})
router.get("/singup", islogin, (req,res)=>{
    res.render("singup");
})
router.get("/reset", islogin, (req,res)=>{
     res.render("reset");
 })




//Singup route
router.post("/singup", async (req,res)=>{
try{

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordRepeat =req.body.repeatpassword;
let foundUser = await Users.findOne({email:email});

if( !foundUser && password == passwordRepeat && password.length>=6){
    let hashPassword = await bcrypt.hash(password, 10);
let newUser = await new Users({
    name:name,
    email:email,
    password:hashPassword
}).save();
req.session.name = newUser.name
req.session.email = newUser.email
res.redirect("welcome")

}else{
    if(password.length<6){
        errorMessages.passLength = "Password need to have minimum 6 characters"
    }if (password!== passwordRepeat){
        errorMessages.passMatch = "Password is not match";
    }
    if (foundUser){
        errorMessages.userExists = "User is exists already"
    }



    res.render("singup",{
        userExists:errorMessages.userExists,
        passLength:errorMessages.passLength,
        passMatch:errorMessages.passMatch,
        name:name,
        email:email,
        
    })
}
}catch(err){
    console.log(err);
}

})

//Login route
router.post("/login", async (req,res)=>{
try{
let foundUser = await Users.findOne({email:req.body.email})

if(foundUser){
    let submitedPass = req.body.password;
    let hashPassword = foundUser.password;
    let matchPassword =  await bcrypt.compare(submitedPass, hashPassword)
    if(matchPassword){
        req.session.name = foundUser.name;
        req.session.email = foundUser.email
      res.redirect("welcome")

    } else{

        res.render("login",{
            message:"Invalid email or passport",
            email:req.body.email
    
        })
    }
    
}else{
    res.render("login",{
        message:"Invalid email or passport",
        email:req.body.email

    })
}

} catch(err){
    console.log(err);
}


})


//logout
router.get("/logout",(req,res)=>{

    req.session.destroy();
    res.redirect("/");
})


//Delete Account
router.get("/deleteAccount", async (req,res)=>{
    try{
      let success = await Users.deleteOne({email: req.session.email});
      if(success){
       req.session.destroy()
res.redirect("/")
      }else{
        res.status(500).send("Something wrong, try again ...")
      }
    }catch(err){
        res.status(500).send("Something wrong, try again ...")
    }
  
})

//reset password
router.post("/reset", async (req,res)=>{
    
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordRepeat =req.body.repeatpassword;
try{
    let user = await Users.findOne({email:email})
    if(user.name == name && user.email == email && password == passwordRepeat && password.length>=6){
let hashPassword = await bcrypt.hash(password, 10);
let success = await Users.updateOne({email:email},{password:hashPassword})
if(success){
    req.flash('message', "Password reset successfully")
res.redirect("/")
}else{
    res.status(500).send("Something wrong, try again ...")
}
    }else{

        if(password.length<6){
            errorMessages.passLength = "Password need to have minimum 6 characters"
        }if (password!== passwordRepeat){
            errorMessages.passMatch = "Password is not match";
        }
        if(user.name !== name || user.email !== email){
            errorMessages.notMatch = "Your credential is not matched"
        }
        res.render("reset",{
            
            passLength:errorMessages.passLength,
            passMatch:errorMessages.passMatch,
            notMatch:errorMessages.notMatch
            
        })
    }

}catch(err){
    console.log("err");
}


})




module.exports = router;