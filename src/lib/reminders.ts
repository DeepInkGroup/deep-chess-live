const KEY = 'deepchess.tournamentReminders.v1';

export interface TournamentReminder {
  id: string;
  fullName: string;
  startsAt: number;
  notified?: boolean;
}

export function getReminders(): TournamentReminder[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TournamentReminder[]) : [];
  } catch {
    return [];
  }
}

function saveReminders(list: TournamentReminder[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable */
  }
}

export function isReminded(id: string): boolean {
  return getReminders().some((r) => r.id === id);
}

export function addReminder(reminder: Omit<TournamentReminder, 'notified'>) {
  const list = getReminders().filter((r) => r.id !== reminder.id);
  list.push({ ...reminder, notified: false });
  saveReminders(list);
}

export function removeReminder(id: string) {
  saveReminders(getReminders().filter((r) => r.id !== id));
}

export function toggleReminder(reminder: Omit<TournamentReminder, 'notified'>): boolean {
  if (isReminded(reminder.id)) {
    removeReminder(reminder.id);
    return false;
  }
  addReminder(reminder);
  return true;
}

export function markNotified(id: string) {
  saveReminders(getReminders().map((r) => (r.id === id ? { ...r, notified: true } : r)));
}

/** Reminders more than an hour past their start time are stale and safe to drop. */
export function pruneStaleReminders() {
  const cutoff = Date.now() - 60 * 60 * 1000;
  saveReminders(getReminders().filter((r) => r.startsAt > cutoff));
}
