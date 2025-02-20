import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/navbar.css';
import Swal from 'sweetalert2'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', role: '' });
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token manquant. Veuillez vous connecter.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/authenticated?token=${token}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
          },
        });

        const data = await response.json();
        console.log('Données récupérées depuis l’API :', data);  // Ajout de logs


        if (data.authenticated && data.user) {
          console.log('Utilisateur authentifié :', data.user);
          setIsLoggedIn(true);
          setUserInfo({ name: data.user.name, role: data.user.role });
          console.log(userInfo.name);
        } else {
          setIsLoggedIn(false);
          setError('Accès refusé ou session expirée.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des informations :', err);
        setError('Une erreur s\'est produite. Veuillez réessayer.');
      }
    };

    checkAuthAndFetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        navigate('/login'); // Redirection après déconnexion
        Swal.fire({ title: 'Déconnexion réussi', icon: 'success', text: 'vous avez été déconnecté'})
      } else {
        alert('Erreur lors de la déconnexion.');
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion :', err);
    }
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>Bienvenue sur notre site !</h1>
      </div>
      <div className="navbar-right">
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`burger-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className={`menu-items ${isMenuOpen ? 'open' : ''}`}>
          <div className="users">
            {userInfo && (userInfo.role === "admin" || userInfo.role === "staff") && (
              <Link to="/users">
                Utilisateurs
              </Link>
            )}
          </div>

          <div className='users-util'>
          {userInfo && (userInfo.role === "admin") && (
              <Link to="/add-client" className="return-button-green">
                Ajouter un client
              </Link>
            )}
          </div>
          {isLoggedIn ? (
            <Link onClick={handleLogout} className="cta-button">
              Se déconnecter
            </Link>
          ) : (
            <Link to="/login" className="cta-button">
              Se connecter
            </Link>
          )}
          <div className="navbar-utilisateur">
            <Link to="/profile">{userInfo.name}</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;