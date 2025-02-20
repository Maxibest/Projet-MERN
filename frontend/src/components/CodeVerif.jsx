import React, { useState } from 'react';
import '../css/codeVerif.css';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const Verif = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    console.log("email côté client : ", email)

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
    };

    const handleSubmit = async (event) => {
        localStorage.setItem('email', email);
        event.preventDefault();

        if (code.includes('')) {
            setError("Veuillez entrer un code valide à 4 chiffres.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/code-access`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Origin: 'http://localhost:3000',
                },
                body: JSON.stringify({ email: email, code: code.join('') }),
            });
            console.log(email, code)


            const data = await response.json();
            if (data.success) {
            // Redirection vers le profil
                navigate('/newPassword', { state: { email: email  } });
            } else {
                Swal.fire('Erreur', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Erreur', 'Une erreur est survenue', 'error');
            setError('Une erreur est survenue');
        }
    };


    return (
        <div className="verification-container">
            <h2>Code de vérification</h2>
            <form method='POST' onSubmit={handleSubmit} className="code-form">
                <div className="code-inputs">
                    {code.map((num, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={num}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="code-input"
                        />
                    ))}
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Valider</button>
            </form>
        </div>
    );
};

export default Verif;
