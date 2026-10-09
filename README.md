# stat-dems-unimib.github.io

Sito [Quarto](https://quarto.org) di Statistica al DEMS (Università degli Studi di Milano-Bicocca), pubblicato con GitHub Pages dalla cartella `docs/`.

Sono pagine di **supporto**: non devono duplicare né sostituire i siti ufficiali di Ateneo. Quando un'informazione è già sul sito ufficiale, si mette un link.

## Struttura

```
index.qmd            home page minimale (italiano)
bachelor/            laurea triennale SMLE (italiano) — per ora vuota
master/              laurea magistrale CLAMSES, eventi (italiano) — per ora vuota
phd/                 dottorato (English)
  alumni.qmd         PhD alumni (anche /phd/ porta qui)
  students.qmd       dottorandi in corso
  seminars.qmd       seminari di statistica del DEMS (prossimi e passati, per anno accademico)
  data/alumni.csv    registro dei dottori di ricerca (anche dei dottorati precedenti, colonna `programme`)
  data/students.csv  dottorandi in corso
  data/seminars.csv  seminari: una riga per seminario
assets/register.js   tabella ricercabile generata dai CSV
assets/seminars.js   pagina dei seminari generata dal CSV
img/                 immagini e logo
styles.scss          stile comune
```

Le sezioni sono cartelle indipendenti. Ognuna ha un `_metadata.yml` per la lingua (`lang: it` oppure `lang: en`) e, se serve, per un proprio stile; le sue pagine si collegano dalla barra in alto (`navbar` in `_quarto.yml`).

Ogni sezione può avere un template proprio: nel suo `_metadata.yml` si possono impostare `format: html:` con `theme`, `css`, `page-layout`, `toc`, ecc., che valgono solo per i file di quella cartella (ad esempio `master/` per le pagine degli eventi). La barra di navigazione in alto invece è comune a tutto il sito; se una sezione deve esserne del tutto indipendente, conviene farne un progetto Quarto separato.

Per attivare `bachelor/` o `master/`: creare `_metadata.yml` con `lang: it`, le pagine `.qmd`, e aggiungere le voci nella `navbar` di `_quarto.yml`.

## Aggiornare il registro del PhD

Le fonti e la procedura completa sono in [`AGGIORNAMENTO.md`](AGGIORNAMENTO.md). In breve: basta modificare `phd/data/alumni.csv` o `phd/data/students.csv` (una riga per persona; più nomi nello stesso campo separati da `;`) e rigenerare il sito.

## Aggiungere un seminario

Aggiungere una riga a `phd/data/seminars.csv` (l'ordine delle righe non conta). Colonne:

- `date` nel formato `AAAA-MM-GG`; `start` e `end` nel formato `HH:MM` (`end` vuoto = un'ora)
- `speaker`, `website` (pagina personale o istituzionale aggiornata, come per gli alumni), `affiliation` (all'epoca del seminario), `title`
- `room` (es. `Aula 03`) e `building` (es. `U2`; il codice `U…` serve anche per il link alla mappa)
- `note` facoltativa (es. `Joint DISMEQ/DEMS seminar`), `link` facoltativo (articolo, arXiv)
- `abstract`: tra virgolette; i paragrafi si separano con una riga vuota

La pagina sposta da sola i seminari tra "Upcoming" e "Past seminars" in base alla data, quindi dopo un seminario non serve modificare nulla. Ogni seminario ha comunque un indirizzo diretto, `seminars.html#AAAA-MM-GG-cognome`, utile negli annunci. Fonte: le email di annuncio alle mailing list del DEMS.

## Rigenerare il sito

```
quarto render
```

poi fare commit anche della cartella `docs/`.
