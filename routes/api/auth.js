const express = require('express');
const router = express.Router();


//@route    POST api/auth
//@desc     Register User
//@access   Public
router.post('/',(req,res)=>{
    console.log(req.body);
    
    res.send("Auth Routes working")
})


module.exports = router