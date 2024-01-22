## Install dependencies

- `npm install` from the root folder to install all dependencies
- `npm install -w <workspace>` or `cd <workspace> && npm install` to install in just one workspace

## Setup

The project is a Lerna monorepo with multiple components

1. Clone: `git clone https://github.com/digitalhavn/prototype-redigeringsklient-ngis.git`
2. Install all packages: `npm install`
   - Download Node.js and npm if you haven't already: https://nodejs.org/en
3. Create a `.env` file inside the `./proxy` subfolder with the following variables

```
NGIS_URL="url"
NGIS_USERNAME="username"
NGIS_PASSWORD="password"
```

4. Run `proxy` and `leaflet-client` at the same time from the root folder: `npm run dev`
   - Alternatively run them individually with `npm run dev -w <workspace>`
5. Run all tests: `npm run test``

## Configuration options

`leaflet-client` can be configured with a `.env` file inside its folder. The table below shows which variables can be set, and what their purpose is.

| Name                      | Component      | Type    | Purpose                                                   | Example value                                  |
| ------------------------- | -------------- | ------- | --------------------------------------------------------- | ---------------------------------------------- |
| VITE_MAPTILES_API_KEY     | leaflet-client | String  | API key to access Norkart's webatlas maptiles             | "ABCD-EF-GH-IJKLM"                             |
| VITE_START_LOCATION_LAT   | leaflet-client | Number  | Start location latitude for leaflet map                   | "58.1419"                                      |
| VITE_START_LOCATION_LNG   | leaflet-client | Number  | Start location longitude for leaflet map                  | "7.9956"                                       |
| VITE_START_ZOOM           | leaflet-client | Integer | Start zoom for leaflet map                                | "17"                                           |
| VITE_NGIS_DEFAULT_DATASET | leaflet-client | String  | Default NGIS-OpenAPI dataset to fetch data from initially | "kristiansand_havn"                            |
| NGIS_URL                  | proxy          | URL     | URL pointing to a server hosting NGIS-OpenAPI             | "https://openapi-test13.kartverket.no/havn/v1" |
| NGIS_USERNAME             | proxy          | String  | Username for accessing NGIS-OpenAPI                       | "username"                                     |
| NGIS_PASSWORD             | proxy          | String  | Password for accessing NGIS-OpenAPI                       | "password"                                     |
