const sql = require('mssql')
const williamsConfig = require("./config.js")

const config = {
    user: williamsConfig.DB.user,
    password: williamsConfig.DB.password,
    server: williamsConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: williamsConfig.DB.database,
}

async function executeQuery(aQuery){

    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)
    
    return result.recordset
    }

    module.exports = {executeQuery: executeQuery}