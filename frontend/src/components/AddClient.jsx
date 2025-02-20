import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/users.css";
import "../css/addClient.css";
import Swal from 'sweetalert2';

function AddClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member"); // Par défaut, membre
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newClient = { name, email, password, role };

    try {
      const response = await fetch("http://localhost:3001/api/add-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(newClient),
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire("Client ajouté", "success", "Client ajouté avec succès !");
        navigate("/protected"); 
      } else {
        Swal.fire(
          "**Erreur",
          "error",
          "Une erreur est survenue lors de l'ajout"
        );
      }
    } catch (error) {
      console.error("Erreur serveur:", error);
    }
  };

  return (
    <div className="add-client-container">
      <h2>Ajouter un client</h2>
      <form method="POST" onSubmit={handleSubmit}>
        <label>Nom:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Rôle:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Membre</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Ajouter</button>
      </form>

      <Link to="/protected">
        <button className="return-button">Retour</button>
      </Link>
    </div>
  );
}

export default AddClient;
