import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log("Token",token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized, protect" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById({
            _id: decoded.id,
        });
        
        req.role=req.user.role

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const adminOnly = async (req, res, next) => {
    // if (req.role === "admin") {
    //     next();
    // } else {
    //     res.status(401).json({ message: "Unauthorized, adminOnly " });
    // }
    next()
};

export { protect, adminOnly };