const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

const { formatPrice, date } = require('../../lib/utils')

module.exports = {
    
    async create(req, res) {
        try {
            const categories = await Category.findAll()
            return res.render("products/create", {categories})

        }catch(err) {
            console.log(err)
        }
    },
    async post(req, res) {
        //validators
        const keys = Object.keys(req.body)    
        for(key of keys) {
            if (req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }                    
        }
        if (req.files.length == 0)
            return res.send('Please, send at least one image!')                        
        
        try {
            let {
                category_id,
                name,
                description,
                old_price,
                price,
                quantity,
                status
            } = req.body

            price = price.replace(/\D/g,"")

            const product_id = await Product.create({
                category_id,
                user_id: req.session.userId,
                name,
                description,
                old_price: old_price || price,
                price,
                quantity,
                status: status || 1
            })
    
            const filesPromise = req.files.map(file => 
                File.create({name: file.filename, path: file.path, product_id}))
            await Promise.all(filesPromise)
            
    
            return res.redirect(`products/${product_id}`)

        }catch(err) {
            console.log(err)
            const categories = await Category.finAll()
            return res.render("products/create", {
                product: req.body,
                categories,
                error: 'Some error happened!'
            })
        }        
    },
    async show(req, res) {
        try {
            const product = await Product.find(req.params.id)

            if(!product) return res.send("Product not found!")

            const { minutes, hour, day, month} = date(product.updated_at)

            product.published = {
                day:`${day}/${month}`,
                hour: `${hour}h${minutes}`,
            }

            product.oldPrice = formatPrice(product.old_price)
            product.price = formatPrice(product.price)

            let files = await Product.files(product.id)
            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            return res.render("products/show", { product, files })

        }catch(err) {
            console.log(err)
        }
    },
    async edit(req, res) {
        try {
            const product = await Product.find(req.params.id)

            if (!product) return res.send("Product not found!")

            product.old_price = formatPrice(product.old_price)
            product.price = formatPrice(product.price)

            // get categories
            const categories = await Category.findAll()

            // get images
            let files = await Product.files(product.id)
            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            return res.render("products/edit", {product, categories, files})

        }catch(err) {
            console.log(err)
        }
    },
    async put(req, res) {
        //validators
        const keys = Object.keys(req.body)    
        for(key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                return res.send('Please, fill all fields!')
            }            
        }
        if(req.files.length != 0) {
            const newFilesPromise = req.files.map(file =>
                File.create({...file, product_id: req.body.id}))

            await Promise.all(newFilesPromise)
        }

        try {

            if(req.body.removed_files) {
                //come to frontend: 1,2,3,
                const removedFiles = req.body.removed_files.split(",") //array [1,2,3,]
                const lastIndex = removedFiles.length - 1
                removedFiles.splice(lastIndex, 1) //removed last position(",") [1,2,3]
    
                const removedFilesPromise = removedFiles.map(id => File.delete(id))
    
                await Promise.all(removedFilesPromise)
            }
            
            req.body.price = req.body.price.replace(/\D/g,"")
    
            if (req.body.old_price != req.body.price) {
                const oldProduct = await Product.find(req.body.id)
                req.body.old_price = oldProduct.rows[0].price    
            }
    
            await Product.update(req.body.id, {
                category_id: req.body.category_id,
                name: req.body.name,
                description: req.body.description,
                old_price: req.body.old_price,
                price: req.body.price,
                quantity: req.body.quantity,
                status: req.body.status,
            })
    
            return res.redirect (`/products/${req.body.id}`)

        }catch(err) {
            console.log(err)
        }
    },
    async delete(req, res) {

        //get all files
        const files = await Product.files(req.body.id)

        //remove product
        await Product.delete(req.body.id)

        //remove images from public folder
        files.map(file => {unlinkSync(file.path)})

        return res.redirect('/products/create')
    }
}