import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/user.css';
import Swal from 'sweetalert2'

const Yohann = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userInfo, setUserInfo] = useState({ email: '', role: '', name: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Token manquant. Veuillez vous connecter.');
      return;
    }

    fetch(`http://localhost:3001/api/authenticated?token=${token}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.authenticated && data.user) {
          setUserInfo({ email: data.user.email, role: data.user.role, name: data.user.name });
        } else {
          setError('Accès refusé ou session expirée.');
        }
      })
      .catch(error => {
        console.error(error);
        setError('Une erreur s\'est produite lors de la récupération des informations...');
      });
  }, []);
  
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="user-page">
      <div className="user-header">
        <h1>Bonjour, {userInfo.name || "Non disponible"} 👋</h1>
      </div>

      <div className="user-content">
        <p className="welcome-text">Bienvenue sur ta page personnelle</p>

        <div className="user-info-card">
          <h2>Informations personnelles</h2>
          <ul>
            <li><strong>Email :</strong> {userInfo.email || "Non disponible"}</li>
            <li><strong>Rôle :</strong> {userInfo.role || "Non disponible"}</li>
            <li><strong>Nom :</strong> {userInfo.name || "Non disponible"}</li>
          </ul>
        </div>

        <div className="profile-container">
          <img
            src="./images/toshiro.png"
            alt="Photo de profil"
            className="profile-image"
          />
        </div>
      </div>
      <Link to="/protected">
        <button className="return-button">Retour</button>
      </Link>
    </div>
  );
};

export default Yohann;
