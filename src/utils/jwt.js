const jwt = require('jsonwebtoken')

const genToken = user=>{
    return jwt.sign(
        {id:user._id,name:user.name,email:user.email,role:user.role},
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
    )
}

module.exports = {genToken}