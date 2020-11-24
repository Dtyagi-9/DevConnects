const express = require('express');
const router = express.Router();
const { check,validationResult } = require('express-validator');
const User = require('../../models/user');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('config')



//@route    POST api/users
//@desc     Register User
//@access   Public
router.post('/',[
    //check middleware
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a Password of min Length 6').isLength({min:6})
    ],async (req,res)=>{
    const errors = validationResult(req);
    //if there are errors
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    const {name,email,password} = req.body;

    //see if user exists 
    try{
        //assigning const will give the assignment to constant variable error
        let user = await User.findOne({email});

        if(user){
            res.status(400).json({errors:[{msg:"User already exists"}]});
        }
        
        //Get users gravatar    
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        });

        //creating user instance (ps: not saving it here)
        user = new User({
            name,
            email,
            avatar,
            password
        })


        //Encrypt password (later do it as pre function in the model itself)
        const salt = await bcrypt.genSalt(8);
        user.password = await bcrypt.hash(password,salt);

        const savedUser = await user.save();

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

        //res.status(201).send("User registered.. ")
        
    }
    catch(e){
        console.log(e.message);
        res.status(500).send("Server Error ..");
    }



    //console.log(req.body);
})

module.exports = router;