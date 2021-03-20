const { unlinkSync } = require('fs')
const { hash} = require('bcryptjs')

const User = require('../models/User')
const Product = require('../models/Product')

const LoadProductService = require('../services/LoadProductServices')
const {formatCep, formatCpfCnpj} = require('../../lib/utils')


module.exports = {
    registerForm(req, res) {
        return res.render("users/register")
    },
    async show(req, res) {
        try {
            const { user } = req

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)
            
            return res.render('users/index', { user })

        }catch(err) {
            console.log(err)
        }
    },
    async post (req, res) {
        try {
            let {
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            } = req.body

            //hash of password
            password = await hash(password, 8);
            cpf_cnpj.replace(/\D/g,"");
            cep.replace(/\D/g, "");

            const userId = await User.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            })

            req.session.userId = userId
            
            return res.redirect('/users')

        }catch(err) {
            console.log(err)
        }

    },
    async update(req, res ){
        try {
            const { user } = req
            let { name, email, cpf_cnpj, cep, address} = req.body

            
            cpf_cnpj = cpf_cnpj.replace(/\D/g,"")
            cep = cep.replace(/\D/g,"")

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })

            return res.render("users/index", {
                user: req.body,
                success: "User updated with success!"
            })

        }catch(err) {
            console.log(err)
            return res.render("users/index", {
                error: "Some error happened!"
            })
        }
    },
    async delete(req, res) {
        try {
            
            const products = await Product.findAll({where: {user_id: req.body.id}})

            //get all images of products
            const allFilesPromise = products.map(product => 
                Product.files(product.id))
                
            let promiseResults = await Promise.all(allFilesPromise)

            //remove user
            await User.delete(req.body.id)
            req.session.destroy()

            //remove images from public folder
            promiseResults.map(files => {
                files.map(file => unlinkSync(file.path))
            })

            return res.render("session/login", {
                success: "Account Successfully Deleted"
            })    

        }catch(err) {
            console.log(err)
            return res.render("users/index", {
                user: req.body,
                error: "Some error happened!"
            })
        }
    },
    async ads(req, res) {
        const products = await LoadProductService.load('products', {
            where: { user_id: req.session.userId }
        })

        return res.render("users/ads", { products })
    }
}