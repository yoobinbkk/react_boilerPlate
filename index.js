const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const {User} = require('./models/User')

const config = require('./config/key')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', (req, res) => {
    // 회원 가입할 때 필요한 정보들을 client 에서 가져오면 그것들을 데이터베이스에 넣어준다
    try {
        const user = new User(req.body)
        user.save().then(() => {
            return res.status(200).json({success: true})
        })
    } catch(err) {
        return res.json({success: false, err})
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))