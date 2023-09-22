import './style.css';
import 'leaflet/dist/leaflet.css';
import { START_LOCATION, MAP_OPTIONS, NGIS_PROXY_URL } from './config.js';
import L, { latLng, polyline } from 'leaflet';

//@ts-ignore
import { OpenStreetMapProvider } from 'leaflet-geosearch';

/*
STARTEN PÅ Å SETTE OPP LEAFLET SEARCH ALTERNATIV FOR TYPESCRIPT
const provider = new OpenStreetMapProvider();

// search
const results = await provider.search({ query: input.value });
const form = document.querySelector('form');
const input = form.querySelector('input[type="text"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const results = await provider.search({ query: input.value });
  console.log(results); // » [{}, {}, {}, ...]
});

*/

/*
const lineObjects=["LastbegrensningsområdeGrense", "KaiområdeGrense", "Havnegjerde", "HavneanleggGrense", "Kaifront"]
const pointObjects=["Beredskapspunkt", "Fortøyningsinnretning", "Kran", "Avfallspunkt", "Drivstofftilkobling", "ElKobling", "Fender",
"HavnegjerdeInngang", "Havnesensor", "Kamera", "Toalett", "Tømmestasjon", "VAUttak","Havneanlegg"  ]
const plygonObjects=["Lastbegrensningsområde", "Kaiområde","Slipp", "Havneområde", "AdministrativtHavneområde" ]
*/
//FUNCTIONS
function swapNestedCoordinates(coordinates) {
  // Function to swap latitude and longitude in nested coordinates
  return coordinates.map(function (outerRing) {
    return outerRing.map(function (coord) {
      return [coord[1], coord[0]];
    });
  });
}
function isValidLineStringFeature(feature) {
  // Check if the feature has a 'geometry' property with type 'LineString'
  if (feature && feature.geometry && feature.geometry.type === 'LineString') {
    // Check if the 'coordinates' property exists and is an array
    if (Array.isArray(feature.geometry.coordinates)) {
      // Iterate through each set of coordinates and check if it's an array of two numbers
      for (const coord of feature.geometry.coordinates) {
        if (
          !Array.isArray(coord) ||
          coord.length !== 3 ||
          typeof coord[0] !== 'number' ||
          typeof coord[1] !== 'number' ||

          typeof coord[2] !== 'number'
        ) {
          // If any coordinate set is invalid, return false
          return false;
        }
      }
      // If all coordinates are valid, return true
      return true;
    }
  }
  // If any of the checks fail, return false
  return false;
}
async function getDatasets(){
  const response = await fetch(`${NGIS_PROXY_URL}/datasets`);
  const dataSets=await response.json()
  console.log(dataSets)
  const finalResponse= await getObjectData(dataSets)

  addToLayers(finalResponse)

}

async function getObjectData(dataSets: any[]) {
  const objectsData = await Promise.all(dataSets.map(async (item: { id: string; }) => {
    const response = await fetch(
      `${NGIS_PROXY_URL}/datasets/${item.id}/features?crs_EPSG=4258&references=all`,
    );
    
     return response.json()
  }));
  
  const mergedResults = objectsData.flatMap((data) => data.features);
  console.log(mergedResults);
  return mergedResults;
}


  function addToLayers(dataset: any[]){
  dataset.forEach(function (feature) {
  const type = feature.geometry.type;
  const valid=true
 
  if (typeof feature.geometry.coordinates==="undefined"){
    valid=false
    console.log("Ingen koordinater")
    console.log(feature)

  }
  feature.geometry.coordinates.forEach(function (coordinate: { lenght: number; }) {
    if (coordinate.lenght<2){
      console.log(feature)
      valid=false
    }
  })
  if(valid){
  // Determine which layer to add the feature to based on its category
  if (type === 'Point') {
   
    pointsLayer.addData(feature); // Add to Custom Name 1 layer
  } else if (type === 'LineString') {
    if (!isValidLineStringFeature(feature)){
      console.log(feature)
    }
    else{
      const coordinates = feature.geometry.coordinates;
      const modifiedCoordinates = coordinates.map(function (coord) {
      return [coord[1], coord[0]]; // Swap latitude and longitude
    });
    feature.geometry.coordinates=modifiedCoordinates
      lineLayer.addData(feature); // Add to Custom Name 2 layer

    }
  }else if (type === 'Polygon'){
    const coordinates = feature.geometry.coordinates;
    const modifiedCoordinates = swapNestedCoordinates(coordinates);
    feature.geometry.coordinates=modifiedCoordinates
    polyLayer.addData(feature);
  }

  // You can add more conditions for different categories if needed
}});
console.log("Ferdig med å legge til")
}

const pointsLayer = L.geoJson(null, {
  pointToLayer: function (feature) {
   
    // Create a marker for each point feature
    return L.marker(feature.geometry.coordinates).bindPopup();
  },
});
const lineLayer = L.geoJson(null);
const polyLayer=L.geoJson(null);




const layers={
          'Points': pointsLayer,
          'Lines': lineLayer,
          'Polygons': polyLayer
        }


getDatasets()

const map = L.map('map').setView(START_LOCATION, 15); // Creating the map object

// Adding base maps
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 
MAP_OPTIONS).addTo(map);
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const wmsLayer = L.tileLayer.wms('https://openwms.statkart.no/skwms1/wms.havnedata');

// Creating marker layers with options 
const OsloHavn = L.marker([59.902205, 10.740768300000013],{title: "Oslo"}).bindPopup("Oslo havn");
const BergenHavn = L.marker([60.39207, 5.31195], {title: "Bergen"}).bindPopup("Bergen havn")
// Adding marker layers to a feature group
const cities = L.layerGroup([OsloHavn, BergenHavn]).addTo(map)
const baseMaps = {
  "OpenStreetMap.HOT": osmHOT,
  "Standard": standardMap,
  "WMS": wmsLayer
};
const overlayMaps = {
  "Cities": cities,
};
const layerControl = L.control.layers(baseMaps, layers).addTo(map)


// Save button click event handler
document.getElementById('saveButton')?.addEventListener('click', () => {
  // Assuming 'marker' is declared and initialized somewhere in your code
  

  // Update the marker's information with edited values
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const descriptionInput = document.getElementById('description') as HTMLInputElement | null;

  if (nameInput && descriptionInput) {
    //@ts-ignore
    marker.name = nameInput.value;
    //@ts-ignore
    marker.description = descriptionInput.value;
  }

  // Hide the editable page and return to view mode
  const editablePage = document.getElementById('editablePage');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
});

// Cancel button click event handler
document.getElementById('cancelButton')?.addEventListener('click', () => {
  // Hide the editable page and discard any edits
  const editablePage = document.getElementById('editablePage');
  if (editablePage) {
    editablePage.style.display = 'none';
  }
});
