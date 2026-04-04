export function parseISO(str) {
  return new Date(str + (str.includes('T') ? '' : 'T00:00:00'));
}

export function formatDay(dateStr) {
  const d = parseISO(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatHour(dateStr) {
  const d = parseISO(dateStr);
  const h = d.getHours();
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h > 12 ? `${h - 12}pm` : `${h}am`;
}

export function formatMinute(timeStr) {
  const parts = timeStr.split('T')[1];
  const [h, m] = parts.split(':').map(Number);
  const hFmt = h === 0 ? '12' : h > 12 ? `${h - 12}` : `${h}`;
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${hFmt}:${String(m).padStart(2, '0')}${suffix}`;
}
