// Load data from localStorage
let itinerary = JSON.parse(localStorage.getItem('itinerary')) || [];
let diary = JSON.parse(localStorage.getItem('diary')) || [];
let budget = JSON.parse(localStorage.getItem('budget')) || [];
let info = JSON.parse(localStorage.getItem('info')) || {flight: [], hotel: [], car: [], others: []};
let title = localStorage.getItem('title') || 'MY Trip';
document.getElementById('title').textContent = title;

// Edit title
function editTitle() {
    let newTitle = prompt('更改標題', title);
    if (newTitle) { title = newTitle; document.getItem('title').textContent = title; localStorage.setItem('title', title); }
}

// Page navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + '-page').classList.remove('hidden');
    if (page === 'map') initMap(); // Reload map
}

// Itinerary form
document.getItem('itinerary-form').addEventListener('submit', e => {
    e.preventDefault();
    let newItem = {date: document.getItem('date').value, activity: document.getItem('activity').value, location: document.getItem('location').value, remarks: document.getItem('remarks').value};
    itinerary.push(newItem);
    saveAndRenderItinerary();
});

// Render itinerary with drag sort
function saveAndRenderItinerary() {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    let list = document.getItem('itinerary-list');
    list.innerHTML = '';
    // Group by day
    let groups = itinerary.reduce((acc, item) => {
        acc[item.date] = acc[item.date] || [];
        acc[item.date].push(item);
        return acc;
    }, {});
    Object.keys(groups).sort().forEach((date, index) => {
        let section = document.createElement('div');
        section.className = 'day-section';
        section.style.background = `hsl(${index*30}, 50%, 95%)`;
        section.innerHTML = `<h3>${date}</h3><ul id="sort-${date}" class="sortable"></ul>`;
        list.appendChild(section);
        groups[date].forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = `${item.activity} (${item.location}) <span>${item.remarks}</span> <button onclick="editItem('itinerary', ${itinerary.indexOf(item)})">✏️</button> <button onclick="deleteItem('itinerary', ${itinerary.indexOf(item)})">🗑️</button>`;
            document.getItem(`sort-${date}`).appendChild(li);
        });
        new Sortable(document.getItem(`sort-${date}`), { onEnd: updateItineraryOrder });
    });
    updateTrafficTimes(); // Update driving times
}

// Update order after drag
function updateItineraryOrder() {
    // Rebuild itinerary array from DOM
    itinerary = []; // Clear and repopulate
    document.querySelectorAll('.day-section').forEach(section => {
        section.querySelectorAll('li').forEach(li => {
            // Parse back item
            let parts = li.textContent.split(' (');
            let activity = parts[0];
            let location = parts[1].split(') ')[0];
            let remarks = parts[1].split(') ')[1].split(' ✏️')[0];
            itinerary.push({date: section.querySelector('h3').textContent, activity, location, remarks});
        });
    });
    saveAndRenderItinerary();
}

// Highlight: Google Maps API for driving time
function updateTrafficTimes() {
    if (itinerary.length < 2) return;
    let origins = itinerary.map(i => i.location);
    let service = new google.maps.DistanceMatrixService(); // Highlight: Distance Matrix API
    service.getDistanceMatrix({
        origins: origins.slice(0, -1),
        destinations: origins.slice(1),
        travelMode: 'DRIVING'
    }, (response, status) => {
        if (status === 'OK') {
            response.rows.forEach((row, index) => {
                let time = row.elements[0].duration.text;
                // Add to DOM, e.g., append to li
                document.querySelectorAll('#itinerary-list li')[index].innerHTML += ` (估計時間: ${time})`;
            });
        }
    });
}

// Map init
let map;
function initMap() {
    map = new google.maps.Map(document.getItem('map'), {center: {lat: 13.7563, lng: 100.5018}, zoom: 10}); // Bangkok
    let list = document.getItem('location-list');
    list.innerHTML = '';
    itinerary.forEach(item => {
        let marker = new google.maps.Marker({position: geocodeLocation(item.location), map, title: item.activity});
        marker.addListener('click', () => alert(item.activity));
        let li = document.createElement('li');
        li.textContent = item.location;
        list.appendChild(li);
    });
    // Add car rental pins
    info.car.forEach(car => {
        new google.maps.Marker({position: geocodeLocation(car.pickupLocation), map, icon: 'car-icon.png', title: 'Pick Up'});
        new google.maps.Marker({position: geocodeLocation(car.returnLocation), map, icon: 'car-icon.png', title: 'Return'});
    });
}

// Geocode helper (Highlight: Geocoding API)
function geocodeLocation(location) {
    let geocoder = new google.maps.Geocoder(); // Highlight: Geocoder API
    geocoder.geocode({address: location}, (results, status) => {
        if (status === 'OK') return results[0].geometry.location;
    });
    return {lat: 13.7563, lng: 100.5018}; // Default
}

// Weather API (Highlight: OpenWeather API)
function loadWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=YOUR_OPENWEATHER_KEY&units=metric`) // Highlight: Weather API
        .then(res => res.json())
        .then(data => {
            document.getItem('weather').textContent = `${data.main.temp}°C ${data.weather[0].description}`;
            // Add icon based on condition
        });
}

// Exchange API (Highlight: Exchange API)
function loadExchange() {
    fetch(`https://v6.exchangerate-api.com/v6/YOUR_EXCHANGE_KEY/latest/HKD`) // Highlight: Exchange API
        .then(res => res.json())
        .then(data => document.getItem('exchange-rate').textContent = `1 HKD = ${data.conversion_rates.THB.toFixed(2)} THB`);
}

// Diary, Budget, Info similar to itinerary (add forms, render lists, edit/delete functions)

// Init
loadWeather();
loadExchange();
saveAndRenderItinerary();
// Render other lists similarly

function editItem(type, index) { /* Prompt user for new values, update array, re-render */ }
function deleteItem(type, index) { /* Splice array, re-render */ }
function addInfo(section) { /* Show form for that section, push to info[section], re-render */ }
