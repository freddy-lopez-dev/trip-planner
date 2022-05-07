const mapboxAccessToken = 'pk.eyJ1IjoiZnJlZGR5LW1hcGJveCIsImEiOiJjbDJveXprZG4xbTA2M2NteGY4OXNnNTJ6In0.-IBL7wFEXMI17Q3PLkw98Q';
const bbox = '-97.325875%2C49.766204%2C-96.953987%2C49.99275';
const mapboxURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const getLocation = async (locationName) => {
  const url = `${mapboxURL}/${locationName}.json?bbox=${bbox}&access_token=${mapboxAccessToken}&limit=10`
  const request = await fetch(url);
  const response = await request.json();
  return response.features
}

const generateLocationListHTML = (locationList, locationTypeEle) => {
  if (locationList.length === 0) {
    locationTypeEle.textContent = 'Location does not exist!'
  } else {
    locationList.forEach((location) => {
      locationTypeEle.insertAdjacentHTML(
        'beforeend',
        `
        <li data-long="${location.center[0]}" data-lat="${location.center[1]}" class="">
          <div class="name">${location.text}</div>
          <div>${location.properties.address ?
          location.properties.address :
          location.place_name}</div>
        </li>
        `
      )
    })
  }
}