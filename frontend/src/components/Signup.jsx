import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../css/index.css';
import Swal from 'sweetalert2';


const Signup = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if(formData.password !== formData.confirmPassword){
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log('Utilisateur enregistré avec succès :', data);

      // Réinitialiser le formulaire
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setError('');
      Swal.fire("Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte mail.")

    } catch (err) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="bordure">
      <h2>Inscription</h2>
      {error && <p className="error">{error}</p>}
      <form method="POST" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom :</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="caseEmail">
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer votre mot de passe :</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button className='btn-blue' type="submit">S'inscrire</button>

        <button className="btn-green" type="button" onClick={() => navigate('/login')}>Connexion</button>
      </form>
    </div>
  );
};

export default Signup;
