# Aggiornare le pagine del PhD

Questa guida spiega da dove vengono i dati delle pagine *PhD alumni*, *Current PhD students* e *Faculty* e come aggiornarli. Tutti i dati stanno in file CSV; il sito si limita a leggerli.

- `phd/data/alumni.csv`: dottori di ricerca (dal ciclo XXXIV e storico completo dalla fondazione di Bicocca)
- `phd/data/students.csv`: dottorandi in corso
- `phd/data/faculty.csv`: docenti del curriculum, con keyword e descrizioni (sezione 2.5)

Dopo ogni modifica: `quarto render`, poi commit (inclusa la cartella `docs/`) e push.

---

## 1. Formato dei file

### `alumni.csv`

| colonna | contenuto | esempio |
|---|---|---|
| `programme` | dottorato di appartenenza (non mostrato sul sito, serve a separare le due tabelle) | `Economics, Statistics and Data Science` |
| `cycle` | ciclo in numeri romani | `XXXVII` |
| `year` | anno di discussione della tesi | `2026` |
| `name` | nome e cognome | `Luca Presicce` |
| `website` | pagina web della persona (anche in `students.csv`): preferire il sito personale (github.io, Google Sites, dominio proprio) se aggiornato, altrimenti la pagina istituzionale dell'ente attuale. Mai LinkedIn, ResearchGate, Scholar | |
| `thesis` | titolo della tesi | |
| `supervisor` | supervisore | `Tommaso Rigon` |
| `co_supervisor` | co-supervisore/i | `Sudipto Banerjee (UCLA)` |
| `tutor` | tutor interno (nel CSV, **non** mostrato tra gli alumni) | |
| `sector` | `Academia` (giallo pieno: posizioni di ruolo o in tenure track, cioè professori, RTD-B, RTT), `Academia (other)` (giallo chiaro: posizioni accademiche a termine o non di ruolo, es. RTD-A, docenti a contratto, teaching track, ricercatori non in tenure track), `Postdoc` (postdoc e assegnisti), `Research institute` (enti e istituti di ricerca non universitari, es. IRCCS, CNR), `Public sector` (pubblica amministrazione ed enti pubblici non di ricerca, es. agenzie regionali, autorità di regolazione), `Industry` (aziende), oppure vuoto. Si può indicare il settore senza la posizione, se la posizione esatta non è nota: sul sito compare solo l'etichetta | |
| `position` | posizione attuale | `Postdoctoral Fellow, Department of Biostatistics, Johns Hopkins Bloomberg School of Public Health` |
| `previous_position` | lasciare vuoto: si tiene solo la posizione attuale (colonna non mostrata sul sito) | |
| `repository` | link alla tesi su BOA (per le tesi discusse prima del 2010, permalink OPAC SBN `http://id.sbn.it/bid/...`; per le tesi in cotutela depositate solo all'estero, la scheda del catalogo nazionale, es. theses.fr) | `https://hdl.handle.net/10281/595381` |
| `cycle_estimated` | `yes` se il ciclo non è documentato ed è stato stimato dall'anno di discussione (ciclo più frequente tra le tesi discusse nello stesso anno); sul sito compare in piccolo "cycle estimated". Se un CV o ORCID riporta l'anno di inizio del dottorato, il ciclo si ricava da quello (il ciclo N inizia nell'anno 1984+N, es. XXI → 2005) e non va marcato come stimato | |

L'ordine delle righe nel CSV non conta: le tabelle sul sito mostrano ogni ciclo in ordine alfabetico per cognome. Il cognome è l'ultima parola del nome, con l'eventuale particella che la precede (De, Di, Del…); i cognomi composti senza particella (es. *Nai Ruscone*) vanno aggiunti alla lista `COMPOUND` in `assets/register.js`.

Celle vuote e `NA`: una cella vuota indica un dato che non esiste (nessun co-supervisor, tutor non ancora assegnato) e sul sito compare come trattino grigio. Se il dato esiste ma non è noto, scrivere `NA` (supervisor, co-supervisor, tutor): sul sito compare un "NA" rosso. Per le posizioni degli alumni basta lasciare vuoti `position` e `sector`: compaiono automaticamente come NA rosso.

Valori ammessi per `programme`:

- `Economics, Statistics and Data Science` → tabella "Statistics curriculum, since cycle XXXIV"
- `Methodological and Applied Statistics`, `Statistics`, `Statistics and Applications`, `Statistics and Mathematical Finance` → tabella "Earlier doctoral programmes"

Lo storico include solo dottorati di statistica e affini; *Matematica per l'analisi dei mercati finanziari* è stato escluso di proposito. Di *Statistics and Mathematical Finance* si tiene solo il curriculum statistico: le tesi del curriculum finanza vanno escluse (il curriculum non compare su BOA, quindi va verificato caso per caso; nel 2026 Roberto Ascari ha indicato quali rimuovere: Daluiso, Ruffo, Colombo, Del Gusto, Gonzato, Brignone, Gambaro, Santangelo, Arduca, Bartesaghi, Canna, Kutrolli, Sonubi).

### `students.csv`

Colonne `cycle, name, supervisor, co_supervisor, tutor`. Qui i tutor sono mostrati.

### Convenzioni (valgono per entrambi i file)

- **Più persone nello stesso campo**: separate da `;` → `Franca Crippa; Patrizia Farina`
- **Supervisori esterni a Milano-Bicocca**: affiliazione sintetica tra parentesi, che il sito mostra in grigio → `Raffaele Argiento (Univ. Bergamo)`, `Michele Guindani (UCLA)`. Per lo storico si usa l'affiliazione all'epoca della tesi.
- Nessuna affiliazione = interno a Bicocca.
- Posizioni in inglese, nella forma `Ruolo, Istituzione`.
- Nessun indirizzo email nei file: il sito è pubblico.

---

## 2. Fonti

### 2.1 Elenco dei dottori di ricerca e tesi

**Cicli XXXIV–XXXVI** — pagine alumni del sito DEMS, sezione *Curriculum STATISTICS* (titolo, tutor, supervisor):

- XXXIV: <https://www.dems.unimib.it/en/node/1048>
- XXXV: <https://www.dems.unimib.it/en/node/1049>
- XXXVI: <https://www.dems.unimib.it/en/node/1050>

I link ai cicli successivi, quando ci saranno, sono in fondo alla [pagina del dottorato](https://www.dems.unimib.it/en/programmes/post-lauream/phd-economics-statistics-and-data-science).

**Cicli recenti non ancora sul sito DEMS** (es. XXXVII) e **tutti i link alle tesi** — [BOA](https://boa.unimib.it):

1. Cercare `"Cognome, I"` (es. `"Presicce, L"`) oppure parte del titolo tra virgolette.
2. Aprire la scheda della tesi con `?mode=full` in fondo all'URL (es. `https://boa.unimib.it/handle/10281/595381?mode=full`). Campi utili:
   - `dc.coverage.academiccycle` → ciclo
   - `dc.date.issued` → anno
   - `dc.title` → titolo
   - `dc.identifier.uri` → link per la colonna `repository` (`https://hdl.handle.net/10281/...`)
   - `dc.authority.advisor`, `dc.description.advisor`, `dc.description.cotutor` → indicazione di massima su supervisore/tutor (vedi sotto)
   - `dc.authority.phdCourse` → nome del dottorato (solo per le tesi più vecchie)

**Storico (prima del 2018)** — BOA, cercando il nome del corso tra virgolette:

- `"STATISTICA - 11R"` → `Statistics`
- `"STATISTICA ED APPLICAZIONI"` → `Statistics and Applications`
- `"STATISTICA E MATEMATICA PER LA FINANZA - 82R"` e `"STATISTICA E FINANZA MATEMATICA"` → `Statistics and Mathematical Finance`

La collezione *07 - Tesi di dottorato Bicocca post 2009* parte dal 2010. Le tesi precedenti, quando ci sono, stanno nella collezione *09 - Tesi di dottorato*, che però raccoglie soprattutto tesi discusse **in altri atenei** e caricate dai docenti tra le proprie pubblicazioni (es. Pennoni, Firenze; Zaccaria, Sapienza; Peluso, USI): il campo `dc.publisher.name` e la citazione automatica dicono spesso "Milano-Bicocca" anche quando non è vero, quindi l'ateneo va sempre verificato sul frontespizio. Nell'ottobre 2026 da questa collezione sono state aggiunte Radaelli (`STATISTICA METODOLOGICA ED APPLICATA`, ciclo XVI → `Methodological and Applied Statistics`) e Barbiano di Belgiojoso (`Statistica`, ciclo XXI); è stata esclusa la tesi di Vittadini (1987, precedente alla nascita di Bicocca).

**Tesi 2000–2009** — la fonte principale è il catalogo nazionale [OPAC SBN](https://opac.sbn.it): le tesi di dottorato sono depositate nelle biblioteche nazionali di Roma e Firenze. Cercare `dottorato Bicocca` (circa 500 risultati, tutte le discipline) e filtrare quelle di statistica; nella scheda, le *Note generali* riportano il frontespizio ("In testa al frontespizio: Università degli studi di Milano-Bicocca…"), il ciclo e l'anno accademico, e il titolo riporta relatori e correlatori. Nella colonna `repository` va il permalink SBN (`http://id.sbn.it/bid/...`). Programmi dell'epoca: `dottorato di ricerca in statistica` → `Statistics`; `statistica metodologica ed applicata` → `Methodological and Applied Statistics` (predecessore di *Statistica ed applicazioni*). Escludere *Statistica biomedica* (Università di Milano) e *Marketing, gestione delle imprese e metodi statistici di valutazione*. Quando il ciclo non è indicato lo si stima dall'anno di discussione e si scrive `yes` in `cycle_estimated` (in alternativa `NA`, che il sito raggruppa in fondo come "Cycle not known"). **Attenzione ai cicli di transizione (XIV e precedenti, iniziati nel 1998 o prima):** per alcuni di questi il frontespizio dice "Milano-Bicocca" mentre il CV della persona indica l'Università degli Studi di Milano (es. Pelagatti e Solaro, XIV ciclo); dal XV ciclo i CV confermano Bicocca (Salini, Quatto). La discordanza potrebbe dipendere dal consorzio dell'epoca tra Statale, Trento e Bicocca; per ora queste tesi restano nell'elenco, in attesa di conferma dagli interessati. Secondo Pelagatti, del suo stesso ciclo (XIV) erano anche Chirico e Rosaria Ignaccolo; la tesi di Ignaccolo, in cotutela con Paris 6, non è nel catalogo SBN ma su [theses.fr](https://theses.fr/2002PA066416). Un controllo incrociato utile è il [Mathematics Genealogy Project](https://www.mathgenealogy.org) (ricerca per istituzione "Bicocca").

### 2.2 Supervisore, co-supervisore e tutor

I campi "advisor" di BOA **non sono affidabili**: spesso mescolano tutor e supervisore. La fonte giusta è il **frontespizio della tesi** (il PDF è scaricabile dalla scheda BOA). Regole usate:

1. Si riportano le etichette del frontespizio: *Supervisor/Relatore* → `supervisor`; *Co-supervisor/Co-tutor/Correlatore/External supervisor* → `co_supervisor`; *Tutor* → `tutor`.
2. Se ci sono due "Supervisors" alla pari, il primo va in `supervisor` e il secondo in `co_supervisor`. Se ci sono *Supervisor* e *Internal supervisor*, il primo è `supervisor` e l'interno è `co_supervisor`.
3. Se il frontespizio indica solo un tutor, il tutor va anche in `supervisor`.
   Eccezione per i primi cicli di *Statistica* (XV–XVI): se il frontespizio riporta solo "coordinatore" e "tutor", il coordinatore (Donata Marasini) è il `supervisor` e il tutor il `co_supervisor` (confermato da Sonia Migliorati per la tesi di Quatto). Se invece compare un "relatore", il coordinatore non va indicato.
4. Se il frontespizio non indica nessuno (o il PDF non è leggibile), si usa il dato BOA e lo si considera provvisorio.

Per i cicli XXXIV–XXXVI le pagine DEMS elencano già tutor e supervisori; quando ne indicano più di uno, il primo è il supervisore e gli altri i co-supervisori.

### 2.3 Dottorandi in corso

L'elenco viene dal modulo raccolto dal coordinamento del dottorato (esportazione con colonne: data, email, nome, supervisore, email, co-supervisore, email, tutor, email, data di inizio, ciclo). Si copiano in `students.csv` solo nome, ciclo, supervisore, co-supervisore e tutor, aggiungendo l'affiliazione per gli esterni. Quando un dottorando discute la tesi, la sua riga passa da `students.csv` ad `alumni.csv`.

### 2.4 Posizioni attuali

In ordine di affidabilità:

1. **Informazione diretta** (dalla persona o da un collega).
2. **Pagina personale o profilo istituzionale** (es. `https://en.unimib.it/nome-cognome`, pagine di dipartimento, Google Sites, GitHub Pages).
3. **Banca dati MUR dei docenti** per chi lavora in un'università italiana: [Cerca Università](https://cercauniversita.mur.gov.it). Cercare per cognome e nome con ruolo *Professori Ordinari, Associati e Ricercatori*, poi ripetere con *Ricercatori a tempo determinato*. Non filtrare per settore: alcuni alumni sono passati a settori non statistici (es. Anna Simonetto, oggi in AGRI-05/A). Per distinguere gli omonimi conviene usare il menu *Situazione al* (31/12 degli anni passati): la carriera nel tempo, l'ateneo e il legame con il relatore (es. tesi con un relatore di Brescia e carriera a Brescia) chiariscono quasi sempre se si tratta della stessa persona.
4. **LinkedIn** per chi lavora fuori dall'accademia.

Corrispondenza dei ruoli MUR:

| MUR | nel CSV |
|---|---|
| Ordinario | `Full Professor` |
| Associato | `Associate Professor` |
| Ricercatore a t.d. L.240/10 tipo A | `Assistant Professor (RTD-A)` |
| Ricercatore a t.d. L.240/10 tipo B | `Tenure-track Assistant Professor (RTD-B)` |
| Ricercatore a t.d. L.79/2022 | `Tenure-track Assistant Professor (RTT)` |

Gli assegnisti non compaiono nella banca dati MUR: per loro serve il profilo di ateneo (`Research fellow`).

### 2.5 Faculty (`phd/data/faculty.csv`)

La pagina *Faculty* elenca le persone del curriculum di Statistica con keyword, settore, dipartimento e una breve descrizione. Si filtra con un menu a tendina per area di ricerca (keyword) e con una ricerca libera su nomi, atenei, keyword e descrizioni; anche cliccando una keyword sotto un nome si seleziona quell'area. L'area scelta resta nell'URL, quindi si può condividere: `faculty.html?k=Bayesian%20nonparametrics`. Ogni persona ha anche un link diretto: `faculty.html#rigon`.

Chi c'è (ottobre 2026):

- `Faculty`: docenti DEMS di STAT-01/A e STAT-02/A, Antonio Candelieri, e i membri del collegio dei curricula STAT e BIDAB con sede in Italia, esclusi i membri BIDAB che non lavorano in statistica o data science (Bertoletti, Guerzoni, Manera, Naimzada, Cambria, Hecq, Tamburri). Fabio Mercorio (IINF-05/A, DISMEQ), escluso nella prima versione, è stato aggiunto: lavora in data science e IA, come Candelieri.
- `International Faculty`: i membri STAT/BIDAB del collegio con sede all'estero.

Esclusi di proposito: il curriculum ECO, i relatori esterni non presenti nelle due liste, assegnisti e ricercatori a contratto.

| colonna | contenuto |
|---|---|
| `name` | nome e cognome; il cognome è l'ultima parola e decide l'ordine e il link `#cognome` |
| `category` | `Faculty` oppure `International Faculty` |
| `role` | ruolo in inglese, con la corrispondenza MUR della sezione 2.4 |
| `institution`, `department` | ateneo e dipartimento in inglese; se il dipartimento finisce con una sigla tra parentesi, es. `(DEMS)`, l'elenco mostra la sigla |
| `ssd` | settore 2024 dal MUR (`STAT-01/A`, `STAT-02/A`, `INFO-01/A`, `IINF-05/A`); vuoto per CNR ed estero. Un settore nuovo va aggiunto anche alla tabella `SSD` in `assets/faculty.js`, che ne mostra il nome |
| `keywords` | 2-5 keyword separate da `;`, prese dal vocabolario comune qui sotto |
| `website` | stesse regole degli alumni: sito personale se aggiornato, altrimenti pagina istituzionale; mai LinkedIn, ResearchGate, Scholar |
| `orcid` | solo il codice, es. `0000-0002-9224-543X` |
| `description` | una o due frasi in inglese, in terza persona ("Works on ..."), riprese il più possibile dalla pagina della persona |
| `source` | `own page` se keyword e descrizione vengono dalla pagina personale, istituzionale o dal CV della persona; `publications` se sono ricavate dalle pubblicazioni (non mostrata sul sito) |

**Keyword.** Il filtro funziona solo se tutti usano le stesse parole: prima di inventarne una nuova, controllare se ne esiste già una adatta, ed evitare keyword con una sola persona (meglio accorparle a un'area più ampia) e aree che rischiano di essere divisive, cioè di stabilire chi ne fa parte e chi no (per questo è stata tolta *Probability*). Vocabolario attuale (22 aree, 1-5 per persona; sul sito le keyword di ciascuno sono in ordine alfabetico): Bayesian methods; Bayesian nonparametrics; Business and marketing analytics; Clustering and mixture models; Compositional and bounded data; Computational statistics; Design of experiments; Environment and energy; Functional data analysis; Graphical models and causal inference; Health and biostatistics; Industrial statistics and reliability; Inequality, labour and education; Latent variable models; Machine learning and optimization; Robust statistics; Spatial and spatio-temporal statistics; Statistical ecology; Statistical inference and testing; Survey methods and composite indicators; Time series and econometrics; Transport and road safety.

**Fonti.** Ruolo, ateneo, struttura e SSD vengono dalla banca dati MUR. Keyword e descrizioni vengono, quando c'è, dalla descrizione che la persona dà di sé: sito personale (Argiento, Mercorio, Nipoti tra gli ultimi), biografia sulla pagina di ateneo (Bicocca, Cattolica tramite `docenti.unicatt.it`), CV (Tommasi), profilo istituzionale (internazionali). Chi non ha un testo del genere (colonna `source` = `publications`) ha keyword e descrizione ricavate dalle pubblicazioni dal 2015 su [OpenAlex](https://openalex.org): sono bozze da far confermare. Quando qualcuno manda la propria descrizione, va sostituita e `source` diventa `own page`. I siti personali vengono dai profili ORCID o dalle pagine di ateneo e sono stati aperti uno per uno (ottobre 2026); quello di Nipoti (bernardonipoti.com) non risponde, per lui si usa la pagina di Bicocca.

---

## 3. Strumenti rapidi (console del browser)

Questi frammenti di JavaScript si incollano nella console del browser (Strumenti per sviluppatori → Console) **mentre si è sul sito indicato**, così le richieste partono dallo stesso dominio.

### Scheda BOA completa di una o più tesi

Da una pagina qualsiasi di `https://boa.unimib.it`:

```js
const ids = [595381, 594842];   // numeri finali dell'handle
for (const id of ids) {
  const h = await fetch(`/handle/10281/${id}?mode=full`).then(r => r.text());
  const d = new DOMParser().parseFromString(h, 'text/html');
  const rec = [...d.querySelectorAll('tr')]
    .map(tr => [...tr.querySelectorAll('td')].map(c => c.textContent.trim()))
    .filter(c => /academiccycle|date\.issued|dc\.title$|advisor|cotutor|phdCourse/.test(c[0] || ''));
  console.log(id, rec.map(c => c[0] + ' = ' + c[1]).join('\n'));
}
```

### Ruolo e ateneo dalla banca dati MUR

Dalla home di `https://cercauniversita.mur.gov.it`:

```js
const persone = [['ASCARI', 'ROBERTO'], ['DENTI', 'FRANCESCO']];
const f = document.forms[1];
for (const [cognome, nome] of persone) {
  for (const ruolo of ['00', 'RD']) {           // 00 = PO/PA/RU, RD = ricercatori a t.d.
    const fd = new FormData(f);
    // fd.set('filtri_ricerca_docenti_form[situazioni]', '31122021');  // situazione al 31/12/2021 (default: ad oggi)
    fd.set('filtri_ricerca_docenti_form[cognome]', cognome);
    fd.set('filtri_ricerca_docenti_form[nome]', nome);
    fd.set('filtri_ricerca_docenti_form[ruolo]', ruolo);
    const h = await fetch(f.action, { method: 'POST', body: fd }).then(r => r.text());
    const d = new DOMParser().parseFromString(h, 'text/html');
    [...d.querySelectorAll('table tr')].slice(1)
      .forEach(tr => console.log(tr.innerText.replace(/\s+/g, ' ')));
  }
}
```

---

## 4. Aggiornamento con Claude

Per ripetere il lavoro in automatico basta collegare questa cartella e chiedere, per esempio:

> Aggiorna il registro del PhD sul sito STAT_DEMS seguendo `AGGIORNAMENTO.md`: aggiungi i dottori del ciclo XXXVIII (titolo, link BOA, supervisione dal frontespizio), sposta i loro nomi da `students.csv` ad `alumni.csv`, controlla le posizioni attuali di tutti gli alumni con la banca dati MUR e le pagine personali, poi esegui `quarto render`. Non fare commit.

Conviene indicare sempre cosa si sa già per esperienza diretta (nuove posizioni, correzioni): ha la precedenza sulle fonti online.
