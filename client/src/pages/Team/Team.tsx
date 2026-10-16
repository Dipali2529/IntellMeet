
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAccessToken } from "../../services/auth";
import "./Team.css";

interface TeamItem {
  _id: string;
  name: string;
  createdAt: string;
}

import { API_URL as BASE_API_URL } from "../../config/api";

const API_URL = `${BASE_API_URL}/api/teams`;
function Team() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      const token = getAccessToken();

      if (!token) {
        setError("Please log in to view and create teams.");
        setLoadingTeams(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load teams.");
        }

        setTeams(data.teams || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load teams."
        );
      } finally {
        setLoadingTeams(false);
      }
    }

    void loadTeams();
  }, []);

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = teamName.trim();

    if (name.length < 2) {
      setError("Team name must be at least 2 characters.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("Please log in before creating a team.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team.");
      }

      setTeams((previousTeams) => [
        data.team,
        ...previousTeams.filter((team) => team._id !== data.team._id),
      ]);
      setTeamName("");
      setSuccess(`Team "${data.team.name}" created successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create team."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="team-page">
      <header className="team-page-header">
        <div>
          <p className="team-eyebrow">INTELLMEET COLLABORATION</p>
          <h1>Teams</h1>
          <p className="team-subtitle">
            Create a team and invite people to collaborate.
          </p>
        </div>

        <Link to="/dashboard" className="team-back-link">
          Back to Dashboard
        </Link>
      </header>

      <section className="team-create-card">
        <div className="team-card-title">
          <span className="team-plus" aria-hidden="true">+</span>
          <h2>Create a team</h2>
        </div>

        <p className="team-card-description">
          You become its admin and can invite people straight away.
        </p>

        <form onSubmit={handleCreateTeam} className="team-create-form">
          <label htmlFor="team-name">Team name</label>

          <div className="team-input-row">
            <input
              id="team-name"
              type="text"
              placeholder="Platform team"
              value={teamName}
              onChange={(event) => {
                setTeamName(event.target.value);
                setError("");
                setSuccess("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "team-name-error" : undefined}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>

          {error && (
            <p id="team-name-error" className="team-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="team-success" role="status">{success}</p>
          )}
        </form>
      </section>

      <section className="team-create-card">
        <h2>Your teams</h2>

        {loadingTeams && <p>Loading teams...</p>}

        {!loadingTeams && teams.length === 0 && (
          <p>You haven't created or joined any teams yet.</p>
        )}

        {teams.length > 0 && (
          <ul>
            {teams.map((team) => (
              <li key={team._id}>
                <strong>{team.name}</strong>
                <p>
                  Created{" "}
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Team;
