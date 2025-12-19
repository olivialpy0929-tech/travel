// Application State
const state = {
    currentPage: 'home-page',
    itinerary: [],
    diaryEntries: [],
    budgetItems: [],
    infoItems: {
        flight: [],
        hotel: [],
        car: [],
        other: []
    },
    map: null,
    mapMarkers: [],
    colors: ['#4a6cf7', '#38a169', '#ed8936', '#9f7aea', '#f56565', '#4299e1']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadSampleData();
    initEventListeners();
    initMap();
});

// Initialize the app
function initApp() {
    // Set current date as default for forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    document.getElementById('diary-date').value = today;
    
    // Load saved data from localStorage
    loadFromLocalStorage();
    
    // Render initial data
    renderItinerary();
    renderDiaryEntries();
    renderBudgetItems();
    renderInfoItems();
    updateMapMarkers();
}

// Load sample data for demonstration
function loadSampleData() {
    // Only load sample data if no saved data exists
    if (state.itinerary.length === 0) {
        state.itinerary = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                name: 'Visit Grand Palace',
                location: 'Bangkok, Thailand',
                notes: 'Must-see attraction in Bangkok. YouTube: https://youtu.be/sample1'
            },
            {
                id: 2,
                date: new Date().toISOString().split('T')[0],
                time: '13:00',
                name: 'Lunch at Street Food Market',
                location: 'Chinatown, Bangkok',
                notes: 'Try the famous pad thai and mango sticky rice'
            },
            {
                id: 3,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '10:00',
                name: 'Visit Wat Arun',
                location: 'Bangkok, Thailand',
                notes: 'Temple of Dawn. Best visited in the morning.'
            },
            {
                id: 4,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '15:00',
                name: 'Shopping at MBK Center',
                location: 'Pathum Wan, Bangkok',
                notes: 'Great place for souvenirs and electronics'
            }
        ];
    }
    
    if (state.diaryEntries.length === 0) {
        state.diaryEntries = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                title: 'First Day in Bangkok',
                content: 'Arrived in Bangkok today! The flight was smooth and the hotel is beautiful. Can\'t wait to explore the city tomorrow.',
                image: 'https://images.unsplash.com/photo-1552465011-b4e30bf7349d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
            }
        ];
    }
    
    if (state.budgetItems.length === 0) {
        state.budgetItems = [
            {
                id: 1,
                category: 'food',
                description: 'Dinner at restaurant',
                amount: 1200,
                payment: 'credit-card',
                notes: 'Fine dining experience'
            },
            {
                id: 2,
                category: 'shopping',
                description: 'Souvenirs',
                amount: 2500,
                payment: 'cash',
                notes: 'Gifts for family'
            },
            {
                id: 3,
                category: 'transport',
                description: 'Taxi rides',
                amount: 800,
                payment: 'cash',
                notes: 'Around the city'
            },
            {
                id: 4,
                category: 'leisure',
                description: 'Spa treatment',
                amount: 1500,
                payment: 'credit-card',
                notes: 'Traditional Thai massage'
            }
        ];
    }
    
    if (state.infoItems.flight.length === 0) {
        state.infoItems.flight = [
            {
                id: 1,
                flightNumber: 'CX701',
                departureTime: '08:00',
                arrivalTime: '10:30',
                notes: 'Direct flight from HKG to BKK'
            }
        ];
    }
    
    if (state.infoItems.hotel.length === 0) {
        state.infoItems.hotel = [
            {
                id: 1,
                address: '123 Sukhumvit Road, Bangkok',
                checkInTime: '14:00',
                checkOutTime: '12:00',
                notes: 'Breakfast included'
            }
        ];
    }
    
    if (state.infoItems.car.length === 0) {
        state.infoItems.car = [
            {
                id: 1,
                pickUpTime: '11:00',
                returnTime: '19:00',
                pickUpLocation: 'BKK Airport',
                returnLocation: 'Siam Paragon',
                notes: 'Toyota Yaris or similar'
            }
        ];
    }
    
    saveToLocalStorage();
}

// Initialize event listeners
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            switchPage(pageId);
        });
    });
    
    // Add buttons
    document.getElementById('add-activity').addEventListener('click', () => {
        showModal('activity-modal');
    });
    
    document.getElementById('add-diary-entry').addEventListener('click', () => {
        showModal('diary-modal');
    });
    
    document.getElementById('add-budget-item').addEventListener('click', () => {
        showModal('budget-modal');
    });
    
    document.querySelectorAll('.add-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showInfoModal(section);
        });
    });
    
    // Form submissions
    document.getElementById('activity-form').addEventListener('submit', addActivity);
    document.getElementById('diary-form').addEventListener('submit', addDiaryEntry);
    document.getElementById('budget-form').addEventListener('submit', addBudgetItem);
    document.getElementById('info-form').addEventListener('submit', addInfoItem);
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Trip title editing
    document.getElementById('trip-title').addEventListener('blur', function() {
        saveToLocalStorage();
    });
    
    // Info type change
    document.getElementById('info-type').addEventListener('change', function() {
        updateInfoFormFields(this.value);
    });
    
    // Show route button
    document.getElementById('show-route').addEventListener('click', showRouteOnMap);
}

// Initialize map
function initMap() {
    // Bangkok coordinates
    const bangkokCoords = [13.7563, 100.5018];
    
    // Initialize Leaflet map
    state.map = L.map('map').setView(bangkokCoords, 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(state.map);
    
    // Add sample markers
    const locations = [
        {name: 'Grand Palace', coords: [13.7500, 100.4915]},
        {name: 'Wat Arun', coords: [13.7437, 100.4888]},
        {name: 'MBK Center', coords: [13.7448, 100.5295]},
        {name: 'BKK Airport', coords: [13.6811, 100.7471]},
        {name: 'Siam Paragon', coords: [13.7462, 100.5347]}
    ];
    
    locations.forEach(location => {
        const marker = L.marker(location.coords)
            .addTo(state.map)
            .bindPopup(`<b>${location.name}</b>`);
        state.mapMarkers.push(marker);
    });
    
    // Add to locations list
    const locationsList = document.getElementById('locations-list');
    locations.forEach(location => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location.name}`;
        locationsList.appendChild(li);
    });
}

// Update map markers based on itinerary
function updateMapMarkers() {
    // Clear existing markers
    state.mapMarkers.forEach(marker => {
        state.map.removeLayer(marker);
    });
    state.mapMarkers = [];
    
    // Add new markers from itinerary
    state.itinerary.forEach(activity => {
        if (activity.location) {
            // Generate random coordinates near Bangkok for demo
            const lat = 13.7563 + (Math.random() - 0.5) * 0.1;
            const lng = 100.5018 + (Math.random() - 0.5) * 0.1;
            
            const marker = L.marker([lat, lng])
                .addTo(state.map)
                .bindPopup(`<b>${activity.name}</b><br>${activity.time}`);
            state.mapMarkers.push(marker);
        }
    });
    
    // Add rental locations
    if (state.infoItems.car.length > 0) {
        const carInfo = state.infoItems.car[0];
        const pickupMarker = L.marker([13.6811, 100.7471])
            .addTo(state.map)
            .bindPopup(`<b>Car Pick-up:</b><br>${carInfo.pickUpLocation}`);
        pickupMarker._icon.classList.add('rental-marker');
        state.mapMarkers.push(pickupMarker);
        
        const returnMarker = L.marker([13.7462, 100.5347])
            .addTo(state.map)
            .bindPopup(`<b>Car Return:</b><br>${carInfo.returnLocation}`);
        returnMarker._icon.classList.add('rental-marker');
        state.mapMarkers.push(returnMarker);
    }
}

// Show route on map
function showRouteOnMap() {
    // For demo, show a polyline connecting some points
    if (state.mapMarkers.length >= 2) {
        const points = [
            [13.6811, 100.7471], // BKK Airport
            [13.7500, 100.4915], // Grand Palace
            [13.7437, 100.4888], // Wat Arun
            [13.7462, 100.5347]  // Siam Paragon
        ];
        
        // Remove existing polyline if any
        if (state.routePolyline) {
            state.map.removeLayer(state.routePolyline);
        }
        
        // Add new polyline
        state.routePolyline = L.polyline(points, {color: '#4a6cf7', weight: 4, opacity: 0.7})
            .addTo(state.map)
            .bindPopup('Estimated route between locations');
        
        // Fit map to show the route
        state.map.fitBounds(state.routePolyline.getBounds());
        
        // Update travel time
        document.getElementById('total-travel-time').textContent = 'Total: 1 hr 15 min';
    }
}

// Switch between pages
function switchPage(pageId) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === pageId) {
            btn.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    state.currentPage = pageId;
    
    // If switching to map page, update markers
    if (pageId === 'map-page') {
        updateMapMarkers();
        // Trigger a resize to ensure map renders correctly
        setTimeout(() => {
            state.map.invalidateSize();
        }, 300);
    }
}

// Show modal
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// Show info modal with specific section
function showInfoModal(section) {
    document.getElementById('info-type').value = section;
    updateInfoFormFields(section);
    showModal('info-modal');
}

// Update info form fields based on selected type
function updateInfoFormFields(type) {
    const formFields = document.getElementById('info-form-fields');
    formFields.innerHTML = '';
    
    let fields = [];
    
    switch(type) {
        case 'flight':
            fields = [
                {id: 'flight-number', label: 'Flight Number', type: 'text'},
                {id: 'departure-time', label: 'Departure Time', type: 'time'},
                {id: 'arrival-time', label: 'Arrival Time', type: 'time'}
            ];
            document.getElementById('info-modal-title').textContent = 'Add Flight Information';
            break;
        case 'hotel':
            fields = [
                {id: 'hotel-address', label: 'Hotel Address', type: 'text'},
                {id: 'check-in-time', label: 'Check-in Time', type: 'time'},
                {id: 'check-out-time', label: 'Check-out Time', type: 'time'}
            ];
            document.getElementById('info-modal-title').textContent = 'Add Hotel Information';
            break;
        case 'car':
            fields = [
                {id: 'pick-up-time', label: 'Pick-up Time', type: 'time'},
                {id: 'return-time', label: 'Return Time', type: 'time'},
                {id: 'pick-up-location', label: 'Pick-up Location', type: 'text'},
                {id: 'return-location', label: 'Return Location', type: 'text'}
            ];
            document.getElementById('info-modal-title').textContent = 'Add Car Rental Information';
            break;
        case 'other':
            fields = [
                {id: 'other-title', label: 'Title', type: 'text'},
                {id: 'other-details', label: 'Details', type: 'text'}
            ];
            document.getElementById('info-modal-title').textContent = 'Add Other Information';
            break;
    }
    
    // Add notes field for all types
    fields.push({id: 'info-notes', label: 'Notes (optional)', type: 'textarea'});
    
    // Generate form fields
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', field.id);
        label.textContent = field.label;
        
        formGroup.appendChild(label);
        
        if (field.type === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.id = field.id;
            textarea.rows = 3;
            formGroup.appendChild(textarea);
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            formGroup.appendChild(input);
        }
        
        formFields.appendChild(formGroup);
    });
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Reset forms
    document.getElementById('activity-form').reset();
    document.getElementById('diary-form').reset();
    document.getElementById('budget-form').reset();
    document.getElementById('info-form').reset();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    document.getElementById('diary-date').value = today;
}

// Add activity to itinerary
function addActivity(e) {
    e.preventDefault();
    
    const activity = {
        id: Date.now(),
        date: document.getElementById('activity-date').value,
        time: document.getElementById('activity-time').value,
        name: document.getElementById('activity-name').value,
        location: document.getElementById('activity-location').value,
        notes: document.getElementById('activity-notes').value
    };
    
    state.itinerary.push(activity);
    saveToLocalStorage();
    renderItinerary();
    closeAllModals();
    
    // Update map if we're on the map page
    if (state.currentPage === 'map-page') {
        updateMapMarkers();
    }
}

// Add diary entry
function addDiaryEntry(e) {
    e.preventDefault();
    
    const entry = {
        id: Date.now(),
        date: document.getElementById('diary-date').value,
        title: document.getElementById('diary-title').value,
        content: document.getElementById('diary-content').value,
        image: document.getElementById('diary-image').value
    };
    
    state.diaryEntries.push(entry);
    saveToLocalStorage();
    renderDiaryEntries();
    closeAllModals();
}

// Add budget item
function addBudgetItem(e) {
    e.preventDefault();
    
    const item = {
        id: Date.now(),
        category: document.getElementById('budget-category').value,
        description: document.getElementById('budget-description').value,
        amount: parseInt(document.getElementById('budget-amount').value),
        payment: document.getElementById('budget-payment').value,
        notes: document.getElementById('budget-notes').value
    };
    
    state.budgetItems.push(item);
    saveToLocalStorage();
    renderBudgetItems();
    closeAllModals();
}

// Add info item
function addInfoItem(e) {
    e.preventDefault();
    
    const type = document.getElementById('info-type').value;
    let item = { id: Date.now() };
    
    switch(type) {
        case 'flight':
            item.flightNumber = document.getElementById('flight-number').value;
            item.departureTime = document.getElementById('departure-time').value;
            item.arrivalTime = document.getElementById('arrival-time').value;
            break;
        case 'hotel':
            item.address = document.getElementById('hotel-address').value;
            item.checkInTime = document.getElementById('check-in-time').value;
            item.checkOutTime = document.getElementById('check-out-time').value;
            break;
        case 'car':
            item.pickUpTime = document.getElementById('pick-up-time').value;
            item.returnTime = document.getElementById('return-time').value;
            item.pickUpLocation = document.getElementById('pick-up-location').value;
            item.returnLocation = document.getElementById('return-location').value;
            break;
        case 'other':
            item.title = document.getElementById('other-title').value;
            item.details = document.getElementById('other-details').value;
            break;
    }
    
    item.notes = document.getElementById('info-notes').value;
    state.infoItems[type].push(item);
    
    // Update rental locations on map
    if (type === 'car') {
        document.getElementById('pickup-location').textContent = item.pickUpLocation;
        document.getElementById('return-location').textContent = item.returnLocation;
    }
    
    saveToLocalStorage();
    renderInfoItems();
    closeAllModals();
}

// Edit activity
function editActivity(id) {
    const activity = state.itinerary.find(item => item.id === id);
    if (!activity) return;
    
    // Pre-fill the form
    document.getElementById('activity-date').value = activity.date;
    document.getElementById('activity-time').value = activity.time;
    document.getElementById('activity-name').value = activity.name;
    document.getElementById('activity-location').value = activity.location;
    document.getElementById('activity-notes').value = activity.notes;
    
    // Remove the old activity
    state.itinerary = state.itinerary.filter(item => item.id !== id);
    
    // Show modal for editing
    showModal('activity-modal');
}

// Delete activity
function deleteActivity(id) {
    if (confirm('Are you sure you want to delete this activity?')) {
        state.itinerary = state.itinerary.filter(item => item.id !== id);
        saveToLocalStorage();
        renderItinerary();
        
        // Update map if we're on the map page
        if (state.currentPage === 'map-page') {
            updateMapMarkers();
        }
    }
}

// Edit diary entry
function editDiaryEntry(id) {
    const entry = state.diaryEntries.find(item => item.id === id);
    if (!entry) return;
    
    // Pre-fill the form
    document.getElementById('diary-date').value = entry.date;
    document.getElementById('diary-title').value = entry.title;
    document.getElementById('diary-content').value = entry.content;
    document.getElementById('diary-image').value = entry.image;
    
    // Remove the old entry
    state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
    
    // Show modal for editing
    showModal('diary-modal');
}

// Delete diary entry
function deleteDiaryEntry(id) {
    if (confirm('Are you sure you want to delete this diary entry?')) {
        state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
        saveToLocalStorage();
        renderDiaryEntries();
    }
}

// Edit budget item
function editBudgetItem(id) {
    const item = state.budgetItems.find(budget => budget.id === id);
    if (!item) return;
    
    // Pre-fill the form
    document.getElementById('budget-category').value = item.category;
    document.getElementById('budget-description').value = item.description;
    document.getElementById('budget-amount').value = item.amount;
    document.getElementById('budget-payment').value = item.payment;
    document.getElementById('budget-notes').value = item.notes;
    
    // Remove the old item
    state.budgetItems = state.budgetItems.filter(budget => budget.id !== id);
    
    // Show modal for editing
    showModal('budget-modal');
}

// Delete budget item
function deleteBudgetItem(id) {
    if (confirm('Are you sure you want to delete this budget item?')) {
        state.budgetItems = state.budgetItems.filter(item => item.id !== id);
        saveToLocalStorage();
        renderBudgetItems();
    }
}

// Edit info item
function editInfoItem(type, id) {
    const item = state.infoItems[type].find(info => info.id === id);
    if (!item) return;
    
    // Show modal with appropriate type
    showInfoModal(type);
    
    // Pre-fill form based on type
    setTimeout(() => {
        switch(type) {
            case 'flight':
                document.getElementById('flight-number').value = item.flightNumber || '';
                document.getElementById('departure-time').value = item.departureTime || '';
                document.getElementById('arrival-time').value = item.arrivalTime || '';
                break;
            case 'hotel':
                document.getElementById('hotel-address').value = item.address || '';
                document.getElementById('check-in-time').value = item.checkInTime || '';
                document.getElementById('check-out-time').value = item.checkOutTime || '';
                break;
            case 'car':
                document.getElementById('pick-up-time').value = item.pickUpTime || '';
                document.getElementById('return-time').value = item.returnTime || '';
                document.getElementById('pick-up-location').value = item.pickUpLocation || '';
                document.getElementById('return-location').value = item.returnLocation || '';
                break;
            case 'other':
                document.getElementById('other-title').value = item.title || '';
                document.getElementById('other-details').value = item.details || '';
                break;
        }
        document.getElementById('info-notes').value = item.notes || '';
        
        // Remove the old item
        state.infoItems[type] = state.infoItems[type].filter(info => info.id !== id);
    }, 100);
}

// Delete info item
function deleteInfoItem(type, id) {
    if (confirm('Are you sure you want to delete this information?')) {
        state.infoItems[type] = state.infoItems[type].filter(item => item.id !== id);
        saveToLocalStorage();
        renderInfoItems();
        
        // Update map if car rental info was deleted
        if (type === 'car' && state.currentPage === 'map-page') {
            updateMapMarkers();
        }
    }
}

// Render itinerary
function renderItinerary() {
    const container = document.querySelector('.itinerary-container');
    container.innerHTML = '';
    
    // Group activities by date
    const activitiesByDate = {};
    state.itinerary.forEach(activity => {
        if (!activitiesByDate[activity.date]) {
            activitiesByDate[activity.date] = [];
        }
        activitiesByDate[activity.date].push(activity);
    });
    
    // Sort dates
    const dates = Object.keys(activitiesByDate).sort();
    
    // Create day sections
    dates.forEach((date, index) => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        
        // Format date
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <div class="day-title">
                <i class="fas fa-calendar-day" style="color: ${state.colors[index % state.colors.length]}"></i>
                <span>Day ${index + 1}</span>
            </div>
            <div class="day-date">${formattedDate}</div>
        `;
        daySection.appendChild(dayHeader);
        
        // Activity list
        const activityList = document.createElement('div');
        activityList.className = 'activity-list';
        
        // Sort activities by time
        const activities = activitiesByDate[date].sort((a, b) => {
            return a.time.localeCompare(b.time);
        });
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.setAttribute('data-id', activity.id);
            activityItem.draggable = true;
            
            activityItem.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-details">
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${activity.location || 'No location specified'}</span>
                    </div>
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                </div>
                <div class="activity-actions">
                    <button class="btn-icon edit-activity" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete delete-activity" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add drag and drop event listeners
            activityItem.addEventListener('dragstart', handleDragStart);
            activityItem.addEventListener('dragover', handleDragOver);
            activityItem.addEventListener('drop', handleDrop);
            activityItem.addEventListener('dragend', handleDragEnd);
            
            // Add edit and delete event listeners
            const editBtn = activityItem.querySelector('.edit-activity');
            const deleteBtn = activityItem.querySelector('.delete-activity');
            
            editBtn.addEventListener('click', () => editActivity(activity.id));
            deleteBtn.addEventListener('click', () => deleteActivity(activity.id));
            
            activityList.appendChild(activityItem);
        });
        
        daySection.appendChild(activityList);
        container.appendChild(daySection);
    });
    
    // Add drag and drop functionality
    initDragAndDrop();
}

// Render diary entries
function renderDiaryEntries() {
    const container = document.querySelector('.diary-container');
    container.innerHTML = '';
    
    state.diaryEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'diary-entry';
        
        const formattedDate = new Date(entry.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        entryElement.innerHTML = `
            <div class="diary-header-row">
                <div class="diary-title">${entry.title}</div>
                <div class="diary-date">${formattedDate}</div>
            </div>
            <div class="diary-content">${entry.content}</div>
            ${entry.image ? `<img src="${entry.image}" alt="Diary image" class="diary-image">` : ''}
            <div class="activity-actions" style="margin-top: 15px;">
                <button class="btn-icon edit-diary" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-diary" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = entryElement.querySelector('.edit-diary');
        const deleteBtn = entryElement.querySelector('.delete-diary');
        
        editBtn.addEventListener('click', () => editDiaryEntry(entry.id));
        deleteBtn.addEventListener('click', () => deleteDiaryEntry(entry.id));
        
        container.appendChild(entryElement);
    });
}

// Render budget items
function renderBudgetItems() {
    const container = document.querySelector('.budget-container');
    container.innerHTML = '';
    
    let totalSpent = 0;
    
    state.budgetItems.forEach(item => {
        totalSpent += item.amount;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'budget-item';
        
        // Format amount with Thai Baht symbol
        const formattedAmount = `฿${item.amount.toLocaleString()}`;
        
        itemElement.innerHTML = `
            <div class="budget-info">
                <div class="budget-category ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                <div class="budget-description">${item.description}</div>
                <div class="budget-payment">
                    <i class="fas fa-credit-card"></i>
                    <span>${item.payment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center;">
                <div class="budget-amount">${formattedAmount}</div>
                <div class="activity-actions">
                    <button class="btn-icon edit-budget" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete delete-budget" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = itemElement.querySelector('.edit-budget');
        const deleteBtn = itemElement.querySelector('.delete-budget');
        
        editBtn.addEventListener('click', () => editBudgetItem(item.id));
        deleteBtn.addEventListener('click', () => deleteBudgetItem(item.id));
        
        container.appendChild(itemElement);
    });
    
    // Update budget summary
    const totalBudget = 15800;
    const remaining = totalBudget - totalSpent;
    
    document.querySelector('.amount.spent').textContent = `฿${totalSpent.toLocaleString()}`;
    document.querySelector('.amount.remaining').textContent = `฿${remaining.toLocaleString()}`;
}

// Render info items
function renderInfoItems() {
    // Flight info
    const flightContainer = document.getElementById('flight-info');
    flightContainer.innerHTML = '';
    
    state.infoItems.flight.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'info-item';
        
        itemElement.innerHTML = `
            <div class="info-field">
                <strong>Flight Number:</strong>
                <span>${item.flightNumber}</span>
            </div>
            <div class="info-field">
                <strong>Departure:</strong>
                <span>${item.departureTime}</span>
            </div>
            <div class="info-field">
                <strong>Arrival:</strong>
                <span>${item.arrivalTime}</span>
            </div>
            ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            <div class="activity-actions" style="margin-top: 10px;">
                <button class="btn-icon edit-info" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-info" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = itemElement.querySelector('.edit-info');
        const deleteBtn = itemElement.querySelector('.delete-info');
        
        editBtn.addEventListener('click', () => editInfoItem('flight', item.id));
        deleteBtn.addEventListener('click', () => deleteInfoItem('flight', item.id));
        
        flightContainer.appendChild(itemElement);
    });
    
    // Hotel info
    const hotelContainer = document.getElementById('hotel-info');
    hotelContainer.innerHTML = '';
    
    state.infoItems.hotel.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'info-item';
        
        itemElement.innerHTML = `
            <div class="info-field">
                <strong>Address:</strong>
                <span>${item.address}</span>
            </div>
            <div class="info-field">
                <strong>Check-in:</strong>
                <span>${item.checkInTime}</span>
            </div>
            <div class="info-field">
                <strong>Check-out:</strong>
                <span>${item.checkOutTime}</span>
            </div>
            ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            <div class="activity-actions" style="margin-top: 10px;">
                <button class="btn-icon edit-info" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-info" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = itemElement.querySelector('.edit-info');
        const deleteBtn = itemElement.querySelector('.delete-info');
        
        editBtn.addEventListener('click', () => editInfoItem('hotel', item.id));
        deleteBtn.addEventListener('click', () => deleteInfoItem('hotel', item.id));
        
        hotelContainer.appendChild(itemElement);
    });
    
    // Car rental info
    const carContainer = document.getElementById('car-info');
    carContainer.innerHTML = '';
    
    state.infoItems.car.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'info-item';
        
        itemElement.innerHTML = `
            <div class="info-field">
                <strong>Pick-up Time:</strong>
                <span>${item.pickUpTime}</span>
            </div>
            <div class="info-field">
                <strong>Return Time:</strong>
                <span>${item.returnTime}</span>
            </div>
            <div class="info-field">
                <strong>Pick-up Location:</strong>
                <span>${item.pickUpLocation}</span>
            </div>
            <div class="info-field">
                <strong>Return Location:</strong>
                <span>${item.returnLocation}</span>
            </div>
            ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            <div class="activity-actions" style="margin-top: 10px;">
                <button class="btn-icon edit-info" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-info" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = itemElement.querySelector('.edit-info');
        const deleteBtn = itemElement.querySelector('.delete-info');
        
        editBtn.addEventListener('click', () => editInfoItem('car', item.id));
        deleteBtn.addEventListener('click', () => deleteInfoItem('car', item.id));
        
        carContainer.appendChild(itemElement);
    });
    
    // Other info
    const otherContainer = document.getElementById('other-info');
    otherContainer.innerHTML = '';
    
    state.infoItems.other.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'info-item';
        
        itemElement.innerHTML = `
            <div class="info-field">
                <strong>${item.title}:</strong>
                <span>${item.details}</span>
            </div>
            ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            <div class="activity-actions" style="margin-top: 10px;">
                <button class="btn-icon edit-info" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-info" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add edit and delete event listeners
        const editBtn = itemElement.querySelector('.edit-info');
        const deleteBtn = itemElement.querySelector('.delete-info');
        
        editBtn.addEventListener('click', () => editInfoItem('other', item.id));
        deleteBtn.addEventListener('click', () => deleteInfoItem('other', item.id));
        
        otherContainer.appendChild(itemElement);
    });
}

// Drag and drop functionality for itinerary
let draggedItem = null;

function initDragAndDrop() {
    const activityItems = document.querySelectorAll('.activity-item');
    
    activityItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        // Get the IDs of the dragged item and the drop target
        const draggedId = parseInt(draggedItem.getAttribute('data-id'));
        const targetId = parseInt(this.getAttribute('data-id'));
        
        // Find the indices of the items in the state
        const draggedIndex = state.itinerary.findIndex(item => item.id === draggedId);
        const targetIndex = state.itinerary.findIndex(item => item.id === targetId);
        
        // Reorder the array
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [removed] = state.itinerary.splice(draggedIndex, 1);
            state.itinerary.splice(targetIndex, 0, removed);
            
            // Save and re-render
            saveToLocalStorage();
            renderItinerary();
        }
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// Local storage functions
function saveToLocalStorage() {
    const appData = {
        tripTitle: document.getElementById('trip-title').textContent,
        itinerary: state.itinerary,
        diaryEntries: state.diaryEntries,
        budgetItems: state.budgetItems,
        infoItems: state.infoItems
    };
    
    localStorage.setItem('travelAppData', JSON.stringify(appData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('travelAppData');
    
    if (savedData) {
        const appData = JSON.parse(savedData);
        
        document.getElementById('trip-title').textContent = appData.tripTitle || 'My Trip';
        state.itinerary = appData.itinerary || [];
        state.diaryEntries = appData.diaryEntries || [];
        state.budgetItems = appData.budgetItems || [];
        state.infoItems = appData.infoItems || {
            flight: [],
            hotel: [],
            car: [],
            other: []
        };
    }
}

// Update weather and exchange rate (simulated API calls)
function updateWeatherAndExchange() {
    // Simulate API calls with mock data
    const mockExchangeRate = (4.5 + Math.random() * 0.2 - 0.1).toFixed(2);
    document.getElementById('exchange-rate').textContent = `1 HKD = ${mockExchangeRate} THB`;
    
    const temperatures = [30, 31, 32, 33, 34];
    const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
    const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    document.getElementById('weather-info').textContent = `Bangkok: ${randomTemp}°C, ${randomWeather}`;
    
    // Update weather icon based on condition
    const weatherIcon = document.querySelector('.weather i');
    if (randomWeather.includes('Rain')) {
        weatherIcon.className = 'fas fa-cloud-rain';
    } else if (randomWeather.includes('Cloud')) {
        weatherIcon.className = 'fas fa-cloud';
    } else {
        weatherIcon.className = 'fas fa-sun';
    }
}

// Initialize weather and exchange rate updates
setInterval(updateWeatherAndExchange, 30000); // Update every 30 seconds
updateWeatherAndExchange(); // Initial update
