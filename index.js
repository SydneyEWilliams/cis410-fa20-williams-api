const express = require("express")

const app = express();


app.get("/hi",(req,res)=>{
res.send("heloo world")
})


// app.post()
// app.put()
// app.delete


app.listen(5000,()=>{
    console.log("App runnin")
})