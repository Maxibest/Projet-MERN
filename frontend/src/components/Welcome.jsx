import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/welcome.css';
import Navbar from './Navbar';

const Welcome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('Token récupéré : ', storedToken);
      if (!storedToken) {
        console.log('Aucun token trouvé. Redirection vers la page de login.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/authenticated?token=${storedToken}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
          },
        });

        const jsonData = await response.json();
        console.log('Réponse de l\'API:', jsonData);

        //Vérifie le token utilisateur
        if (jsonData.authenticated) {
          setAuthenticated(true);
          navigate('/protected'); // Redirige vers la page protégée
        } else {
          // Si l'email n'est pas vérifié, message spécifique
          if (jsonData.message === 'Email non vérifié.') {
            setConfirmationMessage('Veuillez vérifier votre email avant de vous connecter.');
          } else {
            setConfirmationMessage('Votre session a expiré. Veuillez vous reconnecter.');
          }
          console.log('Token invalide ou email non vérifié');
          window.alert('Email non vérifié... Redirection vers la page de connexion');
          navigate('/login');
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token :', error);
        setConfirmationMessage('Erreur serveur. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <div className="background-image">
        <img
          src='./images/beautiful-magical.png'
          alt="Beautiful and magical scenery"
          className="background-img"
        />
      </div>
      <div className="content">
        <h1 className="welcome-title">Bienvenue!</h1>
        <a className="description">Soyez la bienvenue</a>
        {confirmationMessage && <p>{confirmationMessage}</p>}
      </div>
    </div>
  );
};

export default Welcome;
