// Searchable register tables built from a CSV file.
// Usage: <div class="register" data-csv="data/alumni.csv" data-kind="alumni"
//             data-programme="Name of programme"></div>
// data-kind: alumni | history | students. data-programme filters rows on the
// `programme` column; prefix with "!" to keep every other programme.
(function () {
  const ROMAN = { I: 1, V: 5, X: 10, L: 50 };
  const r2i = s => [...s].reduce((t, c, i, a) => t + (ROMAN[a[i + 1]] > ROMAN[c] ? -ROMAN[c] : ROMAN[c]), 0);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const na = '<span class="na">—</span>';

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

  // "Name (Affiliation)" -> name followed by the affiliation in light grey
  const person = s => {
    const m = s.trim().match(/^(.*?)\s*\((.+)\)$/);
    return m ? `${esc(m[1])} <span class="affil">(${esc(m[2])})</span>` : esc(s.trim());
  };
  const people = v => v ? v.split(';').map(person).join('<br>') : na;
  const CHIPS = { 'Academia': 'academia', 'Postdoc': 'postdoc', 'Research institute': 'research', 'Industry': 'industry' };
  const chip = s => CHIPS[s] ? `<span class="chip chip-${CHIPS[s]}">${esc(s)}</span>` : '';
  const position = r => r.position
    ? chip(r.sector) + '<br>' + esc(r.position)
    : na;
  const thesis = r => r.repository ? `<a href="${esc(r.repository)}">${esc(r.thesis)}</a>` : esc(r.thesis);
  const graduate = {
    noun: ['graduate', 'graduates'],
    head: ['Name', 'Thesis', 'Supervisor', 'Co-supervisor', 'Current position'],
    cells: r => [`<td class="name">${esc(r.name)}<small>PhD in Statistics${r.year ? ', ' + esc(r.year) : ''}</small></td>`,
      `<td class="thesis">${thesis(r)}</td>`, `<td>${people(r.supervisor)}</td>`, `<td>${people(r.co_supervisor)}</td>`, `<td>${position(r)}</td>`]
  };

  // Tutors stay in the CSV; they are shown only for current students.
  const KINDS = {
    alumni: graduate,
    history: graduate,
    students: {
      noun: ['student', 'students'],
      head: ['Name', 'Supervisor', 'Co-supervisor', 'Tutor'],
      cells: r => [`<td class="name">${esc(r.name)}</td>`, `<td>${people(r.supervisor)}</td>`, `<td>${people(r.co_supervisor)}</td>`, `<td>${people(r.tutor)}</td>`]
    }
  };

  async function init(el, k) {
    const kind = KINDS[el.dataset.kind];
    let rows;
    try { rows = parseCSV(await (await fetch(el.dataset.csv)).text()); }
    catch (e) { el.innerHTML = `<p>The table could not be loaded. <a href="${el.dataset.csv}">Download the data (CSV)</a>.</p>`; return; }
    const pf = el.dataset.programme;
    if (pf) rows = rows.filter(r => pf.startsWith('!') ? r.programme !== pf.slice(1) : r.programme === pf);
    const cycles = [...new Set(rows.map(r => r.cycle))].sort((a, b) => r2i(b) - r2i(a));
    const id = 'reg' + k;
    el.innerHTML = `<div class="register-tools">
        <input type="search" id="${id}-q" placeholder="${el.dataset.kind === 'students' ? 'Search name, supervisor, tutor…' : 'Search name, thesis, supervisor, position…'}" aria-label="Search">
        <select id="${id}-c" aria-label="Cycle"><option value="">All cycles</option>${cycles.map(c => `<option>${c}</option>`).join('')}</select>
        <span class="count"></span>
        <a href="${el.dataset.csv}" download>Download CSV</a>
      </div>
      <div class="register-wrap"><table class="register register-${el.dataset.kind}"><thead><tr>${kind.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody></tbody></table></div>`;
    const q = el.querySelector('input'), sc = el.querySelector('select'), body = el.querySelector('tbody'), n = el.querySelector('.count');
    const render = () => {
      const t = q.value.toLowerCase().trim();
      const hit = rows.filter(r => (!sc.value || r.cycle === sc.value) 
        && (!t || Object.values(r).join(' ').toLowerCase().includes(t)));
      body.innerHTML = cycles.map(c => {
        const g = hit.filter(r => r.cycle === c);
        if (!g.length) return '';
        return `<tr class="group"><td colspan="${kind.head.length}">Cycle ${c} · ${g.length} ${kind.noun[g.length === 1 ? 0 : 1]}</td></tr>` +
          g.map(r => `<tr>${kind.cells(r).join('')}</tr>`).join('');
      }).join('') || `<tr><td colspan="${kind.head.length}">No results for this search.</td></tr>`;
      n.textContent = `${hit.length} of ${rows.length}`;
    };
    [q, sc].forEach(x => x.addEventListener('input', render)); render();
  }
  document.querySelectorAll('.register[data-csv]').forEach(init);
})();
