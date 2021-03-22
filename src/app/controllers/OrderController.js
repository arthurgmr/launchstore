const LoadProductService = require('../services/LoadProductServices')
const User = require('../models/User')

const mailer = require('../../lib/mailer')

const email = (seller, product, buyer) => `
<h2>Hello ${seller.name}</h2>
<p>You have a new order buy of your product</p>
<p>Product: ${product.name}</p>
<p>Price: ${product.formattedPrice}</p>
<p><br/></p>
<h3>Data Buyer</h3
<p>${buyer.name}</p>
<p>${buyer.email}</p>
<p>${buyer.address}</p>
<p>${buyer.cep}</p>
<p><br/></p>
<p><strong>Get in touch with buyer to finish sale.</strong></p>
<p>Sincerely regards, team LaunchStore. </p>
`

module.exports = {
    async post(req, res) {
        try {

            //get data product
            const product = await LoadProductService.load('product', { where: {
                id: req.body.id
            }})

            //get data seller
            const seller = await User.findOne({where:{id: product.user_id}})//User.findOne({where:{id: product.user_id}})

            //get data buyer
            const buyer = await User.findOne({where:{id: req.session.userId}})

            //send email whith data buyer's to salesman
            await mailer.sendMail({
                to: seller.email,
                from: 'no-reply@launchstore.com',
                subject: 'New Order Buy',
                html: email(seller, product, buyer)
            })

            //notify user with message success 
            return res.render('orders/success')

        }catch(err) {
            console.log(err)
            return res.render('orders/error')
        }
    }
}