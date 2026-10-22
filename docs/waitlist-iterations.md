# Wachtlijst: releases en groeipad

## Besluit

De eerste release is een interne wachtlijst voor prospecten. Een item bevat het kind, een contactpersoon, de gewenste startdatum, gewenste dagen in vrije tekst, notities en een status. Het item wordt **niet** automatisch een geplaatst kind en heeft geen effect op de planning of capaciteit.

Dit is de kleinste veilige bruikbare stap: medewerkers kunnen aanvragen registreren, ze in volgorde van binnenkomst bekijken en de voortgang bijhouden. De gegevens zijn tenant-scoped en een geplaatst of ingetrokken verzoek blijft als historisch item bewaard.

## Wat is nu geleverd

- Een wachtlijstpagina met actieve aanvragen en optioneel geplaatste/ingetrokken historie.
- Een formulier voor kind-, contact- en aanvraaggegevens.
- Statussen: `Waiting`, `Offered`, `Placed` en `Withdrawn`.
- Een CRM-API (`GET`/`POST /v1/waitlist`, `PUT /v1/waitlist/{id}/status`) en EF-migratie.
- Tenantfiltering en een tenant-voorloopindex op status en inschrijfdatum.

Niet in deze release: online ouderaanmelding, locaties/groepen, prioriteitsregels, beschikbaarheidsberekening, contracten, automatische e-mail of een automatische omzetting naar een kind. Een status `Placed` is dus een administratieve bevestiging; de medewerker maakt daarna bewust het kind en de planning aan volgens de bestaande werkwijze.

## Onderzoeksuitkomst

De markt bevestigt een gefaseerde keten: inschrijving/aanvraag → wachtlijst → plaatsingsbesluit → contract/planning.

- [KidsKonnect](https://kidskonnect.org/solutions) zet een website-inschrijving op de wachtlijst, gebruikt planningsadvies voor de volledige contractperiode en genereert daarna een contract.
- [Jaamo](https://jaamo.nl/kinderopvang-software) beschrijft hetzelfde startpunt: een online inschrijving wordt direct verwerkt of naar de wachtlijst gestuurd; communicatie volgt vanuit het systeem.
- [Quebble](https://www.quebble.com/) positioneert de workflow expliciet van inschrijving en wachtlijst naar plaatsing en contract.
- [KinderMatch](https://www.kindermatch.nl/) laat de volwassen vervolgfunctie zien: ouders houden hun vraag actueel en een geaccepteerde plaatsing ruimt andere wachtlijsten op.

Daarom bevat de MVP wél status, contact, ingangsdatum en dagvoorkeur, maar nog geen schijnprecisie zoals een automatisch volgnummer of plaatsingsadvies. Dat advies kan pas betrouwbaar zijn zodra de vraag aan locatie, groep, leeftijd en daadwerkelijk beschikbare dagen is gekoppeld. Wachtlijsten zijn bovendien een reëel operationeel probleem: in de meting van november 2024 had 77% van de deelnemende dagopvangorganisaties een wachtlijst; de bron waarschuwt terecht dat zo'n aanwezigheid niet hetzelfde is als een individuele wachttijd. Zie [Kinderopvang Werkt, Quickscan november 2024](https://www.kinderopvang-werkt.nl/sites/fcb_kinderopvang/files/2024-12/Quickscan-arbeidsmarktontwikkelingen-kinderopvang-november-2024.pdf).

## Iteratie 2 — Plaatsingsinformatie en handmatige matching (geleverd)

- Aanvragen kunnen worden geopend en bewerkt zonder verlies van inschrijfdatum of status.
- Voorkeurslocatie, opvangvorm (`Daycare`/`AfterSchool`), voorkeursgroep, vaste weekdagen (maandag–zondag, dezelfde dagnummering als de planning) en optionele begin-/eindtijd zijn gestructureerd opgeslagen. Locatie en groep zijn voorkeursnamen; capaciteitscontrole en koppeling aan de planning volgen in iteratie 3.
- Medewerkers bepalen een prioriteit van 0–100. Bij een hogere prioriteit zijn een eigen prioriteitsreden (bijvoorbeeld broer/zus of medewerker) en toelichting verplicht. De reden is vrij configureerbaar per aanvraag, zonder ingebouwde weging van persoonlijke kenmerken.
- Filters op locatie (hoofdletterongevoelig), gewenste startmaand en status. Een expliciete statusfilter bepaalt ook of gesloten aanvragen getoond worden; zonder statusfilter geldt de historieschakelaar.
- De shortlist toont eerst `Offered`, daarna `Waiting`, `Placed` en `Withdrawn`. Binnen elke status geldt prioriteit (hoogste eerst), vervolgens inschrijfdatum en ID. Reden en toelichting staan zichtbaar naast de prioriteit.
- Statuswijzigingen worden samen met de aanvraag opgeslagen met oude/nieuwe status, UTC-tijdstip en het geauthenticeerde gebruikers-ID uit het token. De aanroepende client kan de auteur niet kiezen. Een identieke status veroorzaakt geen extra historisch item.
- Elke bewerking vraagt de laatst gelezen `revision`; een verouderde revisie levert HTTP 409 op. Het formulier biedt daarna bewust opnieuw laden aan. Gelijktijdige statuswijzigingen leveren geen onjuiste auditregels op.
- Nieuwe CRM-API: `GET`/`PUT /v1/waitlist/{id}`. Bestaande lijst-/aanmaak-/statusroutes zijn uitgebreid. `PUT /v1/waitlist/{id}/status` vereist nu `status` en `revision`.
- Migratie behoudt bestaande vrije tekst, registratiedatums en statussen. Oudere aanvragen beginnen met lege weekdagen en prioriteit 0; ontbrekende plaatsingsinformatie kan later worden aangevuld. Historie begint na installatie en wordt niet achteraf verzonnen.
- Nederlandse en Engelse schermteksten, browsertests en integratietests voor filtering, validatie, tenantisolatie, bewerking, historie en gelijktijdige wijzigingen.

Acceptatiecriteria: een planner kan aanvragen per locatie/startmaand filteren, de gekozen volgorde onderbouwen, en achteraf zien wie een aanbod deed en wanneer. Deze iteratie is handmatige matching; zij geeft geen automatische capaciteitstoets of plaatsingsgarantie.

## Iteratie 3 — Capaciteit en aanbod

Koppel de vraag aan groepen, leeftijd en de bestaande dagplanning. Bereken geschikte openingen op de gevraagde dagen over de hele gewenste contractperiode. Introduceer een aanbod met vervaldatum, een vastgelegde prijs/contractvoorstel en een expliciet acceptatie- of afwijsresultaat. Een geaccepteerd aanbod maakt in één gecontroleerde transactie het kind, contract/planning en de plaatsingsstatus aan.

Acceptatiecriteria: het systeem biedt alleen combinaties aan die binnen capaciteit en ratio passen; de planner ziet waarom een aanvraag wel/niet past; een aanbod kan niet twee keer tot een plaatsing leiden.

## Iteratie 4 — Ouder-selfservice en automatisering

Voeg een publieke, beveiligde aanmeldflow toe met privacyverklaring, e-mailverificatie en rate limiting. Ouders kunnen voorkeuren bevestigen of intrekken; periodieke herbevestiging markeert verlopen aanvragen. Voeg templates toe voor ontvangstbevestiging, aanbod en herinnering. Pas pas hier een eventuele inschrijfvergoeding of documentupload toe.

Acceptatiecriteria: de aanmelding is veilig zonder ingelogde beheerder, ouders kunnen hun eigen aanvraag beheren, en de organisatie ziet welke aanvragen nog bevestigd actueel zijn.

## Iteratie 5 — Optimalisatie en beheer

Ondersteun meerdere locaties/wachtlijsten per kind, automatische opschoning na acceptatie, import/export, dashboards en wachttijd-/conversierapportage. Voeg rollen toe voor alleen-lezen, planner en beheerder. Evalueer eventuele matchsuggesties op uitlegbaarheid, fairness en uitkomsten voordat automatisering beslissend wordt.

## Privacy en bewaartermijn

De MVP vraagt geen medische gegevens of documenten uit. Dat volgt het AVG-principe van doelbinding en minimale gegevensverwerking; de Autoriteit Persoonsgegevens noemt ook juistheid, opslagbeperking en passende beveiliging als kernbeginselen in haar [AVG-handleiding](https://autoriteitpersoonsgegevens.nl/uploads/imported/handleiding_avg.pdf). Voor iteratie 4 moet de organisatie een expliciete bewaartermijn voor ingetrokken/geplaatste aanvragen, de grondslag en de privacyinformatie vastleggen. Zie ook de AP-pagina over [verantwoordingsplicht en privacy by design/default](https://autoriteitpersoonsgegevens.nl/nl/onderwerpen/algemene-informatie-avg/verantwoordingsplicht?qa=toestemming&scrollto=1).
