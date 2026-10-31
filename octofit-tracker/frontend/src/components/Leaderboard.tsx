import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: Entry[] };

export default function Leaderboard() {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((data) => {
        if (!active) return;
        setEntries(data.leaderboard);
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
        <h2 className="h4">Leaderboard</h2>
        {status === 'loading' && <p role="status">Loading leaderboard…</p>}
        {status === 'error' && <p role="alert">Unable to load the leaderboard right now.</p>}
        {status === 'ready' && entries.length === 0 && <p>No leaderboard rankings yet.</p>}
        {status === 'ready' && entries.length > 0 && (
          <ol className="list-group list-group-numbered">
            {entries.map((entry) => (
              <li key={entry.rank} className="list-group-item">
                #{entry.rank} {entry.teamName} — {entry.totalPoints} pts
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
