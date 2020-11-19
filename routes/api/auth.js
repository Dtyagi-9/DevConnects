const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')


//@route    GET api/auth
//@desc     User authentication
//@access   Public
router.get('/',auth,async (req,res)=>{
    try{
        //we can use req.user.id coz in middleware we have set the req.user to be the decoded user from jwt
        const user = await User.findById(req.user.id).select('-password');
        //select('-password') is used to delete the password from the json
        res.json(user);

    }catch(e){

    }
    //res.send("Auth Routes working")
})


//@route    POST api/auth
//@desc     Authenticate User & get Auth token
//@access   Public
router.post('/',[
    //check middleware
    check('email','Please include a valid email').isEmail(),
    check('password','Password is required !').exists()
    ],async (req,res)=>{
    const errors = validationResult(req);
    //if there are errors
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;

    try{
        //assigning const will give the assignment to constant variable error
        let user = await User.findOne({email});

        if(!user){
            res.status(400).json({errors:[{msg:"Invalid credentials"}]});
        }
        
        //check if password matches 
        const isMatch = await bcrypt.compare(password,user.password);
        //if password doesnt match 
        if(!isMatch){
            res.status(400).json({errors:[{msg:"Invalid credentials"}]});
        }
        //if password matches

        //Return jwt
        const payload = {
            user:{
                id:user.id
            }
        }
        
        jwt.sign(payload , config.get('jwtSecret'),{expiresIn:7200},(err,token)=>{
            if(err) throw err;
            res.json({token});
        });

    }
    catch(e){
        console.log(e.message);
        res.status(500).send("Server Error ..");
    }
})

module.exports = router