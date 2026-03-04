import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
    
    res.cookie("jwt", token, {
        maxAge: 24*60*60*1000, //1 day in milliseconds
        httpOnly: true, //prevents XSS attacks cross-site scripting attacks
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
        secure: process.env.NODE_ENV !== 'development',
    })
}