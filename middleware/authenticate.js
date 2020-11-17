
const jwt = require("jsonwebtoken")
const config = require("../config.js")
const db = require("../dbConnectExec.js")
const { request } = require("express")

const auth = async(req,res,next)=>{
    console.log(req.header('Authorization')) //logs token authorization

    try{

        //1. Decode token

        let myToken = req.header('Authorization').replace("Bearer ","")

        let decodedToken = jwt.verify(myToken, config.JWT)

        let contactPK = decodedToken.contactPK

        //2. Compare token to database token

        let query = `SELECT ContactPK, NameFirst, NameLast, Email FROM Contact
        WHERE ${contactPK} = 1035 and Token = ${myToken}`

        let returnedUser = await db.executeQuery(query)
        //console.log(returnedUser)

        //3. Save user info in the request

        if(returnedUser[0]){
            req.contact = returnedUser[0]
            next()
        }
        else{
            res.status(401).send("Authentication failed")
        }

    }catch(myError){
            res.status(401).send("Authentication failed")
    }

    next()
}

module.exports = auth