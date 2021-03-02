const User = require('../models/User')

const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const { hash } = require('bcryptjs')

module.exports = {
    loginForm(req, res) {
        try {
            return res.render("session/login")
        }catch(err) {
            console.log(err)
        }
    },
    login(req, res) {     
        // put user in req.session
        req.session.userId = req.user.id

        return res.redirect("/users")

    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect ("/")
    },
    forgotForm(req, res) {
        return res.render("session/forgot-password")
    },
    async forgot(req, res) {

        const user = req.user

        try {
            // create token to user
            const token =  crypto.randomBytes(20).toString("hex")
            
            // create expire token
            let now = new Date()
            now = now.setHours(now.getHours() + 1)

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })

            // send email with recover link
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com',
                subject: 'Password Recovery',
                html: `<h2>Lost your Key?</h2>
                <p>Don't worry, click the link to recover your password!</p>
                <p>
                    <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                        RECOVER PASSWORD
                    </a>
                </p>
                `
            })

            // notify user 
            return res.render("session/forgot-password", {
                success: "Check your email to reset password!"
            })


        }catch(err) {
            console.log(err)
            return res.render("session/forgot-password", {
                error: "Some error happened!"
            })
        }
    },
    resetForm(req, res) {
        return res.render("session/password-reset", { token: req.query.token })
    },
    async reset(req, res) {
        const user = req.user
        const { password, token } = req.body

        try {            

            //create new hash of password
            const newPassword = await hash(password, 8)

            //update user
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })

            //notify user about new password
            return res.render("session/login", {
                user: req.body,
                success: "Password updated wiht success!",
            })

        }catch(err) {
            console.log(err)
            return res.render("session/password-reset", {
                user: req.body,
                token,
                error: "Some error happened!"
            })
        }
    }
}