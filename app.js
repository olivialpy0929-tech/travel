// app.js

// ... (all code before showPage remains the same) ...

// NEW & IMPROVED: 3. Layout - Updated to control widget visibility
function showPage(pageId) {
    console.log('切換到頁面:', pageId);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Update nav button state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            }
        });
        
        // Update current page state
        state.currentPage = pageId;

        // NEW & IMPROVED: 3. Layout - Show/hide header widgets based on page
        const headerWidgets = document.querySelector('.header-widgets');
        if (pageId === 'home-page') {
            // Only show widgets on the Home page
            headerWidgets.classList.remove('hidden');
        } else {
            // Hide widgets on all other pages
            headerWidgets.classList.add('hidden');
        }
        
        // If it's the map page, initialize the map
        if (pageId === 'map-page') {
            console.log('初始化地圖頁面...');
            if (!state.mapInitialized) {
                initMap();
            } else {
                updateMapMarkers();
            }
        }
        
        console.log('頁面切換完成:', pageId);
    } else {
        console.error('頁面不存在:', pageId);
    }
}


// ... (all code after showPage remains the same) ...

// NEW & IMPROVED: 2. Size - Updated renderItinerary to use smaller icons
function renderItinerary() {
    const container = document.querySelector('.itinerary-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.itinerary.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route fa-3x"></i>
                <h3>尚未添加任何行程</h3>
                <p>點擊"添加活動"按鈕開始規劃您的旅程</p>
            </div>
        `;
        return;
    }
    
    // Group activities by date
    const activitiesByDate = {};
    state.itinerary.forEach(activity => {
        if (!activitiesByDate[activity.date]) {
            activitiesByDate[activity.date] = [];
        }
        activitiesByDate[activity.date].push(activity);
    });
    
    const dates = Object.keys(activitiesByDate).sort();
    
    dates.forEach((date, index) => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('zh-Hant', { weekday: 'long', month: 'long', day: 'numeric' });
        
        daySection.innerHTML = `
            <div class="day-header">
                <div class="day-title">
                    <i class="fas fa-calendar-day" style="color: ${state.colors[index % state.colors.length]}"></i>
                    <span>第 ${index + 1} 天</span>
                </div>
                <div class="day-date">${formattedDate}</div>
            </div>
        `;
        
        const activityList = document.createElement('div');
        activityList.className = 'activity-list';
        
        const activities = activitiesByDate[date].sort((a, b) => a.time.localeCompare(b.time));
        
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
                        <span>${activity.location || '未指定地點'}</span>
                    </div>
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                </div>
                <div class="activity-actions">
                    <button class="btn-icon edit-activity" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete delete-activity" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            activityItem.querySelector('.edit-activity').addEventListener('click', () => editActivity(activity.id));
            activityItem.querySelector('.delete-activity').addEventListener('click', () => deleteActivity(activity.id));
            
            activityList.appendChild(activityItem);
        });
        
        daySection.appendChild(activityList);
        container.appendChild(daySection);
    });
    
    initDragAndDrop();
    console.log('行程渲染完成，共', state.itinerary.length, '個活動');
}


// ... (rest of the file remains the same) ...
