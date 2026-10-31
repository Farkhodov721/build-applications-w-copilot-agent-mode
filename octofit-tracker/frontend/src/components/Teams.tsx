import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getJson<TeamsResponse>('/api/teams')
      .then((data) => {
        if (!active) return;
        setTeams(data.teams);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        {status === 'loading' && <p role="status">Loading teams…</p>}
        {status === 'error' && <p role="alert">Unable to load teams right now.</p>}
        {status === 'ready' && teams.length === 0 && <p>No teams yet.</p>}
        {status === 'ready' && teams.length > 0 && (
          <ul className="list-group">
            {teams.map((team, index) => (
              <li key={index} className="list-group-item">
                {team.name} {team.mascot ? `(${team.mascot})` : ''} — {team.members.length} member(s)
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
