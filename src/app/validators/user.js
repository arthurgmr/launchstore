const { compare } = require('bcryptjs')
const User = require('../models/User')

function checkAllFields(body) {
    //check if has all fields
    const keys = Object.keys(body)

    for(key of keys) {
        if (body[key] == "") {
            return {
                user: body,
                error: 'Please, fill all fields!'
            }
        }           
    }
}


async function show(req, res, next) {
    const { userId: id } = req.session

    const user = await User.findOne({ where: {id} })

        if (!user) return res.render("user/register", {
            error: "User not found!"
        })

        req.user = user

    next()
}

async function post(req, res, next) {
    //check if has all fields
    const fillAllFields = checkAllFields(req.body)
    if(fillAllFields) {
        return res.render("users/register", fillAllFields)
    }
        

    let { email, cpf_cnpj, password, passwordRepeat } = req.body
    cpf_cnpj = cpf_cnpj.replace(/\D/g,"")

    //check if user exists [email cpf_cnpj]    
    const user = await User.findOne({
        where: {email},
        or: {cpf_cnpj}
    })

    if(user) return res.render('users/register', {
        user: req.body,
        error: 'Users exists!'
    })

    //check if passwords match
    if(password != passwordRepeat)
        return res.render('users/register', {
            user: req.body,            
            error: 'Password mismatch!'
        })

    next()
}

async function update (req, res, next) {
    //check if has all fields
    const fillAllFields = checkAllFields(req.body)
    if(fillAllFields) {
        return res.render("users/index", fillAllFields)
    }

    const { id, password } = req.body

    if(!password) return res.render("users/index", {
        user: req.body,
        error: "Type your password to register update."
    })

    const user = await User.findOne({ where: {id} })

    const passed = await compare(password, user.password)

    if (!passed) return res.render("users/index", {
        user: req.body,
        error: "Incorrect password!"
    })

    req.user = user

    next()
}

module.exports = {
    post,
    show,
    update
}