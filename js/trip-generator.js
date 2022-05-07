const winTransitAPIKey = 'tkJgIR5_6mI5h3wthGp8';
const winnipegTransitURL = 'https://api.winnipegtransit.com/v3/';

const getPlannedTrip = async (data) => {
  const url = `${winnipegTransitURL}trip-planner.json?api-key=${winTransitAPIKey}&origin=geo/${data.origin}&destination=geo/${data.destination}`;
  const request = await fetch(url);
  const response = await request.json();
  return response.plans
}

const transformRawData = (rawData) => {
  const allRoutes = []
  rawData.forEach((trip) => {
    const startTime = new Date(trip.times.start);
    const endTime = new Date(trip.times.end);
    allRoutes.push({
      start: startTime.toLocaleTimeString(),
      end: endTime.toLocaleTimeString(),
      totalDuration: trip.times.durations.total,
      tripSegments: getSegmentDetails(trip.segments)
    })
  })

  return allRoutes.sort((a, b) => a.totalDuration - b.totalDuration)
}

const getSegmentDetails = (segments) => {
  const segmentDetails = []
  segments.forEach((segment) => {
    const segmentType = segment.type;

    if (segmentType === 'walk') {
      segmentDetails.push({
        segmentType: segment.type,
        segmentDuration: segment.times.durations.total,
        segmentTo: segment.to.stop ? segment.to.stop : 'destination'
      })
    }

    if (segmentType === 'transfer') {
      segmentDetails.push({
        segmentType: segment.type,
        segmentDuration: segment.times.durations.total,
        segmentFromKey: segment.from.stop.key,
        segmentFromName: segment.from.stop.name,
        segmentToKey: segment.to.stop.key,
        segmentToName: segment.to.stop.name
      })
    }

    if (segmentType === 'ride') {
      segmentDetails.push({
        segmentType: segment.type,
        segmentDuration: segment.times.durations.total,
        segmentRoute: segment.route.name ? segment.route.name : segment.variant.key
      })
    }
  })

  return segmentDetails
}

const generatePlannedTripHTML = (data) => {
  generateRecommendedRouteHTML(data, recommendedRouteEle);
  generateAlternativeRouteHTML(data, alternativeRouteEle);
}

const generateRecommendedRouteHTML = (data, element) => {
  const recommendedRouteData = data[0].tripSegments
  element.textContent = ''
  element.insertAdjacentHTML('beforeend', `<li><i class="fa a-regular fa-clock"></i>${data[0].start}</li>`)
  renderSegments(recommendedRouteData, recommendedRouteEle);
  element.insertAdjacentHTML('beforeend', `<i class="fa fa-regular fa-flag"></i>${data[0].end}</li>`)
}

const generateAlternativeRouteHTML = (data, element) => {
  element.textContent = ''
  let alternativeCount = data.length - 1;
  if (data.length === 1) {
    element.insertAdjacentHTML('beforeend', `<i class="fa fa-solid fa-route"></i>There's no alternative route</li>`)
  }
  for (let i = 1; i <= alternativeCount; i++) {
    element.insertAdjacentHTML(
      'beforeend',
      `
      <h4>Alternative Route ${i}</h4>
      <li>
        <i class="fa a-regular fa-clock"></i>${data[i].start}
      </li>
      `
    );
    renderSegments(data[i].tripSegments, element)
    element.insertAdjacentHTML('beforeend', `<i class="fa fa-regular fa-flag"></i>${data[i].end}</li>`)
  }
}

const renderSegments = (segments, routeEle) => {
  segments.forEach((segment) => {
    switch (segment.segmentType) {
      case 'walk':
        if (segment.segmentTo === 'destination') {
          routeEle.insertAdjacentHTML(
            'beforeend',
            `
            <li>
              <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${segment.segmentDuration} minutes to
              your destination.
            </li>
            `
          )
        } else {
          routeEle.insertAdjacentHTML(
            'beforeend',
            `
            <li>
              <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${segment.segmentDuration} minutes
              to stop ${segment.segmentTo.key} - ${segment.segmentTo.name}
            </li>
            `
          );
        };
        break;
      case 'ride':
        routeEle.insertAdjacentHTML(
          'beforeend',
          `
          <li>
            <i class="fas fa-bus" aria-hidden="true"></i>Ride the Route ${segment.segmentRoute} for ${segment.segmentDuration} minutes.
          </li>
          `
        );
        break;
      case 'transfer':
        routeEle.insertAdjacentHTML(
          'beforeend',
          `
          <li>
            <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
            ${segment.segmentFromKey} - ${segment.segmentFromName} to stop ${segment.segmentToKey} - ${segment.segmentToName}
          </li>
          `
        );
        break;
    }
  })
}

const generateErrorMsg = (err) => {
  if (err instanceof TypeError) {
    recommendedRouteEle.textContent = '';
    alternativeRouteEle.textContent = '';
    recommendedRouteEle.insertAdjacentHTML(
      'beforeend',
      `
      <li>
        <i class="fa fa-regular fa-ban"></i>No Route available for selected origin and destination
      </li>
      `
    );
  } 
  if (err instanceof SyntaxError) {
    recommendedRouteEle.textContent = '';
    alternativeRouteEle.textContent = '';
    recommendedRouteEle.insertAdjacentHTML(
      'beforeend',
      `
      <li>
        <i class="fa fa-regular fa-map"></i>Please make sure that origin and destination are different 
      </li>
      `
    );
  };
}