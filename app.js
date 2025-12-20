// 應用程序狀態
// At the top of app.js, near your `state` object

function getActivityTypeDetails(type) {
    const types = {
        'food': { icon: 'fas fa-utensils', color: '#f59e0b' }, // Amber
        'shopping': { icon: 'fas fa-shopping-bag', color: '#ec4899' }, // Pink
        'sightseeing': { icon: 'fas fa-landmark', color: '#8b5cf6' }, // Violet
        'travel': { icon: 'fas fa-plane-departure', color: '#3b82f6' }, // Blue
        'accommodation': { icon: 'fas fa-bed', color: '#10b981' }, // Emerald
        'other': { icon: 'fas fa-star', color: '#64748b' } // Slate
    };
    return types[type] || types['other'];
}
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
    mapInitialized: false,
    mapMarkers: [],
    directionsRenderer: null,
    colors: ['#ff6b8b', '#38a169', '#ff8f00', '#9f7aea', '#ff5252', '#4299e1']
};

// DOM 完全加載後初始化應用程序
document.addEventListener('DOMContentLoaded', initApp);

// 初始化應用程序
function initApp() {
    console.log('初始化應用...');
    
    try {
        // 設置表單的默認日期為今天
        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('activity-date')) {
            document.getElementById('activity-date').value = today;
        }
        if (document.getElementById('diary-date')) {
            document.getElementById('diary-date').value = today;
        }
        
        // 從本地存儲加載數據
        loadFromLocalStorage();
        
        // 渲染初始數據
        renderItinerary();
        renderDiaryEntries();
        renderBudgetItems();
        renderInfoItems();
        
        // 初始化事件監聽器
        initEventListeners();
        
        // 初始顯示首頁並更新小工具
        showPage('home-page');
        
        // 初始化天氣和匯率
        updateWeatherAndExchange();
        updateCountdown();

        
        console.log('應用初始化完成');
    } catch (error) {
        console.error('初始化應用時出錯:', error);
    }
}

// 初始化事件監聽器
function initEventListeners() {
    console.log('初始化事件監聽器...');
    
    try {
        // 導航按鈕
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('找到導航按鈕:', navButtons.length);
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                console.log('導航按鈕點擊:', pageId);
                showPage(pageId);
            });
        });
        
        // 添加活動按鈕
        const addActivityBtn = document.getElementById('add-activity');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => {
                console.log('添加活動按鈕點擊');
                showModal('activity-modal');
            });
        }
        
        // 添加日記按鈕
        const addDiaryBtn = document.getElementById('add-diary-entry');
        if (addDiaryBtn) {
            addDiaryBtn.addEventListener('click', () => {
                console.log('添加日記按鈕點擊');
                showModal('diary-modal');
            });
        }
        
        // 添加預算按鈕
        const addBudgetBtn = document.getElementById('add-budget-item');
        if (addBudgetBtn) {
            addBudgetBtn.addEventListener('click', () => {
                console.log('添加預算項目按鈕點擊');
                showModal('budget-modal');
            });
        }
        
        // 添加資訊按鈕
        const addInfoBtns = document.querySelectorAll('.add-info-btn');
        addInfoBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                console.log('添加資訊按鈕點擊:', section);
                showInfoModal(section);
            });
        });
        
        // 表單提交事件
        const activityForm = document.getElementById('activity-form');
        if (activityForm) {
            activityForm.addEventListener('submit', addActivity);
        }
        
        const diaryForm = document.getElementById('diary-form');
        if (diaryForm) {
            diaryForm.addEventListener('submit', addDiaryEntry);
        }
        
        const budgetForm = document.getElementById('budget-form');
        if (budgetForm) {
            budgetForm.addEventListener('submit', addBudgetItem);
        }
        
        const infoForm = document.getElementById('info-form');
        if (infoForm) {
            infoForm.addEventListener('submit', addInfoItem);
        }
        
        // 關閉彈出視窗按鈕
        const closeModalBtns = document.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // 點擊彈出視窗外部關閉
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAllModals();
                }
            });
        });
        
        // 旅程標題編輯
        const tripTitle = document.getElementById('trip-title');
        if (tripTitle) {
            tripTitle.addEventListener('blur', saveToLocalStorage);
        }
        
        // 資訊類型變更
        const infoTypeSelect = document.getElementById('info-type');
        if (infoTypeSelect) {
            infoTypeSelect.addEventListener('change', function() {
                updateInfoFormFields(this.value);
            });
        }
        
        // 顯示路線按鈕
        const showRouteBtn = document.getElementById('show-route');
        if (showRouteBtn) {
            showRouteBtn.addEventListener('click', showRouteOnMap);
        }
        
        console.log('事件監聽器初始化完成');
    } catch (error) {
        console.error('初始化事件監聽器時出錯:', error);
    }
}

// 顯示頁面 - 修復導航功能
function showPage(pageId) {
    console.log('切換到頁面:', pageId);
    
    // 隱藏所有頁面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示選定的頁面
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // 更新導航按鈕狀態
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            }
        });
        
        // 更新當前頁面狀態
        state.currentPage = pageId;
        
        // 顯示/隱藏小工具行（只在首頁顯示）
        const widgetRow = document.getElementById('widget-row');
        if (widgetRow) {
            if (pageId === 'home-page') {
                widgetRow.style.display = 'flex';
                // 更新小工具數據
                updateWeatherAndExchange();
                updateCountdown();
            } else {
                widgetRow.style.display = 'none';
            }
        }
        
        // 如果是地圖頁面，初始化地圖
        if (pageId === 'map-page') {
            console.log('初始化地圖頁面...');
            setTimeout(() => {
                if (!state.mapInitialized) {
                    initMap();
                } else {
                    updateMapMarkers();
                }
            }, 100); // 給頁面切換動畫一點時間
        }
        
        // 如果是其他頁面，確保重新渲染內容
        if (pageId === 'home-page') {
            renderItinerary();
        } else if (pageId === 'diary-page') {
            renderDiaryEntries();
        } else if (pageId === 'budget-page') {
            renderBudgetItems();
        } else if (pageId === 'info-page') {
            renderInfoItems();
        }

         // 添加這一行：滾動到頂部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('頁面切換完成:', pageId);
    } else {
        console.error('頁面不存在:', pageId);
    }
}

// 窗口大小改變時調整佈局
window.addEventListener('resize', function() {
    // 如果在地圖頁面，重新調整地圖大小
    if (state.currentPage === 'map-page' && state.mapInitialized) {
        setTimeout(() => {
            google.maps.event.trigger(state.map, 'resize');
        }, 100);
    }
});

// 初始化地圖
function initMap() {
    console.log('初始化地圖...');
    
    // 檢查地圖容器是否存在
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('地圖容器不存在');
        return;
    }
    
    try {
        // 曼谷座標
        const bangkokCoords = { lat: 13.7563, lng: 100.5018 };
        
        // 初始化地圖
        state.map = new google.maps.Map(mapContainer, {
            zoom: 12,
            center: bangkokCoords,
            mapTypeId: 'roadmap',
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });
        
        state.mapInitialized = true;
        
        // 初始化路線渲染器
        state.directionsRenderer = new google.maps.DirectionsRenderer();
        state.directionsRenderer.setMap(state.map);
        
        console.log('地圖初始化成功');
        
        // 更新標記
        updateMapMarkers();
        
        // 移除加載指示器
        const mapLoading = mapContainer.querySelector('.map-loading');
        if (mapLoading) {
            mapLoading.style.display = 'none';
        }
        
    } catch (error) {
        console.error('初始化地圖時出錯:', error);
        
        // 顯示錯誤訊息
        const errorHtml = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: rgba(255, 255, 255, 0.9); border-radius: 22px;">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; color: #8b7d7d; margin-bottom: 15px;"></i>
                    <h3>地圖無法加載</h3>
                    <p>請檢查您的Google Maps API密鑰</p>
                    <p style="font-size: 0.9rem; color: #a0aec0;">錯誤: ${error.message}</p>
                </div>
            </div>
        `;
        
        mapContainer.innerHTML = errorHtml;
    }
}

// 更新地圖標記
function updateMapMarkers() {
    if (!state.mapInitialized || !state.map) {
        console.log('地圖未初始化，跳過更新標記');
        return;
    }
    
    console.log('更新地圖標記...');
    
    // 清除現有標記
    state.mapMarkers.forEach(marker => {
        marker.setMap(null);
    });
    state.mapMarkers = [];
    
    // 更新地點列表
    const locationsList = document.getElementById('locations-list');
    if (!locationsList) return;
    
    locationsList.innerHTML = '';
    
    // 從行程添加標記
    const locations = [];
    const bounds = new google.maps.LatLngBounds();
    
    state.itinerary.forEach(activity => {
        if (activity.location && activity.location.trim() !== '') {
            locations.push(activity.name);
            
            // 為演示生成曼谷附近的隨機座標
            const lat = 13.7563 + (Math.random() - 0.5) * 0.1;
            const lng = 100.5018 + (Math.random() - 0.5) * 0.1;
            const position = { lat, lng };
            
            const marker = new google.maps.Marker({
                position: position,
                map: state.map,
                title: activity.name,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: `<div style="padding: 10px;"><b>${activity.name}</b><br>${activity.time}<br>${activity.location}</div>`
            });
            
            marker.addListener('click', () => {
                infoWindow.open(state.map, marker);
            });
            
            state.mapMarkers.push(marker);
            bounds.extend(position);
        }
    });
    
    // 更新地點列表
    if (locations.length > 0) {
        locations.forEach(location => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location}`;
            locationsList.appendChild(li);
        });
        
        // 自動調整地圖視野以包含所有標記
        if (state.mapMarkers.length > 0) {
            state.map.fitBounds(bounds);
            // 如果只有一個標記，設置適當的縮放級別
            if (state.mapMarkers.length === 1) {
                setTimeout(() => {
                    state.map.setZoom(14);
                }, 300);
            }
        }
    } else {
        const li = document.createElement('li');
        li.className = 'empty';
        li.textContent = '尚未添加地點';
        locationsList.appendChild(li);
    }
    
    // 更新租車地點
    const pickupLocation = document.getElementById('pickup-location');
    const returnLocation = document.getElementById('return-location');
    
    if (state.infoItems.car.length > 0) {
        const carInfo = state.infoItems.car[0];
        if (pickupLocation) pickupLocation.textContent = carInfo.pickUpLocation || '--';
        if (returnLocation) returnLocation.textContent = carInfo.returnLocation || '--';
    } else {
        if (pickupLocation) pickupLocation.textContent = '--';
        if (returnLocation) returnLocation.textContent = '--';
    }
}

// 在地圖上顯示路線
function showRouteOnMap() {
    if (!state.mapInitialized || !state.map) {
        alert('地圖尚未初始化，請稍候再試');
        return;
    }
    
    console.log('顯示路線...');
    
    if (state.itinerary.length < 2) {
        alert('請至少添加兩個活動來計算路線');
        return;
    }
    
    const directionsService = new google.maps.DirectionsService();
    
    // 創建行程點
    const waypoints = [];
    
    // 添加活動地點作為途經點
    state.itinerary.slice(1, -1).forEach(activity => {
        if (activity.location && activity.location.trim() !== '') {
            const lat = 13.7563 + (Math.random() - 0.5) * 0.1;
            const lng = 100.5018 + (Math.random() - 0.5) * 0.1;
            waypoints.push({
                location: { lat, lng },
                stopover: true
            });
        }
    });
    
    // 設置起點和終點
    const origin = state.itinerary[0].location || '曼谷';
    const destination = state.itinerary[state.itinerary.length - 1].location || '曼谷';
    
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: true,
        provideRouteAlternatives: true
    };
    
    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            state.directionsRenderer.setDirections(result);
            
            // 計算總旅行時間
            let totalDuration = 0;
            if (result.routes[0] && result.routes[0].legs) {
                result.routes[0].legs.forEach(leg => {
                    if (leg.duration) {
                        totalDuration += leg.duration.value;
                    }
                });
            }
            
            // 將秒轉換為分鐘
            const totalMinutes = Math.round(totalDuration / 60);
            document.getElementById('total-travel-time').textContent = `總時間: ${totalMinutes} 分鐘`;
            
            console.log('路線顯示成功，總時間:', totalMinutes, '分鐘');
        } else {
            console.error('路線請求失敗:', status);
            // 如果API請求失敗，使用模擬數據
            const totalMinutes = 45 + Math.floor(Math.random() * 30);
            document.getElementById('total-travel-time').textContent = `總時間: ${totalMinutes} 分鐘`;
            alert('無法計算路線，請檢查網絡連接或稍後再試');
        }
    });
}

// 顯示彈出視窗
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        console.log('顯示彈出視窗:', modalId);
    }
}

// 顯示資訊彈出視窗
function showInfoModal(section) {
    document.getElementById('info-type').value = section;
    updateInfoFormFields(section);
    showModal('info-modal');
}

// 更新資訊表單字段
function updateInfoFormFields(type) {
    const formFields = document.getElementById('info-form-fields');
    if (!formFields) return;
    
    formFields.innerHTML = '';
    
    let fields = [];
    let modalTitle = '添加資訊';
    
    switch(type) {
        case 'flight':
            fields = [
                {id: 'flight-number', label: '航班編號', type: 'text'},
                {id: 'departure-airport', label: '出發機場', type: 'text'},
                {id: 'arrival-airport', label: '抵達機場', type: 'text'},
                {id: 'departure-time', label: '起飛時間', type: 'datetime-local'},
                {id: 'arrival-time', label: '到達時間', type: 'datetime-local'}
            ];
            modalTitle = '添加航班資訊';
            break;
        case 'hotel':
            fields = [
                {id: 'hotel-name', label: '酒店名稱', type: 'text'},
                {id: 'hotel-address', label: '酒店地址', type: 'text'},
                {id: 'check-in-time', label: '入住時間', type: 'datetime-local'},
                {id: 'check-out-time', label: '退房時間', type: 'datetime-local'}
            ];
            modalTitle = '添加酒店資訊';
            break;
        case 'car':
            fields = [
                {id: 'rental-company', label: '租車公司', type: 'text'},
                {id: 'pick-up-time', label: '取車時間', type: 'datetime-local'},
                {id: 'return-time', label: '還車時間', type: 'datetime-local'},
                {id: 'pick-up-location', label: '取車地點', type: 'text'},
                {id: 'return-location', label: '還車地點', type: 'text'}
            ];
            modalTitle = '添加租車資訊';
            break;
        case 'other':
            fields = [
                {id: 'other-title', label: '標題', type: 'text'},
                {id: 'other-details', label: '詳細資訊', type: 'textarea'}
            ];
            modalTitle = '添加其他資訊';
            break;
    }
    
    // 更新模態框標題
    const modalTitleElement = document.getElementById('info-modal-title');
    if (modalTitleElement) {
        modalTitleElement.textContent = modalTitle;
    }
    
    // 為所有類型添加備註字段
    fields.push({id: 'info-notes', label: '備註 (可選)', type: 'textarea'});
    
    // 生成表單字段
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
            textarea.placeholder = `輸入${field.label}...`;
            formGroup.appendChild(textarea);
        } else if (field.type === 'datetime-local') {
            const input = document.createElement('input');
            input.type = 'datetime-local';
            input.id = field.id;
            formGroup.appendChild(input);
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            input.placeholder = `輸入${field.label}...`;
            formGroup.appendChild(input);
        }
        
        formFields.appendChild(formGroup);
    });
}

// 關閉所有彈出視窗
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });

    const forms = ['activity-form', 'diary-form', 'budget-form', 'info-form'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            delete form.dataset.editingId; // Clean up editing state
        }
    });
    
    // Reset modal titles
    if(document.getElementById('activity-modal')) document.getElementById('activity-modal').querySelector('h3').textContent = '添加活動';
    if(document.getElementById('diary-modal-title')) document.getElementById('diary-modal-title').textContent = '添加日記';
    if(document.getElementById('budget-modal-title')) document.getElementById('budget-modal-title').textContent = '添加預算項目';
    if(document.getElementById('info-modal-title')) document.getElementById('info-modal-title').textContent = '添加資訊';


    const today = new Date().toISOString().split('T')[0];
    const activityDate = document.getElementById('activity-date');
    const diaryDate = document.getElementById('diary-date');
    
    if (activityDate) activityDate.value = today;
    if (diaryDate) diaryDate.value = today;
    
    console.log('關閉所有彈出視窗');
}

// 添加活動到行程
function addActivity(e) {
    e.preventDefault();
    console.log('保存活動...');
    const form = e.target;
    const editingId = form.dataset.editingId ? parseInt(form.dataset.editingId) : null;

    try {
        const activity = {
            id: editingId || Date.now(),
            date: document.getElementById('activity-date').value,
            time: document.getElementById('activity-time').value,
            name: document.getElementById('activity-name').value,
            type: document.getElementById('activity-type').value,
            location: document.getElementById('activity-location').value,
            notes: document.getElementById('activity-notes').value
        };

        if (!activity.name || !activity.date || !activity.time) {
            alert('請填寫所有必填欄位');
            return;
        }

        if (editingId) {
            const index = state.itinerary.findIndex(item => item.id === editingId);
            if (index > -1) state.itinerary[index] = activity;
        } else {
            state.itinerary.push(activity);
        }
        
        saveToLocalStorage();
        renderItinerary();
        closeAllModals();
        updateCountdown();
        console.log('活動保存成功:', activity);

    } catch (error) {
        console.error('保存活動時出錯:', error);
        alert('保存活動時發生錯誤，請稍後再試');
    }
}
// 添加日記條目
function addDiaryEntry(e) {
    e.preventDefault();
    console.log('保存日記條目...');
    const form = e.target;
    const editingId = form.dataset.editingId ? parseInt(form.dataset.editingId) : null;

    try {
        const entry = {
            id: editingId || Date.now(),
            date: document.getElementById('diary-date').value,
            title: document.getElementById('diary-title').value,
            content: document.getElementById('diary-content').value,
            image: document.getElementById('diary-image').value
        };

        if (!entry.title || !entry.content || !entry.date) {
            alert('請填寫所有必填欄位');
            return;
        }

        if (editingId) {
            const index = state.diaryEntries.findIndex(item => item.id === editingId);
            if (index > -1) state.diaryEntries[index] = entry;
        } else {
            state.diaryEntries.push(entry);
        }
        
        saveToLocalStorage();
        renderDiaryEntries();
        closeAllModals();
        console.log('日記條目保存成功:', entry);

    } catch (error) {
        console.error('保存日記條目時出錯:', error);
        alert('保存日記條目時發生錯誤，請稍後再試');
    }
}

// 添加預算項目
function addBudgetItem(e) {
    e.preventDefault();
    console.log('保存預算項目...');
    const form = e.target;
    const editingId = form.dataset.editingId ? parseInt(form.dataset.editingId) : null;

    try {
        const item = {
            id: editingId || Date.now(),
            category: document.getElementById('budget-category').value,
            description: document.getElementById('budget-description').value,
            amount: parseInt(document.getElementById('budget-amount').value) || 0,
            payment: document.getElementById('budget-payment').value,
            notes: document.getElementById('budget-notes').value
        };

        if (!item.category || !item.description || item.amount <= 0 || !item.payment) {
            alert('請填寫所有必填欄位並輸入有效的金額');
            return;
        }

        if (editingId) {
            const index = state.budgetItems.findIndex(budgetItem => budgetItem.id === editingId);
            if (index > -1) state.budgetItems[index] = item;
        } else {
            state.budgetItems.push(item);
        }
        
        saveToLocalStorage();
        renderBudgetItems();
        closeAllModals();
        console.log('預算項目保存成功:', item);

    } catch (error) {
        console.error('保存預算項目時出錯:', error);
        alert('保存預算項目時發生錯誤，請稍後再試');
    }
}

// 添加資訊項目
function addInfoItem(e) {
    e.preventDefault();
    console.log('保存資訊項目...');
    const form = e.target;
    const editingId = form.dataset.editingId ? parseInt(form.dataset.editingId) : null;

    try {
        const type = document.getElementById('info-type').value;
        if (!type) {
            alert('請選擇資訊類型');
            return;
        }

        let item = { id: editingId || Date.now(), type: type };

        switch (type) {
            case 'flight':
                item.flightNumber = document.getElementById('flight-number').value;
                item.departureAirport = document.getElementById('departure-airport').value;
                item.arrivalAirport = document.getElementById('arrival-airport').value;
                item.departureTime = document.getElementById('departure-time').value;
                item.arrivalTime = document.getElementById('arrival-time').value;
                break;
            case 'hotel':
                item.hotelName = document.getElementById('hotel-name').value;
                item.address = document.getElementById('hotel-address').value;
                item.checkInTime = document.getElementById('check-in-time').value;
                item.checkOutTime = document.getElementById('check-out-time').value;
                break;
            case 'car':
                item.rentalCompany = document.getElementById('rental-company').value;
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
        
        if (editingId) {
            const index = state.infoItems[type].findIndex(info => info.id === editingId);
            if (index > -1) state.infoItems[type][index] = item;
        } else {
            state.infoItems[type].push(item);
        }

        saveToLocalStorage();
        renderInfoItems();
        closeAllModals();
        
        if (type === 'car') {
            updateMapMarkers();
        }

        console.log('資訊項目保存成功:', item);

    } catch (error) {
        console.error('保存資訊項目時出錯:', error);
        alert('保存資訊項目時發生錯誤，請稍後再試');
    }
}

// 編輯活動
function editActivity(id) {
    const activity = state.itinerary.find(item => item.id === id);
    if (!activity) return;
    
    const form = document.getElementById('activity-form');
    form.dataset.editingId = activity.id;

    document.getElementById('activity-modal').querySelector('h3').textContent = '編輯活動';
    document.getElementById('activity-date').value = activity.date;
    document.getElementById('activity-time').value = activity.time;
    document.getElementById('activity-name').value = activity.name;
    document.getElementById('activity-type').value = activity.type;
    document.getElementById('activity-location').value = activity.location;
    document.getElementById('activity-notes').value = activity.notes || '';
    
    showModal('activity-modal');
    console.log('編輯活動:', id);
}

// 刪除活動
function deleteActivity(id) {
    if (confirm('您確定要刪除此活動嗎？')) {
        state.itinerary = state.itinerary.filter(item => item.id !== id);
        saveToLocalStorage();
        renderItinerary();
        
        // 如果在地圖頁面，更新標記
        if (state.currentPage === 'map-page' && state.mapInitialized) {
            updateMapMarkers();
        }
        
        // 更新倒數計時
        updateCountdown();
        
        console.log('刪除活動:', id);
    }
}

// 編輯日記條目
function editDiaryEntry(id) {
    const entry = state.diaryEntries.find(item => item.id === id);
    if (!entry) return;

    const form = document.getElementById('diary-form');
    form.dataset.editingId = entry.id;
    
    document.getElementById('diary-modal-title').textContent = '編輯日記';
    document.getElementById('diary-date').value = entry.date;
    document.getElementById('diary-title').value = entry.title;
    document.getElementById('diary-content').value = entry.content;
    document.getElementById('diary-image').value = entry.image || '';
    
    showModal('diary-modal');
    console.log('編輯日記條目:', id);
}
// 刪除日記條目
function deleteDiaryEntry(id) {
    if (confirm('您確定要刪除此日記條目嗎？')) {
        state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
        saveToLocalStorage();
        renderDiaryEntries();
        
        console.log('刪除日記條目:', id);
    }
}

// 編輯預算項目
function editBudgetItem(id) {
    const item = state.budgetItems.find(budget => budget.id === id);
    if (!item) return;

    const form = document.getElementById('budget-form');
    form.dataset.editingId = item.id;

    document.getElementById('budget-modal-title').textContent = '編輯預算項目';
    document.getElementById('budget-category').value = item.category;
    document.getElementById('budget-description').value = item.description;
    document.getElementById('budget-amount').value = item.amount;
    document.getElementById('budget-payment').value = item.payment;
    document.getElementById('budget-notes').value = item.notes || '';
    
    showModal('budget-modal');
    console.log('編輯預算項目:', id);
}

// 刪除預算項目
function deleteBudgetItem(id) {
    if (confirm('您確定要刪除此預算項目嗎？')) {
        state.budgetItems = state.budgetItems.filter(item => item.id !== id);
        saveToLocalStorage();
        renderBudgetItems();
        
        console.log('刪除預算項目:', id);
    }
}

// 編輯資訊項目
function editInfoItem(type, id) {
    const item = state.infoItems[type].find(info => info.id === id);
    if (!item) return;

    document.getElementById('info-form').dataset.editingId = id;
    showInfoModal(type); // This sets up the correct form fields

    setTimeout(() => {
        switch(type) {
            case 'flight':
                document.getElementById('flight-number').value = item.flightNumber || '';
                document.getElementById('departure-airport').value = item.departureAirport || '';
                document.getElementById('arrival-airport').value = item.arrivalAirport || '';
                document.getElementById('departure-time').value = item.departureTime || '';
                document.getElementById('arrival-time').value = item.arrivalTime || '';
                break;
            case 'hotel':
                document.getElementById('hotel-name').value = item.hotelName || '';
                document.getElementById('hotel-address').value = item.address || '';
                document.getElementById('check-in-time').value = item.checkInTime || '';
                document.getElementById('check-out-time').value = item.checkOutTime || '';
                break;
            case 'car':
                document.getElementById('rental-company').value = item.rentalCompany || '';
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
    }, 100);
    
    console.log('編輯資訊項目:', type, id);
}

// 刪除資訊項目
function deleteInfoItem(type, id) {
    if (confirm('您確定要刪除此資訊嗎？')) {
        state.infoItems[type] = state.infoItems[type].filter(item => item.id !== id);
        saveToLocalStorage();
        renderInfoItems();
        
        // 如果刪除了租車資訊，更新地圖
        if (type === 'car' && state.currentPage === 'map-page' && state.mapInitialized) {
            updateMapMarkers();
        }
        
        console.log('刪除資訊項目:', type, id);
    }
}

// 渲染行程
function renderItinerary() {
    const container = document.querySelector('.itinerary-container');
    if (!container) return;
    
    // 清空容器
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
    
    // 按日期分組活動
    const activitiesByDate = {};
    state.itinerary.forEach(activity => {
        if (!activitiesByDate[activity.date]) {
            activitiesByDate[activity.date] = [];
        }
        activitiesByDate[activity.date].push(activity);
    });
    
    // 排序日期
    const dates = Object.keys(activitiesByDate).sort();
    
    // 創建日期部分
    dates.forEach((date, index) => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        
        // 格式化日期
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('zh-Hant', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // 日期標題
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <div class="day-title">
                <i class="fas fa-chevron-down toggle-icon" style="color: ${state.colors[index % state.colors.length]}; font-size: 0.9em; width: 1.2em;"></i>
                <span>第 ${index + 1} 天</span>
            </div>
            <div class="day-date">${formattedDate}</div>
        `;

        // Add this click listener right after setting the innerHTML:
        dayHeader.addEventListener('click', () => {
        daySection.classList.toggle('is-collapsed');
        });
        
        daySection.appendChild(dayHeader);
        
        // 活動列表
        const activityList = document.createElement('div');
        activityList.className = 'activity-list';
        
        // 按時間排序活動
        const activities = activitiesByDate[date].sort((a, b) => {
            return a.time.localeCompare(b.time);
        });
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.setAttribute('data-id', activity.id);
            activityItem.draggable = true;

            const typeDetails = getActivityTypeDetails(activity.type);
            
        activityItem.innerHTML = `
    <div class="activity-timeline-marker">
        <div class="timeline-dot" style="border-color: ${typeDetails.color}; color: ${typeDetails.color};">
            <i class="${typeDetails.icon}"></i>
        </div>
        <div class="activity-time">${activity.time}</div>
    </div>
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
            
            // Adding this event listener to the parent is more efficient
            activityList.addEventListener('dragover', handleDragOver);
            activityItem.addEventListener('dragstart', handleDragStart);
            activityItem.addEventListener('drop', handleDrop);
            activityItem.addEventListener('dragend', handleDragEnd);
            
            // 添加編輯和刪除事件監聽器
            const editBtn = activityItem.querySelector('.edit-activity');
            const deleteBtn = activityItem.querySelector('.delete-activity');
            
            editBtn.addEventListener('click', () => editActivity(activity.id));
            deleteBtn.addEventListener('click', () => deleteActivity(activity.id));
            
            activityList.appendChild(activityItem);
        });
        
        daySection.appendChild(activityList);
        container.appendChild(daySection);
    });
    
    // 初始化拖放功能
    initDragAndDrop();
    
    console.log('行程渲染完成，共', state.itinerary.length, '個活動');
}

// 渲染日記條目
function renderDiaryEntries() {
    const container = document.querySelector('.diary-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (state.diaryEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open fa-3x"></i>
                <h3>尚未撰寫日記</h3>
                <p>記錄您的旅程點滴，添加第一則日記吧！</p>
            </div>
        `;
        return;
    }
    
    // 按日期降序排序
    const sortedEntries = [...state.diaryEntries].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'diary-entry';
        
        const formattedDate = new Date(entry.date).toLocaleDateString('zh-Hant', {
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
            ${entry.image ? `<img src="${entry.image}" alt="日記圖片" class="diary-image">` : ''}
            <div class="activity-actions" style="margin-top: 15px;">
                <button class="btn-icon edit-diary" title="編輯">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-diary" title="刪除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 添加編輯和刪除事件監聽器
        const editBtn = entryElement.querySelector('.edit-diary');
        const deleteBtn = entryElement.querySelector('.delete-diary');
        
        editBtn.addEventListener('click', () => editDiaryEntry(entry.id));
        deleteBtn.addEventListener('click', () => deleteDiaryEntry(entry.id));
        
        container.appendChild(entryElement);
    });
    
    console.log('日記渲染完成，共', state.diaryEntries.length, '則日記');
}

// 渲染預算項目
function renderBudgetItems() {
    const container = document.querySelector('.budget-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (state.budgetItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-coins fa-3x"></i>
                <h3>尚未添加預算項目</h3>
                <p>開始追蹤您的旅行花費</p>
            </div>
        `;
        
        // 更新預算摘要
        updateBudgetSummary();
        return;
    }
    
    let totalSpent = 0;
    
    state.budgetItems.forEach(item => {
        totalSpent += item.amount;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'budget-item';
        
        // 格式化金額，帶有泰銖符號
        const formattedAmount = `฿${item.amount.toLocaleString()}`;
        
        itemElement.innerHTML = `
            <div class="budget-info">
                <div class="budget-category ${item.category}">${getCategoryName(item.category)}</div>
                <div class="budget-description">${item.description}</div>
                <div class="budget-payment">
                    <i class="fas fa-credit-card"></i>
                    <span>${getPaymentName(item.payment)}</span>
                </div>
                ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center;">
                <div class="budget-amount">${formattedAmount}</div>
                <div class="activity-actions">
                    <button class="btn-icon edit-budget" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete delete-budget" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // 添加編輯和刪除事件監聽器
        const editBtn = itemElement.querySelector('.edit-budget');
        const deleteBtn = itemElement.querySelector('.delete-budget');
        
        editBtn.addEventListener('click', () => editBudgetItem(item.id));
        deleteBtn.addEventListener('click', () => deleteBudgetItem(item.id));
        
        container.appendChild(itemElement);
    });
    
    // 更新預算摘要
    updateBudgetSummary();
    
    console.log('預算渲染完成，共', state.budgetItems.length, '個項目，總花費:', totalSpent);
}

// 更新預算摘要
function updateBudgetSummary() {
    let totalSpent = 0;
    state.budgetItems.forEach(item => {
        totalSpent += item.amount;
    });
    
    // 默認總預算為15800泰銖，可根據需要調整
    const totalBudget = 20200;
    const remaining = totalBudget - totalSpent;
    
    const totalElement = document.querySelector('.budget-summary .summary-card:nth-child(1) .amount');
    const spentElement = document.querySelector('.budget-summary .summary-card:nth-child(2) .amount');
    const remainingElement = document.querySelector('.budget-summary .summary-card:nth-child(3) .amount');
    
    if (totalElement) totalElement.textContent = `฿${totalBudget.toLocaleString()}`;
    if (spentElement) spentElement.textContent = `฿${totalSpent.toLocaleString()}`;
    if (remainingElement) remainingElement.textContent = `฿${remaining.toLocaleString()}`;
}

// 獲取類別名稱
function getCategoryName(category) {
    const categories = {
        'food': '飲食 🍜',
        'shopping': '購物 🛍️',
        'leisure': '娛樂 🎭',
        'transport': '交通 🚕',
        'accommodation': '住宿 🏨',
        'other': '其他'
    };
    
    return categories[category] || category;
}

// 獲取支付方式名稱
function getPaymentName(payment) {
    const payments = {
        'credit-card': '信用卡 💳',
        'cash': '現金 💵',
        'debit-card': '轉帳卡',
        'e-wallet': '電子錢包'
    };
    
    return payments[payment] || payment;
}

// 渲染資訊項目
function renderInfoItems() {
    console.log('渲染資訊項目...');
    
    // 航班資訊
    renderInfoSection('flight', 'flight-info');
    
    // 酒店資訊
    renderInfoSection('hotel', 'hotel-info');
    
    // 租車資訊
    renderInfoSection('car', 'car-info');
    
    // 其他資訊
    renderInfoSection('other', 'other-info');
}

// 渲染單個資訊部分
function renderInfoSection(type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (state.infoItems[type].length === 0) {
        container.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-${getInfoIcon(type)}"></i>
                <p>尚未添加${getInfoTypeName(type)}資訊</p>
            </div>
        `;
        return;
    }
    
    state.infoItems[type].forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'info-item';
        
        let content = '';
        
        switch(type) {
            case 'flight':
                content = `
                    <div class="info-field">
                        <strong>航班編號:</strong>
                        <span>${item.flightNumber || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>出發機場:</strong>
                        <span>${item.departureAirport || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>抵達機場:</strong>
                        <span>${item.arrivalAirport || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>起飛時間:</strong>
                        <span>${item.departureTime || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>到達時間:</strong>
                        <span>${item.arrivalTime || '未指定'}</span>
                    </div>
                `;
                break;
            case 'hotel':
                content = `
                    <div class="info-field">
                        <strong>酒店名稱:</strong>
                        <span>${item.hotelName || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>地址:</strong>
                        <span>${item.address || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>入住時間:</strong>
                        <span>${item.checkInTime || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>退房時間:</strong>
                        <span>${item.checkOutTime || '未指定'}</span>
                    </div>
                `;
                break;
            case 'car':
                content = `
                    <div class="info-field">
                        <strong>租車公司:</strong>
                        <span>${item.rentalCompany || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>取車時間:</strong>
                        <span>${item.pickUpTime || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>還車時間:</strong>
                        <span>${item.returnTime || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>取車地點:</strong>
                        <span>${item.pickUpLocation || '未指定'}</span>
                    </div>
                    <div class="info-field">
                        <strong>還車地點:</strong>
                        <span>${item.returnLocation || '未指定'}</span>
                    </div>
                `;
                break;
            case 'other':
                content = `
                    <div class="info-field">
                        <strong>${item.title || '標題'}:</strong>
                        <span>${item.details || '未指定'}</span>
                    </div>
                `;
                break;
        }
        
        content += `
            ${item.notes ? `<div class="info-notes">${item.notes}</div>` : ''}
            <div class="activity-actions" style="margin-top: 10px;">
                <button class="btn-icon edit-info" title="編輯">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete delete-info" title="刪除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        itemElement.innerHTML = content;
        
        // 添加編輯和刪除事件監聽器
        const editBtn = itemElement.querySelector('.edit-info');
        const deleteBtn = itemElement.querySelector('.delete-info');
        
        editBtn.addEventListener('click', () => editInfoItem(type, item.id));
        deleteBtn.addEventListener('click', () => deleteInfoItem(type, item.id));
        
        container.appendChild(itemElement);
    });
}

// 獲取資訊類型圖標
function getInfoIcon(type) {
    const icons = {
        'flight': 'plane',
        'hotel': 'hotel',
        'car': 'car',
        'other': 'sticky-note'
    };
    
    return icons[type] || 'info-circle';
}

// 獲取資訊類型名稱
function getInfoTypeName(type) {
    const names = {
        'flight': '航班',
        'hotel': '酒店',
        'car': '租車',
        'other': '其他'
    };
    
    return names[type] || type;
}

// 行程拖放功能
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
    
    if (draggedItem && draggedItem !== this) {
        const draggedId = parseInt(draggedItem.getAttribute('data-id'));
        const targetId = parseInt(this.getAttribute('data-id'));
        
        const draggedIndex = state.itinerary.findIndex(item => item.id === draggedId);
        const targetIndex = state.itinerary.findIndex(item => item.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [removed] = state.itinerary.splice(draggedIndex, 1);
            state.itinerary.splice(targetIndex, 0, removed);
            
            saveToLocalStorage();
            renderItinerary(); // Re-rendering is the simplest way to ensure all data is correct. We'll re-attach listeners.
            
            console.log('活動重新排序完成');
        }
    }
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
}
function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// 本地存儲功能
function saveToLocalStorage() {
    try {
        const appData = {
            tripTitle: document.getElementById('trip-title') ? document.getElementById('trip-title').textContent : '我的泰國之旅',
            itinerary: state.itinerary,
            diaryEntries: state.diaryEntries,
            budgetItems: state.budgetItems,
            infoItems: state.infoItems
        };
        
        localStorage.setItem('travelAppData', JSON.stringify(appData));
        console.log('數據已保存到本地存儲');
    } catch (error) {
        console.error('保存到本地存儲時出錯:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('travelAppData');
        
        if (savedData) {
            const appData = JSON.parse(savedData);
            const titleElement = document.getElementById('trip-title');
            
            if (titleElement && appData.tripTitle) {
                titleElement.textContent = appData.tripTitle;
            }
            
            state.itinerary = appData.itinerary || [];
            state.diaryEntries = appData.diaryEntries || [];
            state.budgetItems = appData.budgetItems || [];
            state.infoItems = appData.infoItems || {
                flight: [],
                hotel: [],
                car: [],
                other: []
            };
            
            console.log('從本地存儲加載數據成功');
        } else {
            console.log('本地存儲中沒有找到數據，使用默認空狀態');
            resetToEmptyState();
        }
    } catch (error) {
        console.error('從本地存儲加載數據時出錯:', error);
        resetToEmptyState();
    }
}

// 重置為空狀態
function resetToEmptyState() {
    state.itinerary = [];
    state.diaryEntries = [];
    state.budgetItems = [];
    state.infoItems = {
        flight: [],
        hotel: [],
        car: [],
        other: []
    };
}

// 更新天氣和匯率
function updateWeatherAndExchange() {
    console.log('更新天氣和匯率...');
    
    try {
        // 模擬匯率數據
        const mockExchangeRate = (4.5 + Math.random() * 0.2 - 0.1).toFixed(2);
        const exchangeElement = document.getElementById('exchange-rate');
        if (exchangeElement) {
            exchangeElement.textContent = `1 港幣 = ${mockExchangeRate} 泰銖`;
        }
        
        // 模擬天氣數據
        const temperatures = [30, 31, 32, 33, 34];
        const weatherConditions = ['晴朗', '多雲', '陰天', '小雨'];
        const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        const weatherElement = document.getElementById('weather-info');
        if (weatherElement) {
            weatherElement.textContent = `曼谷: ${randomTemp}°C, ${randomWeather}`;
        }
        
        // 根據條件更新天氣圖標
        const weatherIcon = document.querySelector('.widget:nth-child(3) i');
        if (weatherIcon) {
            if (randomWeather.includes('雨')) {
                weatherIcon.className = 'fas fa-cloud-rain';
            } else if (randomWeather.includes('雲')) {
                weatherIcon.className = 'fas fa-cloud';
            } else {
                weatherIcon.className = 'fas fa-sun';
            }
        }
        
        console.log('天氣和匯率更新完成');
    } catch (error) {
        console.error('更新天氣和匯率時出錯:', error);
    }
}

// 更新旅程倒數計時
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    if (state.itinerary.length === 0) {
        countdownElement.textContent = '旅程倒數: -- 天';
        return;
    }
    
    // 找出最早的活動日期
    let earliestDate = null;
    state.itinerary.forEach(activity => {
        const activityDate = new Date(activity.date);
        if (!earliestDate || activityDate < earliestDate) {
            earliestDate = activityDate;
        }
    });
    
    if (!earliestDate) {
        countdownElement.textContent = '旅程倒數: -- 天';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    earliestDate.setHours(0, 0, 0, 0);
    
    const timeDiff = earliestDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 0) {
        countdownElement.textContent = `旅程倒數: ${daysDiff} 天`;
    } else if (daysDiff === 0) {
        countdownElement.textContent = '旅程今天開始！';
    } else {
        countdownElement.textContent = '旅程已開始';
    }
    
    console.log('倒數計時更新完成:', daysDiff, '天');
}

// 定期更新天氣和匯率
setInterval(updateWeatherAndExchange, 300000); // 每5分鐘更新一次
setInterval(updateCountdown, 86400000); // 每天更新一次倒數計時

// 全局錯誤處理
window.addEventListener('error', function(e) {
    console.error('全局錯誤:', e.error);
    console.error('錯誤訊息:', e.message);
    console.error('錯誤位置:', e.filename, ':', e.lineno, ':', e.colno);
});

// 確保所有功能在頁面加載後可用
console.log('應用程式腳本加載完成');
