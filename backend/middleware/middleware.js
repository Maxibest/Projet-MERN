require('dotenv').config();
const jwt = require('jsonwebtoken');


async function verifyToken() {

}

async function generateToken(user) {
    // Génère un token avec toutes les informations de l'utilisateur
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
}

module.exports = { generateToken }