## Datasett og tilganger:

- https://norkartit-my.sharepoint.com/:f:/g/personal/alenos_norkart_no/Enjx4ENJjwFLn75LNKiEFqUBR2rrSc76ldxPcfaVEM9-4Q?e=sGc5FN

## Installering av pakker

`npm install -w <workspace>` eller `cd <workspace> && npm install`

## Leaflet Client

#### Setup

1. Naviger til `leaflet-client`
2. `npm install`
3. `npm run dev`

## Proxy

#### Setup

1. Naviger til `proxy` mappen
2. Lag en .env fil med `NGIS_URL`, `NGIS_USERNAME`, og `NGIS_PASSWORD` variabler

```
NGIS_URL="url"
NGIS_USERNAME="username"
NGIS_PASSWORD="password"
```

3. `npm install`
4. `npm run dev`

## Lerna monorepo

Prosjektet er satt opp som et monorepo av flere forskjellige komponenter med lerna.

- Start `leaflet-client` og `proxy` samtidig: `npx lerna run dev --parallel`
- Kjør tester i `leaflet-client` og `proxy` samtidig: `npx lerna run test`
- Les mer her: https://lerna.js.org/docs/api-reference/commands
