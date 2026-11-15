# Marketingsite

De publieke website van KDVManager, plus de merkrichtlijnen. Statische HTML, CSS
en JavaScript — geen build, geen dependencies, geen framework. Open `index.html`
en het werkt.

| Bestand      | Wat het is                                                    |
| ------------ | ------------------------------------------------------------- |
| `index.html` | De website, met twee interactieve demo's                       |
| `brand.html` | Merkrichtlijnen: logo, kleur, typografie, stem, UI-tokens      |

## Lokaal bekijken

```sh
cd src/marketing
python3 -m http.server 8899
# http://localhost:8899
```

Openen via `file://` werkt ook — alle scripts zijn gewone `<script src>`-bestanden,
er wordt niets gefetcht.

## Opbouw

```
assets/
  css/site.css     tokens + de hele site
  css/brand.css    alleen de merkrichtlijnen
  js/bkr-table.js  gegenereerde BKR-uitkomsten (niet met de hand aanpassen)
  js/demo.js       het dagbord en de planningsregels
  js/site.js       navigatie, scroll-reveal, formulier
  img/mark.svg     merkteken
  img/logo.svg     lockup (woordmerk als tekst, zie hieronder)
```

## De BKR-tabel

Het dagbord op de homepage rekent niet zelf. `assets/js/bkr-table.js` bevat 2869
voorberekende uitkomsten, gegenereerd met **hetzelfde `BKRCalculator`-pakket
(v0.4.0)** dat de Scheduling-service in productie gebruikt. Daardoor noemt de
demo het aantal begeleiders dat het echte product ook zou noemen, inclusief het
groepsgrootteminimum, de leeftijdsratio's en de vangnetregel.

Sleutel is `"a0a1a2a3"` — het aantal 0-, 1-, 2- en 3-jarigen. Waarde is
`[hasSolution, professionals, basis, maxChildren]`.

Opnieuw genereren als het pakket verandert: maak een klein console-project dat
`KDVManager.BKRCalculator.GroupAnalyzer.CalculateBKR` aanroept voor elke
samenstelling tot 16 kinderen, en schrijf de uitkomsten in hetzelfde formaat weg.

Eén vereenvoudiging ten opzichte van de applicatie: de app rekent **per
tijdsblok**, de demo vat de dag samen. Dat staat ook onder het bord vermeld.

De weekpatronen in `demo.js` zijn zo gekozen dat de week alle uitkomsten laat
zien — woensdag toont de leeftijdsratio én de vangnetregel, donderdag vraagt drie
begeleiders. Pas je de kinderen aan, controleer dan opnieuw dat geen enkele dag
standaard op "niet haalbaar" uitkomt.

## Het demoformulier

Het formulier verstuurt standaard niets; het valideert en bevestigt alleen. Zet
een endpoint om het echt te laten werken:

```html
<form data-demo-form data-endpoint="https://…/demo-aanvragen">
```

Er wordt dan een JSON-POST gedaan met alle veldwaarden.

## Afspraken

- **Nederlands**, en de lezer wordt met *je* aangesproken — net als in de app.
- **Zonder JavaScript blijft alles leesbaar.** Scroll-reveal verbergt alleen iets
  als de `js`-class op `<html>` staat.
- **WCAG 2.1 A/AA.** Beide pagina's zijn met axe-core gescand op 1440 px en
  390 px, inclusief de staten die pas na interactie verschijnen (niet-haalbare
  BKR, formulierfouten). Nul overtredingen. Voeg je iets toe, scan dan opnieuw —
  en let op dat axe inhoud binnen een nog niet onthulde `.reveal` overslaat, dus
  scroll de pagina eerst helemaal door.
- **Contrastwaarden** in `brand.html` zijn berekend, geen schatting. Klopt een
  kleur niet meer, herbereken hem dan.

## Logo

`img/mark.svg` is het merkteken. `img/logo.svg` is de lockup en zet het woordmerk
als `<text>` met Familjen Grotesk. Voor print of voor derden: **zet de tekst eerst
om naar outlines**, anders valt hij terug op een systeemletter.

De applicatie gebruikt nog `src/web/src/logo.svg` — dat is het standaard
React-logo en niet het merk. Vervangen bij de eerstvolgende gelegenheid.

## Uitrollen

Het is een map met statische bestanden: elke webserver of objectopslag volstaat.
De site is nog niet aan de deployment in `deploy/k8s/` toegevoegd; `app.kdvmanager.nl`
blijft de applicatie en deze site zou op het apex-domein passen.
