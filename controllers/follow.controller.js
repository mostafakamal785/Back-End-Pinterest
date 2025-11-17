const Follow = require("../models/Follow.js");
const User = require("../models/User.js");


const follow =async (req, res, next) => {
    const followerId = req.user.id;
    const followeingId = req.params.id;
    
    const exists = await Follow.findOne({
        follower: followerId,
        following: followeingId
    });

    if (exists) {
        await Follow.findByIdAndDelete(exists._id);

        return res.status(200).json({
            message: "Unfollowed successfully",
        });
    }


        const newFollow = new Follow({
            follower: followerId,
            following: followeingId
        });

    await newFollow.save();

    res.status(200).json({
        message: "Followed successfully",
    });

}


const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;

        const followers = await Follow.find({ following: userId }).populate(
            "follower",
            "username profilePicture"
        );

        res.status(200).json({
            count: followers.length,
            followers,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;

        const following  = await Follow.find({ follower: userId }).populate(
            "following",
            "username profilePicture"
        );

        res.status(200).json({
            count: following.length,
            following,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



module.exports={follow,getFollowers,getFollowing}