// Faculty list built from a CSV file, with a keyword filter.
// Usage: <div class="faculty" data-csv="data/faculty.csv"></div>
// Columns: name, category (Core Faculty | International Faculty), role, institution,
// department, ssd, keywords (separated by ";"), website, orcid, description.
// Selecting keywords shows the people with ANY of them; the selection is kept in the
// URL (?k=Keyword&k=Other), so a filtered list can be shared. Each person can also be
// linked directly with #surname (e.g. faculty.html#rigon).
(function () {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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

  const SSD = { 'STAT-01/A': 'Statistics', 'STAT-02/A': 'Economic statistics', 'INFO-01/A': 'Computer science' };
  const GROUPS = ['Core Faculty', 'International Faculty'];
  const NOTE = {
    'Core Faculty': 'Statisticians of DEMS and the members of the doctoral committee based in Italy.',
    'International Faculty': 'Members of the doctoral committee based abroad.'
  };
  const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const surname = n => n.trim().split(/\s+/).pop();
  const slug = r => fold(surname(r.name)).replace(/[^a-z0-9]/g, '');
  // "Department of Economics, Management and Statistics (DEMS)" -> "DEMS"
  const deptShort = d => (d.match(/\(([A-Z]{2,})\)$/) || [, d])[1];
  const kws = r => r.keywords ? r.keywords.split(';').map(s => s.trim()).filter(Boolean) : [];
  const ssd = r => r.ssd ? `<span class="chip chip-ssd" title="${esc(SSD[r.ssd] || '')}">${esc(r.ssd)}</span>` : '';

  function init(el) {
    return fetch(el.dataset.csv, { cache: 'no-cache' }).then(r => r.text()).then(text => {
      const rows = parseCSV(text).sort((a, b) => fold(surname(a.name)).localeCompare(fold(surname(b.name))));
      rows.forEach(r => { r._k = kws(r); r._slug = slug(r); });
      const all = [...new Set(rows.flatMap(r => r._k))].sort((a, b) => a.localeCompare(b));
      const count = k => rows.filter(r => r._k.includes(k)).length;

      // selection from the URL (?k=...)
      const params = new URLSearchParams(window.location.search);
      const sel = new Set(params.getAll('k').filter(k => all.includes(k)));

      const tag = (k, on) => `<button type="button" class="fac-tag${on ? ' on' : ''}" data-k="${esc(k)}" aria-pressed="${on}">${esc(k)}</button>`;
      const person = r => `<details class="fac-row" id="${r._slug}" data-slug="${r._slug}">
        <summary>
          <span class="fac-main"><span class="fac-name">${esc(r.name)}</span>
            <span class="fac-role">${esc(r.role)} · ${[deptShort(r.department), r.institution].filter(Boolean).map(esc).join(', ')}</span></span>
          <span class="fac-ssd">${ssd(r)}</span>
          <span class="fac-tags">${r._k.map(k => tag(k, sel.has(k))).join('')}</span>
        </summary>
        <div class="fac-body">
          ${r.description ? `<p>${esc(r.description)}</p>` : ''}
          <p class="fac-meta">${[r.department, r.institution].filter(Boolean).map(esc).join(', ')}${r.ssd ? ` · ${esc(r.ssd)} ${SSD[r.ssd] ? '(' + esc(SSD[r.ssd]) + ')' : ''}` : ''}</p>
          <p class="fac-links">${r.website ? `<a href="${esc(r.website)}">Web page</a>` : ''}${r.orcid ? `<a href="https://orcid.org/${esc(r.orcid)}">ORCID</a>` : ''}</p>
        </div>
      </details>`;

      el.innerHTML = `<div class="fac-tools">
          <p class="fac-help">Select one or more keywords to see who works on them; click a name for a short description.</p>
          <div class="fac-cloud" role="group" aria-label="Keywords">${all.map(k => `<button type="button" class="fac-kw" data-k="${esc(k)}" aria-pressed="${sel.has(k)}">${esc(k)} <span>${count(k)}</span></button>`).join('')}</div>
          <p class="fac-status"><span class="count"></span> <a href="#" class="fac-clear">Clear selection</a></p>
        </div>`
        + GROUPS.map(g => {
          const list = rows.filter(r => r.category === g);
          return list.length ? `<section class="fac-group" data-group="${esc(g)}"><h2 class="fac-h">${esc(g)}</h2><p class="fac-note">${esc(NOTE[g] || '')}</p>${list.map(person).join('')}<p class="fac-empty sem-none" hidden>No one in this group has the selected keywords.</p></section>` : '';
        }).join('');

      const status = el.querySelector('.fac-status .count');
      const clear = el.querySelector('.fac-clear');

      function apply() {
        let shown = 0;
        el.querySelectorAll('.fac-row').forEach(d => {
          const r = rows.find(x => x._slug === d.dataset.slug);
          const ok = !sel.size || r._k.some(k => sel.has(k));
          d.hidden = !ok; if (ok) shown++;
        });
        el.querySelectorAll('.fac-group').forEach(s => {
          s.querySelector('.fac-empty').hidden = !!s.querySelector('.fac-row:not([hidden])');
        });
        el.querySelectorAll('[data-k]').forEach(b => {
          const on = sel.has(b.dataset.k);
          b.setAttribute('aria-pressed', on); b.classList.toggle('on', on);
        });
        status.textContent = sel.size
          ? `${shown} of ${rows.length} people with ${sel.size === 1 ? 'this keyword' : 'any of these ' + sel.size + ' keywords'}.`
          : `${rows.length} people.`;
        clear.hidden = !sel.size;
        // keep the selection in the URL, without adding history entries
        const p = new URLSearchParams(); [...sel].forEach(k => p.append('k', k));
        const q = p.toString();
        history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
      }

      const toggle = k => { sel.has(k) ? sel.delete(k) : sel.add(k); apply(); };
      el.addEventListener('click', ev => {
        const b = ev.target.closest('[data-k]');
        if (b) { ev.preventDefault(); ev.stopPropagation(); toggle(b.dataset.k); return; }
        if (ev.target.closest('.fac-clear')) { ev.preventDefault(); sel.clear(); apply(); }
      });
      apply();

      // a link to a single person (#surname) opens the description and scrolls to it
      const open = () => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const t = id && document.getElementById(id);
        if (!t || !el.contains(t) || !t.classList.contains('fac-row')) return;
        if (t.hidden) { sel.clear(); apply(); }
        t.open = true; t.classList.add('sem-target'); t.scrollIntoView({ block: 'start' });
      };
      window.addEventListener('hashchange', open); open();
    }).catch(() => {
      el.innerHTML = `<p>The list could not be loaded. <a href="${el.dataset.csv}">Download the data (CSV)</a>.</p>`;
    });
  }
  document.querySelectorAll('.faculty[data-csv]').forEach(init);
})();
