const express = require("express");
const router = express.Router();
const User = require("../models/users");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment"); //Facilite la gestion des dates et heures
const sendMailer = require("../services/sendMailer");
const middleWare = require("../middleware/middleware");

const cacheTemp = []
// Route d'enregistrement de l'utilisateur
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const regexEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    const projectId = new mongoose.Types.ObjectId();

    if (!regexEmail.test(email)) {
      return res
        .status(400)
        .json({ message: "Veuillez créer une adresse email valide." });
    }

    if (!regexPassword.test(password)) {
      return res
        .status(400)
        .json({
          message:
            "Le mot de passe est invalide. Il doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et avoir une longueur d'au moins 12 caractères.",
        });
    }
    //Vérifie si l'utilisateur existe déjà dans la base de données
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      email,
      password: hash,
      role: role || "member",
      projectId: projectId,
      isEmailVerified: false,
    });

    cacheTemp.push(user);
    console.log("User dans le cache temporaire");

    console.log(`Utilisateur enregistré : ${user._id}`);

    // Créer et envoie le token
    const token = await middleWare.generateToken(user._id, user.email);

    await sendMailer.sendConfirmationEmail(user.email, user._id);

    res
      .status(200)
      .json({ message: "Un email de confirmation a été envoyé.", token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Erreur lors de l'enregistrement.",
        details: err.message,
      });
  }
});

// Route pour confirmer l'email
router.get("/confirm-email", async (req, res) => {
  const token = req.query.token; // Prendre le token depuis la query string
  if (!token) {
    return res.status(400).json({ error: "Token manquant." });
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email } = decoded;

    // Trouver l'utilisateur dans cacheTemp
    const userIndex = cacheTemp.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(400).json({ error: "Utilisateur non trouvé dans le cache." });
    }

    const user = cacheTemp[userIndex];
    user.isEmailVerified = true;

    // Sauvegarder l'utilisateur dans la base de données
    const newUser = new User(user);
    await newUser.save();

    // Supprimer l'utilisateur du cache temporaire
    cacheTemp.splice(userIndex, 1);

    await middleWare.generateToken(user._id, user.email);

    console.log("Email confirmé !");
    return res.status(200).json({ message: "Email confirmé avec succès." });

  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Token invalide ou expiré." });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Requête reçue :", req.body);
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      return res
        .status(400)
        .json({
          authenticated: false,
          message: "Email et mot de passe sont requis.",
        });
    }

    // Recherche de l'utilisateur dans la base de données
    const existingUser = await User.findOne({ email });
    console.log("Utilisateur trouvé :", existingUser);

    // Vérification de l'existence de l'utilisateur
    if (!existingUser) {
      return res
        .status(400)
        .json({ authenticated: false, message: "Cet email n'existe pas." });
    }

    const passwordValid = await bcrypt.compare(password, existingUser.password);
    if (!passwordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Vérification si un token valide existe déjà dans les headers
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const existingToken = authHeader.split(" ")[1];
      try {
        const verifiedUser = jwt.verify(existingToken, process.env.JWT_SECRET);
        console.log("Token existant vérifié :", verifiedUser);
        return res.status(200).json({
          message: "Connexion réussie avec un token existant.",
          user: { id: verifiedUser.id, email: verifiedUser.email },
          token: existingToken,
        });
      } catch (err) {
        console.warn("Token existant invalide, un nouveau sera généré.");
      }
    }

    // Génération d'un nouveau token
    const token = await middleWare.generateToken(existingUser); //Méthode de factorisation

    console.log("Nouveau token généré :", token);

    // Réponse avec le nouveau token
    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
      token,
    });
  } catch (err) {
    console.error("Erreur dans /login :", err);
    res.status(500).json({ error: "Erreur interne.", details: err.message });
  }
});

// Route pour vérifier si l'utilisateur est authentifié
router.get("/authenticated", async (req, res) => {
  const token = req.query.token; // Récupère le token de l'URL
  if (!token) {
    return res
      .status(401)
      .json({ authenticated: false, message: "Token manquant." });
  }

  // Vérifie le token de manière asynchrone
  jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      console.error("Erreur lors de la vérification du token:", err);
      return res
        .status(403)
        .json({ authenticated: false, message: "Token invalide ou expiré." });
    }

    console.log(`Décodé : ${decoded}`);

    // Recherche l'utilisateur dans la base de données
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("Utilisateur non trouvé.");
      return res
        .status(403)
        .json({ authenticated: false, message: "Utilisateur non trouvé." });
    }

    console.log(
      "isEmailVerified dans la base de données :",
      user.isEmailVerified
    ); // Affiche si l'email est vérifié

    // Vérifie si l'email est vérifié
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ authenticated: false, message: "Email non vérifié." });
    }

    // Si tout est validé, renvoie les informations de l'utilisateur
    res.status(200).json({
      authenticated: true,
      message: "Utilisateur authentifié avec succès.",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});

router.post("/reset-password", async (req, res) => {
  console.log("Entre dans le reset....");
  const token = req.query.token;
  const { password } = req.body;
  console.log("Token reçu :", token);
  console.log("Mot de passe reçu :", password);

  const regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;

  if (!regexPassword.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Le mot de passe est invalide. Il doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et avoir une longueur d'au moins 12 caractères.",
      });
  }

  try {
    const userId = req.body.userId;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(400).send("Token invalide ou expiré.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Mot de passe hashé :", hashedPassword);

    user.password = hashedPassword;
    user.resetToken = null;

    await user.save();

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur du serveur");
  }
});

router.post("/code-mail-verify", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Email non trouvé." });
    }
    console.log("Utilisateur trouvé au verify", user);
    // Génération du code de vérification
    const verificationCode = Math.floor(1000 + Math.random() * 9000); // Code à 4 chiffres

    const expirationTime = moment().add(5, "minutes"); // Code expire dans 5 minutes
    console.log(expirationTime);

    user.resetCode = verificationCode;
    user.resetCodeExpiration = expirationTime;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Code de vérification pour réinitialisation du mot de passe",
      text: `Votre code de vérification est : ${verificationCode}.`,
    };

    const transporter = await sendMailer.transporterMailer();

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur d'envoi d'email:", error);
        return res
          .status(500)
          .json({ success: false, message: "Erreur d'envoi de l'email." });
      }
      res.json({
        success: true,
        message: "Un code de vérification a été envoyé.",
      });
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.post("/code-access", async (req, res) => {
  try {
    const { userId, code } = req.body;
    console.log("Requête reçue :", req.body);

    if (!code) {
      console.log("Code manquant");
      return res
        .status(400)
        .json({ success: false, message: "Le code est requis." });
    }

    // Recherche dans la base de données l'utilisateur en fonction du code (ou userId)
    const user = await User.findOne({
      userId: userId,
      resetCode: parseInt(code),
    });

    if (!user) {
      console.log("Utilisateur non trouvé avec ce code");
      return res
        .status(400)
        .json({ success: false, message: "Code incorrect." });
    }

    const currentTime = moment();
    if (currentTime.isAfter(user.resetCodeExpiration)) {
      return res
        .status(400)
        .json({ success: false, message: "Le code a expiré." });
    }

    // Si tout va bien, tu peux répondre que le code est valide
    res.json({ success: true, message: "Code validé." });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.post("/users-role", async (req, res) => {
  const { role, name, email, userId } = req.body; // Récupère le rôle, nom, email, et ID utilisateur depuis le corps de la requête

  try {
    // Si un userId est fourni, met à jour le rôle de cet utilisateur spécifique
    if (userId) {
      const updatedUser = await User.findByIdAndUpdate(
        userId, // L'ID de l'utilisateur à mettre à jour
        { role: role }, // Mise à jour du rôle
        { new: true } // Retourne l'utilisateur mis à jour
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return res.json({ success: true, user: updatedUser }); // Renvoie l'utilisateur mis à jour
    }

    // Si aucun userId n'est spécifié, on récupère tous les utilisateurs
    const filter = role ? { role: role } : {}; // Si un rôle est spécifié, filtre par rôle, sinon récupère tous les utilisateurs

    const users = await User.find(filter);

    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    // Renvoie les utilisateurs récupérés
    res.json({ success: true, users: users });
  } catch (err) {
    console.error(
      "Erreur lors de la récupération ou de la mise à jour des utilisateurs:",
      err
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;

  // Vérifie si le projectId est un ObjectId valide
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ success: false, message: 'Project ID invalide' });
  }

  try {
    const user = await User.findOne({ projectId: projectId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
    console.error(error);
  }
});



router.post("/add-client", async (req, res) => {
  try {
    const { name, email, password, role, projectId } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Nom et email sont requis." });
    }
    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Cet email est déjà utilisé.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name: name,
      email,
      password: hash,
      role: role,
      projectId: projectId,
      isEmailVerified: true
    });

    await user.save()
    res.json({ success: true, message: 'Utilisateur ajouté avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur interne du serveur.");
  }
});

router.delete("/delete-client/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.json({
        success: false,
        message: "Cet utilisateur n'existe pas",
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }


    return res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route pour se déconnecter
router.post("/logout", (req, res) => {
  try {
    res.status(200).send("Déconnecté avec succès.");
  } catch (err) {
    console.error("Erreur lors de la déconnexion :", err);
    res.status(500).send("Erreur interne du serveur lors de la déconnexion.");
  }
});

module.exports = router;
