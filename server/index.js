const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')

const {auth} = require('./middleware/auth')
const {User} = require('./models/User')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())
app.use(cookieParser())


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', async (req, res) => {
    // 회원 가입할 때 필요한 정보들을 client 에서 가져오면 그것들을 데이터베이스에 넣어준다
    const user = new User(req.body)
    try {
        await user.save(); // MongoDB의 save() 메서드는 Promise를 반환하므로 await 키워드를 사용하여 기다린다.
        return res.status(200).json({success: true})
    } catch(err) {
        return res.json({success: false, err})
    }
})

app.post('/api/users/login', async (req, res) => {
    // 요청된 이메일을 데이터베이스에 있는지 찾는다.
    let user = await User.findOne({email: req.body.email})
    if(!user) {
        return res.json({
            loginSuccess: false,
            message: "제공된 이메일에 해당하는 유저가 없습니다."
        })
    }

    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 지 확인
    const isMatch = await user.comparePassword(req.body.password)
    if(!isMatch) return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})

    try {
        // 비밀번호가 맞다면 토큰을 생성하기
        user = await user.generateToken()
        // 토큰을 저장 -> 쿠키 or 로컬 스토리지?
        res.cookie("x_auth", user.token)
        .status(200)
        .json({loginSuccess: true, userId: user._id})
    } catch(err) {
        return res.status(400).send(err)
    }
})

app.get('/api/users/auth', auth, async (req, res) => {
    // 미들웨어 통과 -> Authentication : True
    res.status(200).json({
        _id: req.user._id
        // role = 0 (일반유저), role = 1 (관리자), role = 2+ (특정 부서 관리자)
        , isAdmin: req.user.role === 0 ? false : true
        , isAuth: true
        , email: req.user.email
        , name: req.user.name
        , lastname: req.user.lastname
        , role: req.user.role
        , image: req.user.image
    })
})

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        await User.findOneAndUpdate({_id: req.user._id}, {token: ""})
        res.status(200).send({success:true})
    } catch(err) {
        return res.json({success: false, err})
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))