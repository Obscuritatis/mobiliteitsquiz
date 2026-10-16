# AZT Mobiliteitsquiz

Quiz voor de mobiliteitsactie. Kies hoe je naar het werk komt (te voet, met de fiets of met de auto) en beantwoord tien vragen over de Belgische wegcode en verkeersveiligheid. Bij de fiets kies je eerst je type: gewone fiets, elektrische fiets, speed pedelec, bakfiets of longtail.

Online via GitHub Pages: https://obscuritatis.github.io/mobiliteitsquiz/

Rechtstreeks naar één quiz: voeg `#voet`, `#auto`, `#fietsen` (keuze van fiets), `#fiets`, `#ebike`, `#speed`, `#bakfiets` of `#longtail` toe aan het adres.

De quiz zit in `index.html`, de vragen in `vragen.json`.

## Vragen roteren

Elke quiz heeft 20 vragen in `vragen.json`, waarvan er 10 `"actief": true` staan.

- `"modus": "vast"`: de quiz toont de 10 actieve vragen. Wisselen doe je door `"actief"` bij de ene vraag op `false` en bij een andere op `true` te zetten.
- `"modus": "willekeurig"`: bij elke start worden 10 vragen willekeurig gekozen uit alle 20.

Je kan `vragen.json` rechtstreeks op GitHub bewerken (potloodicoon). Na het opslaan staat de nieuwe versie binnen enkele minuten online. De app is installeerbaar (manifest, iconen in `icons/`, `sw.js` voor offline gebruik).
