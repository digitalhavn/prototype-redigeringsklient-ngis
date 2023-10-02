## Datasett og tilganger:

- https://norkartit-my.sharepoint.com/:f:/g/personal/alenos_norkart_no/Enjx4ENJjwFLn75LNKiEFqUBR2rrSc76ldxPcfaVEM9-4Q?e=sGc5FN

## Installering av pakker

- `npm install` fra rot-mappe for å installere pakker i alle workspaces
- `npm install -w <workspace>` eller `cd <workspace> && npm install` for å installere pakker i ett workspace

## Setup med Lerna

Prosjektet er satt opp som et monorepo av flere forskjellige komponenter med lerna.

1. Klon repo: `git clone https://github.com/digitalhavn/prototype-redigeringsklient-ngis.git`
2. Installer pakker fra rot mappa og alle workspaces: `npm install`
   - Last ned npm og node.js hvis du ikke har det allerede: https://nodejs.org/en
3. Lag en `.env` fil i `./proxy` mappen med følgende innhold (bytt variabel-verdiene til ekte verdier):

```
NGIS_URL="url"
NGIS_USERNAME="username"
NGIS_PASSWORD="password"
```

4. Kjør `proxy` og `leaflet-client` samtidig med fra rot mappa: `npm run dev`
5. Kjør tester i alle workspaces samtidig fra rot mappa: `npm run test`

### Kjør mer spesifikke Lerna-kommandoer

`npm run dev` og `npm run test` scriptene er definert til å kjøre `lerna run dev --parallel` og `lerna run test --stream`. Du kan også kjøre disse kommandoene direkte med lerna via `npx`, f.eks `npx lerna run dev --stream` vil gjøre akkurat det samme som `npm run dev`. Her er en liste med noen nyttige kommandoer:

- Kjør npm kommando (f.eks test) kun i ett workspace (f.eks proxy), f.eks proxy: `npm run test -w proxy` eller `npx lerna run test --scope=proxy`
- Full liste med kommandoer: https://lerna.js.org/docs/api-reference/commands

### Pre-commits

Før en commit blir akseptert må en pre-commit script kjøres: `lerna run lint,test --since develop`. Den skjekker at det ikke er noe galt med kodekvalitet/stil med eslint, og at alle tester består, på alle endringer siden `develop` branchen.

Hvis du er sikker på at linting og testing består, f.eks hvis du bare har oppdatert dokumentasjon, kan du bypasse pre-commit med `git commit --no-verify -m "message"`

## Setup uten Lerna

### Leaflet-client

1. Naviger til `leaflet-client`
2. `npm install`
3. `npm run dev`

### Proxy

1. Naviger til `proxy` mappen
2. Lag en .env fil med `NGIS_URL`, `NGIS_USERNAME`, og `NGIS_PASSWORD` variabler

```
NGIS_URL="url"
NGIS_USERNAME="username"
NGIS_PASSWORD="password"
```

3. `npm install`
4. `npm run dev`
