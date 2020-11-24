const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
const User = require('../../models/user');
const {check,validationResult} = require('express-validator');

//@route    GET api/profile/me
//@desc     Gets current user's profile
//@access   Private
router.get('/me',auth,async (req,res)=>{
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar']);

        if(!profile) {
            return res.status(400).json({msg:"there is no profile for this user"});

        }
        res.status(200).json(profile);

    }
    catch(e){
        console.log(e.message);
        res.status(500).send("Server Error");
    }
})


//@route    POST api/profile
//@desc     Create/Update user's profile
//@access   Private

router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','skills is required').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }  
    //here in irder to identify the user we need to extract it from the jwt token we have sent 
    //setting the profile fields (bit tricky )
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    const profileFiels = {};
    profileFiels.user = req.user.id;
    if (company) profileFiels.company = company;
    if (website) profileFiels.website = website;
    if (location) profileFiels.location = location;
    if (bio) profileFiels.bio = bio;
    if (status) profileFiels.status = status;
    if (githubusername) profileFiels.githubusername = githubusername;
    if (skills) {
        profileFiels.skills = skills.split(',').map(skill=> skill.trim());
    }

    profileFiels.social = {};
    if (youtube) profileFiels.social.youtube = youtube;
    if (twitter) profileFiels.social.twiiter = twitter;
    if (facebook) profileFiels.social.facebook = facebook;
    if (instagram) profileFiels.social.instagram = instagram;
    if (linkedin) profileFiels.social.linkedin = linkedin;

    //whenever we are using a mongoose model we are always returned an object so had to use await
    try{
        let profile = await Profile.findOne({user: req.user.id})
        if(profile) {
            console.log("124")
            //update a profile
            profile = await Profile.findOneAndUpdate({user: req.user.id},{$set:profileFiels},{new:true})
            return res.status(200).json(profile);
        }
            //creating the new profile 
            profile = new Profile(profileFiels);
            await profile.save();
            return res.status(201).json(profile);
    }
    catch(e) {
        console.log(e.message);
        res.status(500).send("Server Error!")
    }
    //res.send("perfect!")
})


//@route    GET api/profile
//@desc     Get all user's profile
//@access   Public
router.get('/',async (req,res)=>{
    try{
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.status(200).json(profiles); 
    }
    catch(e){
        console.log(e.message);
        res.status(500).send("Server Error!")
    }
});

//@route    GET api/profile/user/:user_id
//@desc     Get user's profile 
//@access   Public

router.get('/user/:user_id',async (req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({error:{msg:"Profile for this user does not exist"}})
        }
        res.status(200).json(profile); 
    }
    catch(e){
        console.log(e.message);
        //If there is some error that the user is not valid one 
        if(err.kind == 'ObjectId') {
            return res.status(400).json({error:{msg:"Profile for this user does not exist"}})
        }
        res.status(500).send("Server Error!")
    }
});


//@route    DELETE api/profile
//@desc     Delete user's profile,user and posts 
//@access   Private

router.get('/',async (req,res)=>{
    try{
        //Remove Profile
        await Profile.findOneAndRemove({user:req.user.id});

        //Remove the posts by this user

        //Remove user

        await User.findOneAndRemove({_id:req.user.id});
        res.status(200).json({msg:"User Removed Successfully .."}); 
    }
    catch(e){
        console.log(e.message);
        res.status(500).send("Server Error!")
    }
});


module.exports = router;