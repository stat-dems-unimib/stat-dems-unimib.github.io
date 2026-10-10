// Faculty list built from a CSV file, with a keyword filter.
// Usage: <div class="faculty" data-csv="data/faculty.csv"></div>
// Columns: name, category (Faculty | International Faculty), role, institution,
// department, ssd, keywords (separated by ";"), website, orcid, description.
// A drop-down menu filters by research area (keyword) and a text box searches names,
// institutions, keywords and descriptions. The area is kept in the URL (?k=Keyword),
// so a filtered list can be shared. Each person can also be
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

  const SSD = { 'STAT-01/A': 'Statistics', 'STAT-02/A': 'Economic statistics', 'INFO-01/A': 'Computer science', 'IINF-05/A': 'Information processing systems' };
  const GROUPS = ['Faculty', 'International Faculty'];
  const NOTE = {
    'Faculty': '',
    'International Faculty': 'Members of the doctoral committee based abroad.'
  };
  const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const surname = n => n.trim().split(/\s+/).pop();
  const slug = r => fold(surname(r.name)).replace(/[^a-z0-9]/g, '');
  // "Department of Economics, Management and Statistics (DEMS)" -> "DEMS"
  const deptShort = d => (d.match(/\(([A-Z]{2,})\)$/) || [, d])[1];
  const kws = r => r.keywords ? r.keywords.split(';').map(s => s.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];
  const ssd = r => r.ssd ? `<span class="chip chip-ssd" title="${esc(SSD[r.ssd] || '')}">${esc(r.ssd)}</span>` : '';

  function init(el) {
    return fetch(el.dataset.csv, { cache: 'no-cache' }).then(r => r.text()).then(text => {
      const rows = parseCSV(text).sort((a, b) => fold(surname(a.name)).localeCompare(fold(surname(b.name))));
      rows.forEach(r => { r._k = kws(r); r._slug = slug(r); });
      const all = [...new Set(rows.flatMap(r => r._k))].sort((a, b) => a.localeCompare(b));
      const count = k => rows.filter(r => r._k.includes(k)).length;

      // research area from the URL (?k=...)
      let sel = new URLSearchParams(window.location.search).get('k') || '';
      if (!all.includes(sel)) sel = '';
      let query = '';

      const tag = k => `<a href="?k=${encodeURIComponent(k)}" class="fac-tag" data-k="${esc(k)}">${esc(k)}</a>`;
      const person = r => `<details class="fac-row" id="${r._slug}" data-slug="${r._slug}">
        <summary>
          <span class="fac-main"><span class="fac-name">${esc(r.name)}</span>
            <span class="fac-role">${esc(r.role)} · ${[deptShort(r.department), r.institution].filter(Boolean).map(esc).join(', ')}</span></span>
          <span class="fac-ssd">${ssd(r)}</span>
          <span class="fac-tags">${r._k.map(tag).join('<span class="fac-sep" aria-hidden="true"> · </span>')}</span>
        </summary>
        <div class="fac-body">
          ${r.description ? `<p>${esc(r.description)}</p>` : ''}
          <p class="fac-meta">${[r.department, r.institution].filter(Boolean).map(esc).join(', ')}${r.ssd ? ` · ${esc(r.ssd)} ${SSD[r.ssd] ? '(' + esc(SSD[r.ssd]) + ')' : ''}` : ''}</p>
          <p class="fac-links">${r.website ? `<a href="${esc(r.website)}">Web page</a>` : ''}${r.orcid ? `<a href="https://orcid.org/${esc(r.orcid)}">ORCID</a>` : ''}</p>
        </div>
      </details>`;

      el.innerHTML = `<div class="register-tools fac-tools">
          <select aria-label="Research area" class="fac-select">
            <option value="">All research areas (${rows.length})</option>
            ${all.map(k => `<option value="${esc(k)}">${esc(k)} (${count(k)})</option>`).join('')}
          </select>
          <input type="search" class="fac-search" placeholder="Search by name or topic" aria-label="Search by name or topic">
          <span class="count"></span>
        </div>`
        + GROUPS.map(g => {
          const list = rows.filter(r => r.category === g);
          return list.length ? `<section class="fac-group" data-group="${esc(g)}"><h2 class="fac-h">${esc(g)}</h2>${NOTE[g] ? `<p class="fac-note">${esc(NOTE[g])}</p>` : ''}${list.map(person).join('')}<p class="fac-empty sem-none" hidden>No one in this group matches the selection.</p></section>` : '';
        }).join('');

      const select = el.querySelector('.fac-select');
      const search = el.querySelector('.fac-search');
      const status = el.querySelector('.fac-tools .count');
      const haystack = r => fold([r.name, r.role, r.institution, r.department, r.ssd, r.keywords, r.description].join(' '));

      function apply() {
        let shown = 0;
        const q = fold(query.trim());
        el.querySelectorAll('.fac-row').forEach(d => {
          const r = rows.find(x => x._slug === d.dataset.slug);
          const ok = (!sel || r._k.includes(sel)) && (!q || haystack(r).includes(q));
          d.hidden = !ok; if (ok) shown++;
        });
        el.querySelectorAll('.fac-group').forEach(s => {
          s.querySelector('.fac-empty').hidden = !!s.querySelector('.fac-row:not([hidden])');
        });
        el.querySelectorAll('.fac-tag').forEach(a => a.classList.toggle('on', a.dataset.k === sel));
        select.value = sel;
        status.textContent = sel || q ? `${shown} of ${rows.length} people` : `${rows.length} people`;
        // keep the area in the URL, without adding history entries
        history.replaceState(null, '', window.location.pathname + (sel ? '?k=' + encodeURIComponent(sel) : '') + window.location.hash);
      }

      select.addEventListener('change', () => { sel = select.value; apply(); });
      search.addEventListener('input', () => { query = search.value; apply(); });
      // a keyword under a name selects that area (clicking it again clears the filter)
      el.addEventListener('click', ev => {
        const a = ev.target.closest('.fac-tag');
        if (!a) return;
        ev.preventDefault(); ev.stopPropagation();
        sel = sel === a.dataset.k ? '' : a.dataset.k; apply();
        el.querySelector('.fac-tools').scrollIntoView({ block: 'nearest' });
      });
      apply();

      // a link to a single person (#surname) opens the description and scrolls to it
      const open = () => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const t = id && document.getElementById(id);
        if (!t || !el.contains(t) || !t.classList.contains('fac-row')) return;
        if (t.hidden) { sel = ''; query = ''; search.value = ''; apply(); }
        t.open = true; t.classList.add('sem-target'); t.scrollIntoView({ block: 'start' });
      };
      window.addEventListener('hashchange', open); open();
    }).catch(() => {
      el.innerHTML = `<p>The list could not be loaded. <a href="${el.dataset.csv}">Download the data (CSV)</a>.</p>`;
    });
  }
  document.querySelectorAll('.faculty[data-csv]').forEach(init);
})();
