import { useEffect } from 'react';
import { getReminders, markNotified, pruneStaleReminders } from '../lib/reminders';

export default function TournamentReminders() {
  useEffect(() => {
    pruneStaleReminders();

    const tick = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const now = Date.now();
      for (const r of getReminders()) {
        if (!r.notified && r.startsAt <= now) {
          new Notification('Tournament starting', { body: r.fullName, tag: r.id });
          markNotified(r.id);
        }
      }
    };

    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
