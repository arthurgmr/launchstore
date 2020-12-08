const db = require('../../config/db')

module.exports = {
    async findOne(filters) {
        let query = `SELECT * from users`

        Object.keys(filters).map(key => {
            query = `${query}
            ${key}
            `
            Object.key(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
            })
        })

        const results = await db.query(query)
        return results.rows[0]
    }
}