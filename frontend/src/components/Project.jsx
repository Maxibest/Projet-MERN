import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../css/project.css';

function Project() {
  const { projectId } = useParams({name: ''});
  console.log("Id user: ",projectId);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`http://localhost:3001/api/project/${projectId}`);
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          console.error("Client introuvable:", data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [projectId]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur non trouvé.</p>;

  return (
    <div className="project-container">
      <div className="project-card">
        <h1>{user.name}</h1>
        <p>Email: {user.email}</p>
        <p>Rôle: {user.role}</p>
      </div>
    </div>
  );
}

export default Project;
