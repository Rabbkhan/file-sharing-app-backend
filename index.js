const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('./config/db.js')
const app = express();
const path =require('path')
const PORT = process.env.PORT || 5555;
app.use(express
    .static('public'))

app.use(express.json());
connectDB();

//Template engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine','ejs');

//Routes
app.use('/api/files',require('./routes/files.js'))
app.use('/files',require('./routes/show.js'))
app.use('/files/download', require('./routes/download.js'))



app.listen(PORT, (req,res)=>{
    console.log(`server is working at ${PORT}`)
})