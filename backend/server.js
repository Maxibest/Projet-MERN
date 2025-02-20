const mongoose = require("mongoose");
const express = require('express');
const authRoutes = require('./routes/routes');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use('/api', authRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.BDD)
  .then(() => {
    console.log('Connecté à MongoDB');

    // Configuration pour servir les fichiers frontend
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });

    // Lancement du serveur après connexion réussie
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
