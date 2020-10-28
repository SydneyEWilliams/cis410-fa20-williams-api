const express = require("express")
const db = require('./dbConnectExec.js')

const app = express();


app.get("/hi",(req,res)=>{
res.send("hello world")
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

app.get("/movies/:pk", (req,res)=>{
    var pk = req.params.pk
    //console.log("my pk:" + pk)

    var myQuery =`SELECT * FROM movie
    LEFT JOIN Genre
    ON genre.GenrePK = movie.GenreFK
    WHERE moviePK = ${pk}`

    db.executeQuery(myQuery)
        .then((movies)=>{
            //console.log("Movies: ", movies
            
            if(movies[0]){
                res.send(movies[0])
            }

            else{
                res.status(404).send("bad request")
            }
        })

        .catch((error)=>{
            console.log("Error in /movies/pk", error)
            res.status(500).send()
        })
})


app.listen(5000,()=>{
    console.log("App runnin on 5000")
})