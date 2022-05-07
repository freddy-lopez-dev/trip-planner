const plannedLocations = {
  origin: [],
  destination: []
}
const recommendedRouteEle = document.querySelector('.recommended-trip')
const alternativeRouteEle = document.querySelector('.alternative-trip')

document.querySelector('.origin-form').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const originName = document.querySelector('.origin-form input').value
    plannedLocations.origin = [];
    getLocation(originName)
      .then((data) => {
        const originEle = document.querySelector('.origins');
        originEle.textContent = '';
        generateLocationListHTML(data, originEle);
      });
  };
});

document.querySelector('.destination-form').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const destinationName = document.querySelector('.destination-form input').value
    plannedLocations.destination = [];
    getLocation(destinationName)
      .then((data) => {
        const destinationEle = document.querySelector('.destinations');
        destinationEle.textContent = '';
        generateLocationListHTML(data, destinationEle);
      });
  };
});

document.querySelector('.origins').addEventListener('click', (e) => {
  document.querySelectorAll('.origins li').forEach((list) => {
    list.className = '';
  });
  e.target.closest('li').className = 'selected';
  plannedLocations.origin = [];
  plannedLocations.origin.push(
    e.target.closest('li').dataset.lat,
    e.target.closest('li').dataset.long
  );
});

document.querySelector('.destinations').addEventListener('click', (e) => {
  document.querySelectorAll('.destinations li').forEach((list) => {
    list.className = '';
  });
  e.target.closest('li').className = 'selected';
  plannedLocations.destination = [];
  plannedLocations.destination.push(
    e.target.closest('li').dataset.lat,
    e.target.closest('li').dataset.long
  );
});

document.querySelector('.plan-trip').addEventListener('click', () => {
  const planningBtn = document.querySelector('.plan-trip')
  if (document.querySelectorAll('.selected').length === 2) {
    planningBtn.disabled = false;
    getPlannedTrip(plannedLocations)
      .then(data => transformRawData(data))
      .then(trips => generatePlannedTripHTML(trips))
      .catch((err) => generateErrorMsg(err));
  } else {
    recommendedRouteEle.textContent = '';
    recommendedRouteEle.insertAdjacentHTML(
      'beforeend',
      `
      <li>
        <i class="fa fa-regular fa-compass"></i>Please select an Origin and Destination
      </li>
      `
    );
  }
});