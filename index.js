const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const db = require('./dbConnectExec.js')
const config = require("./config.js")

const app = express();
app.use(express.json()) //app recognizes json requests with this

 app.get("/hi",(req,res)=>{
 res.send("hello world")
})

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


// app.post()
// app.put()
// app.delete


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

// app.get("/movies/:pk", (req,res)=>{
//     var pk = req.params.pk
//     //console.log("my pk:" + pk)

//     var myQuery =`SELECT * FROM movie
//     LEFT JOIN Genre
//     ON genre.GenrePK = movie.GenreFK
//     WHERE moviePK = ${pk}`

//     db.executeQuery(myQuery)
//         .then((movies)=>{
//             //console.log("Movies: ", movies
            
//             if(movies[0]){
//                 res.send(movies[0])
//             }

//             else{
//                 res.status(404).send("bad request")
//             }
//         })

//         .catch((error)=>{
//             console.log("Error in /movies/pk", error)
//             res.status(500).send()
//         })
//})


app.listen(5000,()=>{
    console.log("App runnin' on 5000")
})

//git add . & git commit -m "" in github show what you did/give updates
//then git push

//nodemon error? Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass