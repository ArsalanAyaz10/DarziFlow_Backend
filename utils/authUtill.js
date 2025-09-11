import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const hashPassword = async (password) => {
    const salt  = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

//compare password

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

//generate Access token

const generateAccessToken  = (user)=>{
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {expiresIn: '1m'}
    );
}

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' } 
    );
};

export {hashPassword,comparePassword,generateAccessToken,generateRefreshToken};