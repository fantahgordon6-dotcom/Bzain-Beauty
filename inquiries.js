const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const listEl = document.getElementById('list');
const empty = document.getElementById('empty');
const refreshBtn = document.getElementById('refresh');
const exportBtn = document.getElementById('export');
const clearBtn = document.getElementById('clear');

if (!listEl) {
  console.warn('inquiries.js: missing #list element');
}

function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!bookings.length) {
    empty.style.display = 'block';
    exportBtn.disabled = true;
    clearBtn.disabled = true;
    return;
  }
  empty.style.display = 'none';
  exportBtn.disabled = false;
  clearBtn.disabled = false;

  bookings.slice().reverse().forEach((b, idx) => {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.style.padding = '1rem';
    card.innerHTML = `
      <strong>${escapeHtml(b.name || '—')}</strong>
      <div style="color:var(--muted);margin:0.35rem 0">${escapeHtml(b.service || '—')} · ${formatDate(b.date, b.time)}</div>
      <div style="color:var(--muted);font-size:0.95rem">${escapeHtml(b.email || '')} · ${escapeHtml(b.phone || '')}</div>
      <p style="margin-top:0.5rem">${escapeHtml(b.notes || '')}</p>
    `;
    listEl.appendChild(card);
  });
}

function formatDate(dateStr, timeStr) {
  if (!dateStr) return 'No date';
  try {
    const d = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
    return d.toLocaleString();
  } catch (e) {
    return dateStr + (timeStr ? ' ' + timeStr : '');
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

refreshBtn && refreshBtn.addEventListener('click', loadBookings);

exportBtn && exportBtn.addEventListener('click', () => {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  if (!bookings.length) return alert('No enquiries to export.');
  const headers = ['name','email','phone','service','date','time','notes','createdAt'];
  const rows = bookings.map(b => headers.map(h => '"' + (b[h] || '').replaceAll('"', '""') + '"').join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enquiries.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearBtn && clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all saved enquiries? This cannot be undone.')) return;
  localStorage.removeItem('bookings');
  loadBookings();
});

loadBookings();