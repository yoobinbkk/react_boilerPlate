const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken');

const tokenKey = 'secretToken'

const userSchema = mongoose.Schema({
    name : {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 비밀번호 암호화
userSchema.pre('save', async function(next) {
    let user = this
    if(user.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(saltRounds)
            const hash = await bcrypt.hash(user.password, salt)
            user.password = hash
            next()
        } catch(err) {
            throw err
        }
    } else {
        next()
    }
})

// 비밀번호 검증
userSchema.methods.comparePassword = async function(plainPassword) {
    // plainPassword 1234567    암호화된 비밀번호 $2b$10$lSTDeIT7JlCHklmInxMQ5.m7xsuMJntY6beN4zeH9M9abkKp49q8.
    try {
        const isMatch = await bcrypt.compare(plainPassword, this.password)
        return isMatch
    } catch(err) {
        throw err
    }
}

userSchema.methods.generateToken = async function() {
    let user = this
    // jsonwebtoken을 이용해서 token을 생성하기
    try {
        const token = await jwt.sign(user._id.toHexString(), tokenKey)
        user.token = token
        await user.save()
        return user
    } catch(err) {
        throw err
    }
}

userSchema.statics.findByToken = async function(token) {
    let user = this
    try {
        // 토큰 복호화
        const decoded_id = await jwt.verify(token, tokenKey)
        // 복호화된 아이디를 데이터베이스에서 찾음 -> 있으면 user return
        return await user.findOne({"_id":decoded_id, "token":token})
    } catch(err) {
        throw err
    }
}

const User = mongoose.model('User', userSchema)

module.exports = {User}