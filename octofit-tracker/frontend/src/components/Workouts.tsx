import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = { title: string; focus?: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };

// Demo user used to drive workout suggestions until account selection exists.
const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getJson<SuggestionsResponse>(`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`)
      .then((data) => {
        if (!active) return;
        setSuggestions(data.suggestions);
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
        <h2 className="h4">Workout suggestions</h2>
        {status === 'loading' && <p role="status">Loading workout suggestions…</p>}
        {status === 'error' && <p role="alert">Unable to load workout suggestions right now.</p>}
        {status === 'ready' && suggestions.length === 0 && <p>No workout suggestions yet.</p>}
        {status === 'ready' && suggestions.length > 0 && (
          <ul className="list-group">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="list-group-item">
                <strong>{suggestion.title}</strong> — {suggestion.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
