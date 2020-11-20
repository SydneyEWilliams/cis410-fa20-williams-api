const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const db = require('./dbConnectExec.js')
const config = require("./config.js")
const auth = require("./middleware/authenticate")

const app = express();
app.use(express.json()) //app recognizes json requests with this
app.use(cors())

// app.post("/customer", async (req,res)=>{
//     console.log("request body", req.body)

//     var firstName = req.body.firstName
//     var lastName = req.body.lastName
//     var email = req.body.email
//     var password = req.body.password

//     //validation
//     if(!nameFirst || !nameLast || !email || !password){
//         return res.status(400).send("bad request")
//     }

//     nameFirst = nameFirst.replace("'","''") //where ' in names are get written properly
//     nameLast = nameLast.replace("'","''") 

//     var emailCheckQuery = `SELECT email
//     FROM Customer
//     WHERE Email = '${email}'`

//     var existingUser = await db.executeQuery(emailCheckQuery)

    // if(existingUser[0]){
    //     return res.status(409).send("Please enter a different email")
    // }

    // var hashedPassword = bcrypt.hashSync(password) //this hashes passwords for users you create in postman

    // var insertQuery = `INSERT INTO Customer(FirstName,LastName,Email,Password)
    // VALUES('${firstName}','${lastName}','${email}','${hashedPassword}')`
    
    // db.executeQuery(insertQuery)
    // .then(()=>{
    //     res.status(201).send
    // })
    // .catch((err)=>{
    //     console.log("error in POST /conacts",err)
    //     res.status(500).send()
    // }) // this whole writing user to database isnt gonna work unless its your database

//})


app.get("/videogame", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT * FROM VideoGame
    LEFT JOIN Developer
    ON Developer.DevID = VideoGame.DevID`)

    .then((result)=>{
        res.status(200).send(result)
    })

    .catch((error)=>{
        console.log(error)
        res.status(500).send()
    })
})

app.get("/videogame/:pk", (req,res)=>{
    var pk = req.params.pk
    //console.log("my pk:" + pk)

    var myQuery =`SELECT * FROM VideoGame
    LEFT JOIN Developer
    ON Developer.DevID = VideoGame.DevID
    WHERE GameID = ${pk}`

    db.executeQuery(myQuery)
        .then((videogames)=>{
            
            if(videogames[0]){
                res.send(videogames[0])
            }

            else{
                res.status(404).send("bad request")
            }
        })

        .catch((error)=>{
            console.log("Error in /videogames/pk", error)
            res.status(500).send()
        })
})

app.get("/customer", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT * FROM Customer`)

    .then((result)=>{
        res.status(200).send(result)
    })

    .catch((error)=>{
        console.log(error)
        res.status(500).send()
    })
})

app.post("/customers", async (req,res)=>{
    //res.send("creating user")
    //console.log("request body", req.body)

    var nameFirst = req.body.nameFirst
    var nameLast = req.body.nameLast
    var email = req.body.email
    var password = req.body.password

    //validation
    if(!nameFirst || !nameLast || !email || !password){
        return res.status(400).send("bad request")
    }

    nameFirst = nameFirst.replace("'","''") //where ' in names are get written properly
    nameLast = nameLast.replace("'","''") 

    var emailCheckQuery = `SELECT Email
    FROM Customer
    WHERE Email = '${email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    //console.log("existing user", existingUser)
    if(existingUser[0]){
    return res.status(409).send("Please enter a different email")
    }

    var hashedPassword = bcrypt.hashSync(password) //this hashes passwords for users you create in postman

    var insertQuery = `INSERT INTO Customer(FirstName,LastName,Email,Password)
    VALUES('${nameFirst}','${nameLast}','${email}','${hashedPassword}')` //this wont work, dont have permissions in SQL
    
    db.executeQuery(insertQuery)
    .then(()=>{
        res.status(201).send
    })
    .catch((err)=>{
        console.log("error in POST /customers",err)
        res.status(500).send()
    }) // this whole writing user to database isnt gonna work unless its your database
})

app.get("/customers/me", auth, (req,res)=>{
    res.send(req.customer) //user verification using tokens
})

app.post("/customers/login", async (req,res)=>{
    //console.log(req.body)

    var email = req.body.email
    var password = req.body.password

    if(!email||!password){
        return res.status(400).send("Bad request")
    }

    //1. Check user email exists in database

    var query = `SELECT * FROM Customer 
    WHERE email = '${email}'`

    //var result = await db.executeQuery(query)
    //console.log(result)

    let result;

     try{
         result = await db.executeQuery(query)
     }catch(myError){
         console.log("error with /customers/login",myError)
         return res.status(500).send()
     }

    // console.log(result)

     if(!result[0]){
         return res.status(400).send("Invalid user credentials")
     }

    //2. Check their password

    let user = result[0]
    //console.log(user)

    if(!bcrypt.compareSync(password, user.Password)){
        console.log("invalid password")
        return res.status(400).send("invalid user credentials")
    }

    //3. Generate token

    let token = jwt.sign({pk: user.CustomerID}, config.JWT, {expiresIn: "60 minutes"})

    console.log(token)

    //4. Save token in database and send token & user info back to user

    let setTokenQuery = `UPDATE Customer
    SET Token = '${token}' 
    WHERE CustomerID = ${user.CustomerID}` 
    //send Bearer token in postman under authorization, paste in token

    try{
         await db.executeQuery(setTokenQuery)
            
         res.status(200).send({
             token: token,
             user: {
                 FirstName: user.FirstName,
                 LastName: user.LastName,
                 Email: user.Email,
                 CustomerID: user.CustomerID
             } 
         })
     }
     catch(myError){
         console.log("Error setting user token",myError)
         res.status(500).send()
     }
})

app.post("/customers/logout", auth, (req,res)=>{
    var query = `UPDATE Customer 
    SET Token = NULL 
    WHERE CustomerID = ${req.customer.CustomerID}`

    db.executeQuery(query)
    .then(()=>{res.status(200).send()})
    .catch((error)=>{
        console.log("Error in POST /customers/logout", error)
        res.status(500).send()
    })
})

app.post("/me", async (req,res)=>{ //for assignment due 11/17
    //console.log(req.body)

    var email = req.body.email
    var password = req.body.password

    if(!email||!password){
        return res.status(400).send("Bad request")
    }

    //1. Check user email exists in database

    var query = `SELECT * FROM Customer 
    WHERE email = '${email}'`

    //var result = await db.executeQuery(query)
    //console.log(result)

    let result;

     try{
         result = await db.executeQuery(query)
     }catch(myError){
         console.log("error with /customers/login",myError)
         return res.status(500).send()
     }

    // console.log(result)

     if(!result[0]){
         return res.status(400).send("Invalid user credentials")
     }

    //2. Check their password

    let user = result[0]
    //console.log(user)

    if(!bcrypt.compareSync(password, user.Password)){
        console.log("invalid password")
        return res.status(400).send("invalid user credentials")
    }

    //3. Generate token

    let token = jwt.sign({pk: user.CustomerID}, config.JWT, {expiresIn: "60 minutes"})

    console.log(token)

    //4. Save token in database and send token & user info back to user

    let setTokenQuery = `UPDATE Customer
    SET Token = '${token}' 
    WHERE CustomerID = ${user.CustomerID}` 
    //send Bearer token in postman under authorization, paste in token

    try{
         await db.executeQuery(setTokenQuery)
            
         res.status(200).send({
             token: token,
             user: {
                 FirstName: user.FirstName,
                 LastName: user.LastName,
                 Email: user.Email,
                 CustomerID: user.CustomerID
             } 
         })
     }
     catch(myError){
         console.log("Error setting user token",myError)
         res.status(500).send()
     }
})

app.post("/reviews",auth,async (req,res)=>{ //edit this to get user authentication??

    try{
        var movieFK = req.body.movieFK
        var summary = req.body.summary
        var rating = req.body.rating
    
        //validation
        if(!movieFK || !summary || !rating){
            return res.status(400).send("bad request")
        }

        summary = summary.replace("'","''")

        //console.log(req.contact)
        //res.send("here is your response")

        let insertQuery = `INSERT INTO Review(summary, Rating, MovieFK, ContactFK)
        OUTPUT inserted.ReviewFK, insterted.Summary, inserted.Rating, inserted.MovieFK
        VALUES ("${summary}","${rating}","${movieFK},"${summary},"${req.contact.ContactPK}")`

        let insertedReview = await db.executeQuery(insertQuery)

        res.status(201).send(insertedReview[0])
    }
        catch(error){
            console.log("error in POST /review",error)
            res.status(500).send()
        }
})

// app.post("/me", auth, async(req,res)=>{
//     //get data from database
//     db.executeQuery(`SELECT * FROM Customer`)

//     .then((result)=>{
//         res.status(200).send(result)
//     })

//     .catch((error)=>{
//         console.log(error)
//         res.status(500).send()
//     })
// })

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`App runnin on port ${PORT}`)
})

// app.listen(5000,()=>{
//     console.log("App runnin' on 5000")
// })

//git add . & git commit -m "" in github show what you did/give updates
//then git push

//nodemon error? Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass