//Something wrong with middleware

const jwt = require("jsonwebtoken")
const config = require("../config.js")
const db = require("../dbConnectExec.js")
// const { request } = require("express")

const auth = async(req, res, next)=>{
    //console.log(req.header('Authorization')) //logs token authorization

   try{

         //1. Decode token

         let myToken = req.header('Authorization').replace('Bearer ','')
         //console.log(myToken)

         let decodedToken = jwt.verify(myToken, config.JWT)
         //console.log(decodedToken)

         let customerID = decodedToken.pk
         console.log(customerID)

         //2. Compare token to database token

         let query = `SELECT FirstName, LastName, Email, CustomerID 
         FROM Customer
         WHERE CustomerID = ${customerID} and Token = '${myToken}'`

         let returnedUser = await db.executeQuery(query)
         //console.log(returnedUser)

         //3. Save user info in the request

         if(returnedUser[0]){
             req.customer = returnedUser[0]
             next()
         }
         else{
             res.status(401).send("Authentication failed")
         }

     }catch(myError){
             res.status(401).send("Authentication failed??? Why here")
     }

//     next()
 }

module.exports = auth