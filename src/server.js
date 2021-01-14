const express = require('express')
const nunjucks = require('nunjucks')
const routes = require('./routes')
const methodOverride = require('method-override')
const session = require('./config/session')

const server = express ()

server.use(session)
server.use((req, res, next) => { // global variables
    res.locals.session = req.session // res.locals.session in all template engined
    next()
})

server.use(express.urlencoded({ extended: true })) //responsável por funcionar o require.body
server.use(express.static('public'))
server.use(methodOverride('_method')) //esta dep está sobrescrevendo o tipo do método
server.use(routes)

server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
    express: server,
    autoescape: false,
    noCache: true
})

server.listen(5000, function (){
    console.log("server is running")
})