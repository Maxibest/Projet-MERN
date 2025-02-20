const express = require('express');
const router = express.Router();
const User = require('../models/users');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

async function transporterMailer() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_CREATOR,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(userEmail, _id) {
    const transporter = await transporterMailer(); // Créer le transporteur ici
    const token = jwt.sign({ userId: _id.toString(), email: userEmail }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const confirmationLink = `http://localhost:3000/confirm-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_CREATOR, // Assurez-vous que c'est bien EMAIL_CREATOR et non EMAIL_USER
        to: userEmail,
        subject: 'Confirmation de votre adresse email',
        text: `Cliquez sur ce lien pour confirmer votre email: ${confirmationLink}`,
        html: `<p>Cliquez sur ce lien pour confirmer votre email: <a href="${confirmationLink}">${confirmationLink}</a></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de confirmation envoyé.');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
}

module.exports = { sendConfirmationEmail, transporterMailer };
