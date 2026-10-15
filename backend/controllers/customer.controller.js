import User from "../models/customer.model.js";
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js"

const cookieOptions = {
    httpOnly : true,
}

export const register = async(req, res) => {
    const {fullname, email, password, phone} = req.body

    try {
        if(!fullname || !email || !password || !phone) {
            return res.status(400).json({message: "fill all the details to register"})
        }

        if(password.length < 6) {
            return res.status(400).json({message: "password too short"})
        }
        
        const emailExists = await User.findOne({email})
        if(emailExists) {
            return res.status(409).json({message: "email is already registered"})
        }


        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({fullname, email, password:hashedPassword, phone})
        return res.status(200).json(newUser)
    } catch {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    
    try{
        if(!email || !password) {
            return res.status(400).json({message: "fill all the details to login"})
        }
        
        const emailExists = await User.findOne({email})
        if(!emailExists){

            return res.status(401).json({message: "invalid credentials"})
        }
        const passwordCheck = bcrypt.compareSync(password, emailExists.password)
        if(!passwordCheck) {
            return res.status(401).json({message: "invalid credentials"})
        }
        
        const token = genToken(emailExists._id)
        return res.status(200).cookie("token", token, cookieOptions).json({
            success: true,
            message: "Login Successful"
        })
    } catch {
        return res.status(500).json({message: "Internal Server Error"})
    }
}

export const me = async (req, res) => {
    try {
        const fullname = req.user.fullname || req.user.fullName;
        return res.status(200).json({
            _id: req.user._id,
            fullName: fullname,
            email: req.user.email,
            phone: req.user.phone,
            createdAt: req.user.createdAt
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const logoutCustomer = async (req, res) => {
    try {
        if(!req.cookies.token) {
            return res.status(200).json({ success: true, message: "Account is already logged out" })
        }
        res.clearCookie('token', cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}