# stat-dems-unimib.github.io

Sito [Quarto](https://quarto.org) di Statistica al DEMS (Università degli Studi di Milano-Bicocca), pubblicato con GitHub Pages dalla cartella `docs/`.

Sono pagine di **supporto**: non devono duplicare né sostituire i siti ufficiali di Ateneo. Quando un'informazione è già sul sito ufficiale, si mette un link.

## Struttura

```
index.qmd            home page minimale (italiano)
bachelor/            laurea triennale SMLE (italiano) — per ora vuota
master/              laurea magistrale CLAMSES, eventi (italiano) — per ora vuota
phd/                 dottorato (English)
  index.qmd          PhD alumni (pagina d'ingresso della sezione)
  students.qmd       dottorandi in corso
  data/alumni.csv    registro dei dottori di ricerca (anche dei dottorati precedenti, colonna `programme`)
  data/students.csv  dottorandi in corso
assets/register.js   tabella ricercabile generata dai CSV
img/                 immagini e logo
styles.scss          stile comune
```

Le sezioni sono cartelle indipendenti. Ognuna ha un `_metadata.yml` per la lingua (`lang: it` oppure `lang: en`) e, se serve, per un proprio stile; le sue pagine si collegano dalla barra in alto (`navbar` in `_quarto.yml`).

Ogni sezione può avere un template proprio: nel suo `_metadata.yml` si possono impostare `format: html:` con `theme`, `css`, `page-layout`, `toc`, ecc., che valgono solo per i file di quella cartella (ad esempio `master/` per le pagine degli eventi). La barra di navigazione in alto invece è comune a tutto il sito; se una sezione deve esserne del tutto indipendente, conviene farne un progetto Quarto separato.

Per attivare `bachelor/` o `master/`: creare `_metadata.yml` con `lang: it`, le pagine `.qmd`, e aggiungere le voci nella `navbar` di `_quarto.yml`.

## Aggiornare il registro del PhD

Basta modificare `phd/data/alumni.csv` o `phd/data/students.csv` (una riga per persona; più nomi nello stesso campo separati da `;`) e rigenerare il sito.

## Rigenerare il sito

```
quarto render
```

poi fare commit anche della cartella `docs/`.
