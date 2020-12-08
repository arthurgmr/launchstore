const User = require('../models/User')

module.exports = {
    registerForm(req, res) {
        return res.render("users/register")
    },
    async post (req, res) {
        //check if has all fields
        const keys = Object.keys(req.body)
    
        for(key of keys) {
            if (req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }            
        }

        const { email, cpf_cnpj, password, passwordRepeat } = req.body

        //check if user exists [email cpf_cnpj]
        const user = await User.findOne({
            where: {email},
            or: {cpf_cnpj}
        })

        if(user) return res.send('Users exists!')

        //check if passwords match
        if(password != passwordRepeat)
            return res.send('Password Mismatch!')
        
        return res.send('passed')
    }
}