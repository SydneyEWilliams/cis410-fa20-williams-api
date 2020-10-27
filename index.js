const express = require("express")
const db = require('./dbConnectExec.js')

const app = express();


app.get("/hi",(req,res)=>{
res.send("heloo world")
})


// app.post()
// app.put()
// app.delete


app.get("/movies", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT * FROM movie
    LEFT JOIN Genre
    ON genre.GenrePK = movie.GenreFK`)

    .then((result)=>{
        res.status(200).send(result)
    })

    .catch((error)=>{
        console.log(error)
        res.status(500).send()
    })
})

app.listen(5000,()=>{
    console.log("App runnin")
})