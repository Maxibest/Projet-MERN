import React, { useState } from 'react';
import '../css/index.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Request = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);  // pour gérer l'état de chargement
    const [error, setError] = useState(null);  // gestion d'erreur
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email) {
            Swal.fire('Erreur', 'Veuillez entrer un email valide', 'error');
            return;
        }

        setLoading(true);  // désactive le bouton et indique que la requête est en cours
        setError(null);  // réinitialise l'erreur

        try {
            console.log('Envoi de l\'email:', email);

            const response = await fetch(`http://localhost:3001/api/code-mail-verify`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Origin: 'http://localhost:3000',
                },
                body: JSON.stringify({ email }),
            });
            console.log(email)

            const data = await response.json();
            if (data.success) {
                Swal.fire('Succès', 'Le code de vérification a été envoyé.', 'success');
                setTimeout(() => {
                    navigate('/codeVerif')
                }, 3000); //3 secondes

            } else {
                console.error('Erreur serveur:', data);  // Logge l'erreur serveur
                Swal.fire('Erreur', data.message, 'error');
                setError(data.message);  
            }
        } catch (error) {
            
            Swal.fire('Erreur', 'Une erreur est survenue', 'error');
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bordure">
                <form method='POST'>
                    <div className='caseEmail'>
                        <label>Veuillez entrer votre adresse mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="btn-green"
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}  // Désactive le bouton si une requête est en cours
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                </form>
                {error && <p className="error">{error}</p>} {/* Affiche un message d'erreur si nécessaire */}
            </div>
        </div>
    );
};

export default Request;



