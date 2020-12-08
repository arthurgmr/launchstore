const User = require('../models/User')

async function post(req, res, next) {
    //check if has all fields
    const keys = Object.keys(req.body)
    
    for(key of keys) {
        if (req.body[key] == "") 
            return res.render('users/register', {
                user: req.body,
                error: 'Please, fill all fields!'
            })           
    }

    let { email, cpf_cnpj, password, passwordRepeat } = req.body

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

module.exports = {
    post
}