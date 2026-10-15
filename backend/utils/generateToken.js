import jwt from 'jsonwebtoken'

const genToken = (userId) => {
    return jwt.sign({userId}, process.env.jwtSecret, {expiresIn: '7day'}) 
}

export default genToken