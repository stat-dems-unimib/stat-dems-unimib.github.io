// Upcoming sessions of the PhD Seminar Series, built from two CSV files.
// Usage: <div class="phd-sessions" data-csv="data/phd-seminars.csv" data-students="data/students.csv"></div>
// phd-seminars.csv: date (YYYY-MM-DD), start (HH:MM), year (2, 3 or 4), room, building,
// candidates (separated by ";", in presentation order). Past sessions are not shown.
// Names are linked to the web page and supervisor listed in students.csv.
(function () {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const YEARS = {
    2: ['Second-year seminars', 'Relevant literature and intended research direction, even if only in approximate terms.', 20],
    3: ['Third-year seminars', 'Interim assessment of the results and, where needed, discussion of major changes to the research plan.', 20],
    4: ['Fourth-year seminars', 'Final assessment and pre-submission feedback on the thesis.', 25]
  };

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
  const load = async url => parseCSV(await (await fetch(url, { cache: 'no-cache' })).text());

  const names = r => r.candidates.split(';').map(s => s.trim()).filter(Boolean);
  const start = r => { const [y, m, d] = r.date.split('-').map(Number), [h, mi] = (r.start || '15:00').split(':').map(Number); return new Date(y, m - 1, d, h, mi); };
  const end = r => new Date(start(r).getTime() + names(r).length * (YEARS[r.year] || YEARS[2])[2] * 60e3);
  const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const place = r => r.room ? [r.room, r.building ? 'building ' + r.building : ''].filter(Boolean).join(', ') : 'Room to be announced';
  const stamp = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${hhmm(d).replace(':', '')}00`;
  const gcal = r => 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent('PhD Seminar Series: ' + YEARS[r.year][0].toLowerCase())
    + '&dates=' + stamp(start(r)) + '/' + stamp(end(r)) + '&ctz=Europe/Rome'
    + '&location=' + encodeURIComponent((r.room ? place(r) + ', ' : '') + 'University of Milano-Bicocca')
    + '&details=' + encodeURIComponent(window.location.href.split('#')[0]);

  async function init(el) {
    let rows, people = {};
    try { rows = await load(el.dataset.csv); }
    catch (e) { el.innerHTML = `<p>The schedule could not be loaded. <a href="${el.dataset.csv}">Download the data (CSV)</a>.</p>`; return; }
    try { (await load(el.dataset.students)).forEach(s => { people[s.name] = s; }); } catch (e) { /* names without links */ }
    const person = n => {
      const s = people[n] || {};
      const name = s.website ? `<a href="${esc(s.website)}">${esc(n)}</a>` : esc(n);
      const sup = s.supervisor && s.supervisor !== 'NA' ? ` <span class="affil">supervised by ${esc(s.supervisor.split(';')[0].trim())}</span>` : '';
      return `<li><span class="sem-speaker">${name}</span>${sup}</li>`;
    };
    const now = new Date();
    const next = rows.filter(r => end(r) >= now).sort((a, b) => start(a) - start(b));
    if (!next.length) { el.innerHTML = '<p class="sem-none">The next sessions will be announced here.</p>'; return; }
    el.innerHTML = next.map(r => {
      const d = start(r), [title, goal, slot] = YEARS[r.year] || YEARS[2];
      return `<article class="sem-card" id="year-${esc(r.year)}">
        <div class="sem-date"><span class="sem-day">${d.getDate()}</span><span class="sem-month">${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}</span><span class="sem-wday">${DAYS[d.getDay()]}</span></div>
        <div class="sem-body">
          <h3 class="sem-title">${title}</h3>
          <p class="sem-who">${goal}</p>
          <p class="sem-where"><span><b>${hhmm(d)}–${hhmm(end(r))}</b></span><span>${esc(place(r))}</span></p>
          <ol class="phd-cands">${names(r).map(person).join('')}</ol>
          <p class="sem-meta">About ${slot} minutes per candidate, questions included. The order may change.</p>
          <p class="sem-actions"><a href="${gcal(r)}" target="_blank" rel="noopener">Add to Google Calendar</a></p>
        </div>
      </article>`;
    }).join('');
  }
  document.querySelectorAll('.phd-sessions[data-csv]').forEach(init);
})();
