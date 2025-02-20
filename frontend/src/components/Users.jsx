import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/users.css";
import "boxicons/css/boxicons.min.css";
import Swal from 'sweetalert2'


function Users() {
  const [users, setUsers] = useState([]); // users est une variable d'état
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [showProjectForm, setShowProjectForm] = useState(false); // Gérer l'affichage du formulaire de projet
  const [role, setRole] = useState(""); // Rôle à envoyer dans la requête
  const [projectName, setProjectName] = useState(''); // Nom du projet à ajouter

  const deleteUser = async (userId) => {
    // Demande de confirmation avec SweetAler
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/api/delete-client/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "http://localhost:3000",
          },
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire("Supprimé !", "L'utilisateur a été supprimé.", "success");
          console.log("Utilisateur supprimé");
        } else {
          Swal.fire("Erreur", "La suppression a échoué.", "error");
          console.error("Échec de la suppression :", data);
        }
      } catch (err) {
        Swal.fire("Erreur", "Une erreur est survenue.", "error");
        console.error("Erreur lors de la suppression :", err);
      }
    }
  };

  // Fonction pour mettre à jour le rôle dans la base de données via l'API
  const updateRoleInBackend = async (userId, newRole) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users-role/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({ role: newRole }), // Envoie du rôle dans la requête
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log(`Le rôle de l'utilisateur ${userId} a été mis à jour.`);
      } else {
        console.error("Échec de la mise à jour du rôle:", data);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    console.log(
      `Changement de rôle de l'utilisateur ${userId} vers ${newRole}`
    );
    setRole(newRole);
    updateRoleInBackend(userId, newRole); // Appeler la fonction pour mettre à jour le rôle
  };

  const handleAddProject = () => {
    if (projectName.trim()) {
      console.log(`Nom du projet ajouté : ${projectName}`);
      // Ajouter la logique pour envoyer la requête à l'API

      setProjectName('');
      setShowProjectForm(false); // Ferme le formulaire après ajout
    } else {
      alert('Le nom du projet ne peut pas être vide');
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:3001/api/users-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "http://localhost:3000", // CORS pour autoriser les requêtes depuis ce domaine
          },
          body: JSON.stringify({ role: role }), // Envoie du rôle dans le corps de la requête
        });

        const data = await response.json();
        console.log("Données reçues:", data);

        // Vérifie si la réponse contient une liste d'utilisateurs
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users); // Met à jour l'état avec les utilisateurs
        } else {
          console.error("Données invalides:", data);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      } finally {
        setLoading(false); // Arrête le chargement quel que soit le résultat
      }
    }

    fetchUsers();
  }, [role]); // Ne pas oublier le tableau de dépendances

  return (
    <div className="users-container">
      <h2>Liste des utilisateurs</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="actions">
                  <input
                    type="radio"
                    id={`member-${user._id}`}
                    name={`role-${user._id}`}
                    value="member"
                    checked={user.role === "member"}
                    onChange={() => handleRoleChange(user._id, "member")}
                  />
                  <label htmlFor={`member-${user._id}`}>Member</label>

                  <input
                    type="radio"
                    id={`staff-${user._id}`}
                    name={`role-${user._id}`}
                    value="staff"
                    checked={user.role === "staff"}
                    onChange={() => handleRoleChange(user._id, "staff")}
                  />
                  <label htmlFor={`staff-${user._id}`}>Staff</label>

                  <input
                    type="radio"
                    id={`admin-${user._id}`}
                    name={`role-${user._id}`}
                    value="admin"
                    checked={user.role === "admin"}
                    onChange={() => handleRoleChange(user._id, "admin")}
                  />
                  <label htmlFor={`admin-${user._id}`}>Admin</label>
                </td>
                <td>
                  <Link
                    title="Edit"
                    className="link-icon"
                    onClick={() => setShowProjectForm(true)}
                    to={`/project/${user.projectId}`}>
                    <i className='bx bxs-edit-alt'></i>
                  </Link>
                </td>
                <td>
                  <Link
                    title="Afficher"
                    className="link-icon"
                    onClick={() => setShowProjectForm(true)}
                    to={`/project/${user.projectId}`}>
                    <i class='bx bxs-low-vision'></i>
                  </Link>
                </td>
                <td onClick={() => deleteUser(user._id)} className="box-trash">
                  <i className='bx bx-trash'></i>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/protected">
        <button className="return-button">Retour</button>
      </Link>
    </div>
  );
}

export default Users;
