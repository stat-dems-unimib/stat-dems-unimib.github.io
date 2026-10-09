// Seminar list built from a CSV file.
// Usage: <div class="seminars" data-csv="data/seminars.csv"></div>
// Add data-mode="next" to show only the next seminar.
// Columns: date (YYYY-MM-DD), start, end (HH:MM), speaker, website, affiliation, title,
// room, building, note, link, abstract (paragraphs separated by a blank line).
// Seminars that have not ended yet go under "Upcoming"; the others are grouped
// by academic year (September to August), most recent first.
(function () {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function parseCSV(text) {
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    const head = rows.shift();
    return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((k, i) => [k, (r[i] || '').trim()])));
  }

  const ymd = s => s.split('-').map(Number);
  const hm = s => (s || '').split(':').map(Number);
  // local date-time of the seminar (the page is meant for people in Milan)
  const when = (r, t) => { const [y, m, d] = ymd(r.date), [h, mi] = hm(t || r.start || '12:00'); return new Date(y, m - 1, d, h || 0, mi || 0); };
  const ends = r => r.end ? when(r, r.end) : new Date(when(r).getTime() + 3600e3);
  const academicYear = r => { const [y, m] = ymd(r.date); const a = m >= 9 ? y : y - 1; return `${a}/${String((a + 1) % 100).padStart(2, '0')}`; };
  const surname = n => n.trim().split(/\s+/).pop();
  const slug = r => (r.date + '-' + surname(r.speaker)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, '');
  const hours = r => r.start ? esc(r.start) + (r.end ? '–' + esc(r.end) : '') : '';
  const place = r => [r.room, r.building ? 'building ' + r.building : ''].filter(Boolean).map(esc).join(', ');
  const buildingCode = r => (r.building.match(/U\d+/) || [''])[0];
  const who = r => `<span class="sem-speaker">${r.website ? `<a href="${esc(r.website)}">${esc(r.speaker)}</a>` : esc(r.speaker)}</span>${r.affiliation ? ` <span class="affil">(${esc(r.affiliation)})</span>` : ''}`;
  const abstract = r => r.abstract ? r.abstract.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join('') : '<p class="sem-none">Abstract not available.</p>';
  const linkLabel = u => /arxiv\.org/.test(u) ? 'arXiv' : /dems\.unimib\.it/.test(u) ? 'DEMS event page' : 'Related paper';

  // calendar helpers
  const stamp = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
  const summary = r => `${r.speaker}: ${r.title} (DEMS statistics seminar)`;
  const venue = r => [r.room, r.building ? 'building ' + r.building : '', 'University of Milano-Bicocca'].filter(Boolean).join(', ');
  const gcal = r => 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(summary(r)) + '&dates=' + stamp(when(r)) + '/' + stamp(ends(r))
    + '&ctz=Europe/Rome&location=' + encodeURIComponent(venue(r)) + '&details=' + encodeURIComponent(window.location.href.split('#')[0] + '#' + slug(r));
  const icsText = r => {
    const fold = s => s.replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STAT_DEMS//Seminars//EN',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Rome',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE', 'BEGIN:VEVENT',
      'UID:' + slug(r) + '@stat-dems-unimib.github.io', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART;TZID=Europe/Rome:' + stamp(when(r)), 'DTEND;TZID=Europe/Rome:' + stamp(ends(r)),
      'SUMMARY:' + fold(summary(r)), 'LOCATION:' + fold(venue(r)),
      'URL:' + window.location.href.split('#')[0] + '#' + slug(r), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  };
  const map = r => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Università di Milano-Bicocca edificio ' + buildingCode(r));

  // full card, for upcoming seminars
  const card = r => {
    const d = when(r);
    return `<article class="sem-card" id="${slug(r)}">
      <div class="sem-date"><span class="sem-day">${d.getDate()}</span><span class="sem-month">${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}</span><span class="sem-wday">${DAYS[d.getDay()]}</span></div>
      <div class="sem-body">
        <p class="sem-who">${who(r)}${r.note ? ` <span class="chip chip-note">${esc(r.note)}</span>` : ''}</p>
        <h3 class="sem-title">${esc(r.title)}</h3>
        <p class="sem-where"><span><b>${hours(r)}</b></span><span>${place(r)}</span></p>
        <p class="sem-actions">
          <a href="#" data-ics="${slug(r)}">Add to calendar (.ics)</a>
          <a href="${gcal(r)}" target="_blank" rel="noopener">Google Calendar</a>
          ${buildingCode(r) ? `<a href="${map(r)}" target="_blank" rel="noopener">Map of building ${buildingCode(r)}</a>` : ''}
        </p>
        <details class="sem-abstract"><summary>Abstract</summary>${abstract(r)}${r.link ? `<p><a href="${esc(r.link)}">${linkLabel(r.link)}</a></p>` : ''}</details>
      </div>
    </article>`;
  };

  // compact row, for past seminars: click to show the abstract
  const row = r => {
    const d = when(r);
    return `<details class="sem-row" id="${slug(r)}">
      <summary><span class="sem-rdate">${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}</span><span class="sem-rmain">${who(r)}<span class="sem-rtitle">${esc(r.title)}</span></span></summary>
      <div class="sem-rbody">${abstract(r)}
        <p class="sem-meta">${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}${hours(r) ? ', ' + hours(r) : ''} · ${place(r)}${r.note ? ' · ' + esc(r.note) : ''}${r.link ? ` · <a href="${esc(r.link)}">${linkLabel(r.link)}</a>` : ''}</p>
      </div>
    </details>`;
  };

  async function init(el) {
    let rows;
    try { rows = parseCSV(await (await fetch(el.dataset.csv, { cache: 'no-cache' })).text()); }
    catch (e) { el.innerHTML = `<p>The list could not be loaded. <a href="${el.dataset.csv}">Download the data (CSV)</a>.</p>`; return; }
    const now = new Date();
    const next = rows.filter(r => ends(r) >= now).sort((a, b) => when(a) - when(b));
    const past = rows.filter(r => ends(r) < now).sort((a, b) => when(b) - when(a));
    const years = [...new Set(past.map(academicYear))];

    // data-mode="next": only the next seminar (used on the PhD home page)
    if (el.dataset.mode === 'next') el.innerHTML = next.length ? card(next[0]) : '<p class="sem-none">No seminar is scheduled at the moment.</p>';
    else el.innerHTML = `<h2 id="upcoming">Upcoming</h2>`
      + (next.length ? next.map(card).join('') : '<p class="sem-none">New seminars will be announced here.</p>')
      + `<h2 id="past">Past seminars</h2>`
      + years.map(y => {
        const g = past.filter(r => academicYear(r) === y);
        return `<section class="sem-year"><h3 class="sem-group">Academic year ${y} <span>· ${g.length} seminar${g.length === 1 ? '' : 's'}</span></h3>${g.map(row).join('')}</section>`;
      }).join('');

    el.querySelectorAll('[data-ics]').forEach(a => a.addEventListener('click', ev => {
      ev.preventDefault();
      const r = rows.find(x => slug(x) === a.dataset.ics);
      const url = URL.createObjectURL(new Blob([icsText(r)], { type: 'text/calendar' }));
      const t = document.createElement('a'); t.href = url; t.download = 'seminar-' + slug(r) + '.ics';
      document.body.appendChild(t); t.click(); t.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }));

    // a link to a single seminar (#date-surname) opens it and scrolls to it
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const t = id && document.getElementById(id);
      if (!t || !el.contains(t)) return;
      if (t.tagName === 'DETAILS') t.open = true;
      t.classList.add('sem-target'); t.scrollIntoView({ block: 'start' });
    };
    window.addEventListener('hashchange', open); open();
  }
  document.querySelectorAll('.seminars[data-csv]').forEach(init);
})();
