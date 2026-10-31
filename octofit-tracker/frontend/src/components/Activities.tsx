import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => {
        if (!active) return;
        setActivities(data.activities);
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
        <h2 className="h4">Activities</h2>
        {status === 'loading' && <p role="status">Loading activities…</p>}
        {status === 'error' && <p role="alert">Unable to load activities right now.</p>}
        {status === 'ready' && activities.length === 0 && <p>No activities yet.</p>}
        {status === 'ready' && activities.length > 0 && (
          <ul className="list-group">
            {activities.map((activity, index) => (
              <li key={index} className="list-group-item">
                {activity.type} — {activity.minutes} min — {activity.points} pts
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
