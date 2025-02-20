import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../css/user.css';

const NewPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email] = useState(location.state ? location.state.email : null);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
          Swal.fire({icon: "errror",
            text: "Les mots de passe ne correspondent pas."
          });
          setSuccess(false);
        } else {
          setError(null);
    
          // Appel à l'API pour réinitialiser le mot de passe
          const token = localStorage.getItem('token');
          fetch(`http://localhost:3001/api/reset-password?token=${token}`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Origin: 'http://localhost:3000',
            },
            body: JSON.stringify({
              password: password,
            }),
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                setSuccess(true);
                setPassword("");
                setConfirmPassword("");
                Swal.fire({ icon: "success",
                  text:'Mot de passe modifié !'
                })
              } else {
                window.alert(data.message || 'Erreur lors de la réinitialisation du mot de passe.');
              }
            })
            .catch(error => {
              console.error(error);
              setError('Une erreur s\'est produite lors de la réinitialisation du mot de passe.');
            });
        }
      };
    

    return (
        <div>
            <div className="border-password">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Mot de passe changé avec succès !</p>}
                
                <form className="password-form" onSubmit={handleSubmit}>
                    <h2>Réinitialiser le mot de passe</h2>

                    <div className="input-group">
                        <label>Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">Confirmer</button>
                </form>
            </div>

            <Link to="/protected">
                <button className="return-button">Retour</button>
            </Link>
        </div>
    );
};

export default NewPassword;
