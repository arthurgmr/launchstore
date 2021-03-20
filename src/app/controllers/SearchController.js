const Product = require('../models/Product')

const LoadProductService = require('../services/LoadProductServices')

module.exports = {
    async index(req, res) {
        try {
            
            let { filter, category } = req.query

            if(!filter || filter.toLowerCase() == 'all store') filter = null
            
            let products = await Product.search({filter, category})
            
            const productsPromise = products.map(LoadProductService.format) //map(product => LoadProductService.format(products))

            products = await Promise.all(productsPromise)

            const search = {
                term: filter || 'All Store',
                total: products.length
            }

            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name
            })).reduce((categoriesFiltered, category) => { 
            //reduce is a loop in arguments; 
            //categoriesFiltered start empty;
            //category is each position in array;

                const found = categoriesFiltered.some(eachCategory => eachCategory.id == category.id)
                //Determines whether the specified callback function returns true for any element of an array.

                if(!found) {
                    categoriesFiltered.push(category)
                }
                return categoriesFiltered
            }, [])

            return res.render("search/index", { products, search, categories })

        }catch(err) {
            console.log(err)
        }
    }
}