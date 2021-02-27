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

async function forgot(req, res, next) {
    const { email} = req.body

    try {
        let user = await User.findOne({ where: {email} })

        if(!user) return res.render("session/forgot-password", {
            user: req.body,
            error: "Email not registered!"
        })

        req.user = user

        next()

    }catch(err) {
        console.log(err)
        return res.render("session/forgot-password", {
            error: "Some error happened!"
        })
    }
}

async function reset (req, res, next) {

    const { email, password, passwordRepeat, token } = req.body

    try {
        //search user
        let user = await User.findOne({ where: {email} })

        if(!user) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Email not registered!"
        })
        
        //if password match
        if(password != passwordRepeat)
        return res.render('session/password-reset', {
            user: req.body,
            token,            
            error: 'Password mismatch!'
        })

        //check match token
        if(token != user.reset_token) return res.render('session/password-reset', {
            user: req.body,
            token,            
            error: 'Token mismatch!'
        })

        //check if token has expired
        let now = new Date()
        now = now.setHours(now.getHours())

        if(now > user.reset_token_expires) return res.render('session/password-reset', {
            user: req.body,
            token,            
            error: 'Expired token!!'
        })

        req.user = user

        next()

    }catch(err) {
        console.log(err)
        return res.render("session/password-reset", {
            error: "Some error happened!"
        })
    }
    
}

module.exports = {
    login,
    forgot,
    reset
}