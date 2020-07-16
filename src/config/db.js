// banco de dados precisa realizar verificação, 
// com o pool ele faz essa comunicação autorizada,
// não sendo preciso realizar toda vez o login e senha;
const { Pool } = require("pg")

module.exports = new Pool({
    user: "postgres",
    password: "agmr1275",
    host: "localhost",
    port: 5432,
    database: "launchstoredb"
})

