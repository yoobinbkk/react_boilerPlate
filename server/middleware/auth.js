const {User} = require('../models/User')

// 인증처리를 하는 곳
let auth = async (req, res, next) => {
    // 클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth

    // 토큰을 복호화한 후 유저를 찾는다.
    const user = await User.findByToken(token)

    // 유저가 있으면 인증 Ok
    if(user) {
        req.token = token
        req.user = user
        next()
    } else {
        // 유저가 없으면 인증 No
        return res.json({isAuth: false, error: true})
    }
}

module.exports = {auth}