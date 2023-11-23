const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://yoobinbkk:ajaj1234@boilerplate.pcj4kqf.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))



app.get('/', (req, res) => res.send('Hello World! ㅋㅋㅋㅋㅋㅋ'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))