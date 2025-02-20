import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/verifEmail.css';

const confirmEmail = (tokenURL, navigate, setIsVerifEmail, setLoading, setConfirmationMessage) => {
  // Appel à l'API pour confirmer l'email avec le token
  fetch(`http://localhost:3001/api/confirm-email?token=${tokenURL}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Réponse du backend:', data);
      if (data.message === 'Email confirmé.') {
        setConfirmationMessage('Email confirmé !');
        setIsVerifEmail(true); // L'email a été vérifié donc true
        setLoading(false); // Pas de chargement

        // Redirection vers la page protégée après confirmation réussie
        setTimeout(() => {
          navigate('/protected');
        }, 2000);  // Attendre 2 secondes avant la redirection
      } else {
        setConfirmationMessage(data.error || 'Erreur lors de la confirmation.');
        setLoading(false);
      }
    })
    .catch((error) => {
      console.error('Erreur de requête:', error);
      setConfirmationMessage('Erreur de connexion.');
      setLoading(false);
    });
};

const VerifyEmail = () => {
  const navigate = useNavigate();

  // États pour gérer la vérification et les messages
  const [isVerifEmail, setIsVerifEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    // Extraction du token à partir de l'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log('Token récupéré :', token);

    // Si un token est présent, on tente la confirmation, sinon on affiche un message d'erreur
    if (token) {
      confirmEmail(token, navigate, setIsVerifEmail, setLoading, setConfirmationMessage);
    } else {
      setConfirmationMessage('Lien invalide ou expiré.');
      setLoading(false);
    }
  }, [navigate]); 

  return (
    <div className="container">
      {loading ? (
        <div className="loading-screen">
          <h1>Confirmation en cours...</h1>
          <p>Merci de patienter pendant que nous confirmons votre email.</p>
          <div className="loader"></div>
        </div>
      ) : isVerifEmail ? (
        <div className="success-screen">
          <h1>Confirmation réussie !</h1>
          <p>{confirmationMessage}</p>
          <p>Nous vous redirigeons vers la page protégée...</p>
        </div>
      ) : (
        <div className="error-screen">
          <h1>Erreur de confirmation</h1>
          <p>{confirmationMessage}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
