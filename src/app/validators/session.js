const { compare } = require('bcryptjs')
const User = require('../models/User')

async function login(req, res, next) {
    const { email, password } = req.body
    
    // check register user
    const user = await User.findOne({ where: {email} })

        if (!user) return res.render("session/login", {
            user: req.body,
            error: "User not register!"
        })

        // check password matching
        const passed = await compare(password, user.password)

        if (!passed) return res.render("session/login", {
            user: req.body,
            error: "Incorrect password!"
        })
    
        req.user = user
    
        next()
}

module.exports = {
    login
}