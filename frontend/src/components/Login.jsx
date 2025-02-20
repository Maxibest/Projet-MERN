import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/App.css';
import 'sweetalert2';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Veuillez entrer un email et un mot de passe valides.');
      return;
    }

    console.log('Données envoyées :', { email, password });

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();
      console.log('Réponse du serveur :', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        console.log('Connexion réussie, token enregistré :', data.token);
        Swal.fire({ title: 'Connexion réussie', icon: 'success', text: 'Connexion établie'});
        navigate('/protected');
      } else {
        //data.message envoie les erreurs du back-end
        setError(data.message);
      }
    } catch (err) {
      console.error('Erreur lors de la requête :', err);
      setError('Erreur réseau. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className='bordure'>
      <h2>Connexion</h2>
      {error && <p className="error">{error}</p>}
      <form method='POST' onSubmit={handleSubmit}>
        <div className='caseEmail'>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
       <Link to='/request'><a id='forgot-pass' className='forgot-pass'>Mot de passe oublié</a></Link> 
        <button className='btn-blue' type="submit">Se connecter</button>
        <button className="btn-green" type="button" onClick={() => navigate('/')}>Inscription</button>
      </form>
    </div>
  );
};

export default Login;
