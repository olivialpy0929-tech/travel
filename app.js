// 應用程序狀態
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
    colors: ['#4a6cf7', '#38a169', '#ed8936', '#9f7aea', '#f56565', '#4299e1']
};

// 初始化應用程序
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadSampleData();
    initEventListeners();
    // 延遲初始化地圖，直到需要時
    if (document.getElementById('map-page').classList.contains('active')) {
        initMap();
    }
});

// 初始化應用程序
function initApp() {
    // 設置表單的默認日期為今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    document.getElementById('diary-date').value = today;
    
    // 從本地存儲加載數據
    loadFromLocalStorage();
    
    // 渲染初始數據
    renderItinerary();
    renderDiaryEntries();
    renderBudgetItems();
    renderInfoItems();
}

// 加載示例數據
function loadSampleData() {
    // 只有在沒有保存數據時才加載示例數據
    if (state.itinerary.length === 0) {
        state.itinerary = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                name: '參觀大皇宮',
                location: '曼谷, 泰國',
                notes: '曼谷必看景點。YouTube: https://youtu.be/sample1'
            },
            {
                id: 2,
                date: new Date().toISOString().split('T')[0],
                time: '13:00',
                name: '街邊美食市場午餐',
                location: '曼谷唐人街',
                notes: '嘗試著名的泰式炒河粉和芒果糯米飯'
            },
            {
                id: 3,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '10:00',
                name: '參觀鄭王廟',
                location: '曼谷, 泰國',
                notes: '黎明寺。最好在早上參觀。'
            },
            {
                id: 4,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '15:00',
                name: 'MBK購物中心購物',
                location: 'Pathum Wan, 曼谷',
                notes: '購買紀念品和電子產品的好地方'
            }
        ];
    }
    
    if (state.diaryEntries.length === 0) {
        state.diaryEntries = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                title: '曼谷第一天',
                content: '今天抵達曼谷！航班順利，酒店很漂亮。迫不及待想明天探索這座城市。',
                image: 'https://images.unsplash.com/photo-1552465011-b4e30bf7349d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
            }
        ];
    }
    
    if (state.budgetItems.length === 0) {
        state.budgetItems = [
            {
                id: 1,
                category: 'food',
                description: '餐廳晚餐',
                amount: 1200,
                payment: 'credit-card',
                notes: '精緻用餐體驗'
            },
            {
                id: 2,
                category: 'shopping',
                description: '紀念品',
                amount: 2500,
                payment: 'cash',
                notes: '給家人的禮物'
            },
            {
                id: 3,
                category: 'transport',
                description: '計程車費',
                amount: 800,
                payment: 'cash',
                notes: '市內交通'
            },
            {
                id: 4,
                category: 'leisure',
                description: '水療護理',
                amount: 1500,
                payment: 'credit-card',
                notes: '傳統泰式按摩'
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
                notes: '從香港到曼谷的直飛航班'
            }
        ];
    }
    
    if (state.infoItems.hotel.length === 0) {
        state.infoItems.hotel = [
            {
                id: 1,
                address: '123 Sukhumvit Road, 曼谷',
                checkInTime: '14:00',
                checkOutTime: '12:00',
                notes: '包含早餐'
            }
        ];
    }
    
    if (state.infoItems.car.length === 0) {
        state.infoItems.car = [
            {
                id: 1,
                pickUpTime: '11:00',
                returnTime: '19:00',
                pickUpLocation: 'BKK 機場',
                returnLocation: 'Siam Paragon',
                notes: '豐田Yaris或同級車'
            }
        ];
    }
    
    saveToLocalStorage();
}

// 初始化事件監聽器
function initEventListeners() {
    // 導航按鈕 - 修復的問題：現在能正確切換頁面
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // 添加按鈕
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
    
    // 表單提交
    document.getElementById('activity-form').addEventListener('submit', addActivity);
    document.getElementById('diary-form').addEventListener('submit', addDiaryEntry);
    document.getElementById('budget-form').addEventListener('submit', addBudgetItem);
    document.getElementById('info-form').addEventListener('submit', addInfoItem);
    
    // 關閉彈出視窗
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // 點擊彈出視窗外部關閉
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // 旅程標題編輯
    document.getElementById('trip-title').addEventListener('blur', function() {
        saveToLocalStorage();
    });
    
    // 資訊類型變更
    document.getElementById('info-type').addEventListener('change', function() {
        updateInfoFormFields(this.value);
    });
    
    // 顯示路線按鈕
    document.getElementById('show-route').addEventListener('click', showRouteOnMap);
}

// 顯示頁面 - 修復的導航功能
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示選定的頁面
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // 更新導航按鈕狀態
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            }
        });
        
        // 更新當前頁面狀態
        state.currentPage = pageId;
        
        // 如果是地圖頁面，初始化地圖（如果尚未初始化）
        if (pageId === 'map-page' && !state.mapInitialized) {
            initMap();
        }
        
        // 如果是地圖頁面，更新標記
        if (pageId === 'map-page' && state.mapInitialized) {
            updateMapMarkers();
        }
    }
}

// 初始化地圖
function initMap() {
    // 檢查地圖容器是否存在
    if (!document.getElementById('map')) {
        console.error('地圖容器不存在');
        return;
    }
    
    try {
        // 曼谷座標
        const bangkokCoords = { lat: 13.7563, lng: 100.5018 };
        
        // 初始化地圖
        state.map = new google.maps.Map(document.getElementById('map'), {
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
        
        // 添加示例標記
        const locations = [
             ];
        
        locations.forEach(location => {
            const marker = new google.maps.Marker({
                position: location.coords,
                map: state.map,
                title: location.name
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${location.name}</b>`
            });
            
            marker.addListener('click', () => {
                infoWindow.open(state.map, marker);
            });
            
            state.mapMarkers.push(marker);
        });
        
        // 添加到地點列表
        const locationsList = document.getElementById('locations-list');
        locationsList.innerHTML = '';
        locations.forEach(location => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location.name}`;
            locationsList.appendChild(li);
        });
        
        // 更新租車地點顯示
        if (state.infoItems.car.length > 0) {
            const carInfo = state.infoItems.car[0];
            document.getElementById('pickup-location').textContent = carInfo.pickUpLocation;
            document.getElementById('return-location').textContent = carInfo.returnLocation;
        }
        
        console.log('地圖初始化成功');
    } catch (error) {
        console.error('初始化地圖時出錯:', error);
        // 如果Google Maps API加載失敗，顯示錯誤訊息
        document.getElementById('map').innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #f0f0f0; border-radius: 18px;">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; color: #718096; margin-bottom: 15px;"></i>
                    <h3>地圖無法加載</h3>
                    <p>請檢查您的Google Maps API密鑰</p>
                </div>
            </div>
        `;
    }
}

// 更新地圖標記
function updateMapMarkers() {
    if (!state.mapInitialized) return;
    
    // 清除現有標記
    state.mapMarkers.forEach(marker => {
        marker.setMap(null);
    });
    state.mapMarkers = [];
    
    // 從行程添加新標記
    state.itinerary.forEach(activity => {
        if (activity.location) {
            // 為演示生成曼谷附近的隨機座標
            const lat = 13.7563 + (Math.random() - 0.5) * 0.1;
            const lng = 100.5018 + (Math.random() - 0.5) * 0.1;
            
            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: state.map,
                title: activity.name,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${activity.name}</b><br>${activity.time}`
            });
            
            marker.addListener('click', () => {
                infoWindow.open(state.map, marker);
            });
            
            state.mapMarkers.push(marker);
        }
    });
    
    // 添加租車地點
    if (state.infoItems.car.length > 0) {
        const carInfo = state.infoItems.car[0];
        
        // 取車地點標記
        const pickupMarker = new google.maps.Marker({
            position: { lat: 13.6811, lng: 100.7471 },
            map: state.map,
            title: `取車: ${carInfo.pickUpLocation}`,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }
        });
        
        const pickupInfoWindow = new google.maps.InfoWindow({
            content: `<b>取車地點</b><br>${carInfo.pickUpLocation}`
        });
        
        pickupMarker.addListener('click', () => {
            pickupInfoWindow.open(state.map, pickupMarker);
        });
        
        state.mapMarkers.push(pickupMarker);
        
        // 還車地點標記
        const returnMarker = new google.maps.Marker({
            position: { lat: 13.7462, lng: 100.5347 },
            map: state.map,
            title: `還車: ${carInfo.returnLocation}`,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
        });
        
        const returnInfoWindow = new google.maps.InfoWindow({
            content: `<b>還車地點</b><br>${carInfo.returnLocation}`
        });
        
        returnMarker.addListener('click', () => {
            returnInfoWindow.open(state.map, returnMarker);
        });
        
        state.mapMarkers.push(returnMarker);
    }
}

// 在地圖上顯示路線
function showRouteOnMap() {
    if (!state.mapInitialized) return;
    
    // 為演示，顯示連接一些點的路線
    if (state.mapMarkers.length >= 2) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(state.map);
        
        const waypoints = [];
        
        // 添加行程中的地點作為途經點
        state.itinerary.forEach((activity, index) => {
            if (index > 0 && index < state.itinerary.length - 1 && activity.location) {
                // 為演示生成曼谷附近的隨機座標
                const lat = 13.7563 + (Math.random() - 0.5) * 0.1;
                const lng = 100.5018 + (Math.random() - 0.5) * 0.1;
                waypoints.push({
                    location: { lat, lng },
                    stopover: true
                });
            }
        });
        
        const request = {
            origin: { lat: 13.6811, lng: 100.7471 }, // BKK機場
            destination: { lat: 13.7462, lng: 100.5347 }, // Siam Paragon
            waypoints: waypoints,
            travelMode: 'DRIVING'
        };
        
        directionsService.route(request, function(result, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                
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
            } else {
                console.error('路線請求失敗:', status);
                // 如果API請求失敗，使用模擬數據
                document.getElementById('total-travel-time').textContent = '總時間: 1小時 15分鐘';
            }
        });
    }
}

// 顯示彈出視窗
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
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
    formFields.innerHTML = '';
    
    let fields = [];
    
    switch(type) {
        case 'flight':
            fields = [
                {id: 'flight-number', label: '航班編號', type: 'text'},
                {id: 'departure-time', label: '起飛時間', type: 'time'},
                {id: 'arrival-time', label: '到達時間', type: 'time'}
            ];
            document.getElementById('info-modal-title').textContent = '添加航班資訊';
            break;
        case 'hotel':
            fields = [
                {id: 'hotel-address', label: '酒店地址', type: 'text'},
                {id: 'check-in-time', label: '入住時間', type: 'time'},
                {id: 'check-out-time', label: '退房時間', type: 'time'}
            ];
            document.getElementById('info-modal-title').textContent = '添加酒店資訊';
            break;
        case 'car':
            fields = [
                {id: 'pick-up-time', label: '取車時間', type: 'time'},
                {id: 'return-time', label: '還車時間', type: 'time'},
                {id: 'pick-up-location', label: '取車地點', type: 'text'},
                {id: 'return-location', label: '還車地點', type: 'text'}
            ];
            document.getElementById('info-modal-title').textContent = '添加租車資訊';
            break;
        case 'other':
            fields = [
                {id: 'other-title', label: '標題', type: 'text'},
                {id: 'other-details', label: '詳細資訊', type: 'text'}
            ];
            document.getElementById('info-modal-title').textContent = '添加其他資訊';
            break;
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

// 關閉所有彈出視窗
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // 重置表單
    document.getElementById('activity-form').reset();
    document.getElementById('diary-form').reset();
    document.getElementById('budget-form').reset();
    document.getElementById('info-form').reset();
    
    // 設置默認日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    document.getElementById('diary-date').value = today;
}

// 添加活動到行程
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
    
    // 如果在地圖頁面，更新標記
    if (state.currentPage === 'map-page' && state.mapInitialized) {
        updateMapMarkers();
    }
}

// 添加日記條目
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

// 添加預算項目
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

// 添加資訊項目
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
    
    // 更新地圖上的租車地點
    if (type === 'car') {
        document.getElementById('pickup-location').textContent = item.pickUpLocation;
        document.getElementById('return-location').textContent = item.returnLocation;
        
        if (state.currentPage === 'map-page' && state.mapInitialized) {
            updateMapMarkers();
        }
    }
    
    saveToLocalStorage();
    renderInfoItems();
    closeAllModals();
}

// 編輯活動
function editActivity(id) {
    const activity = state.itinerary.find(item => item.id === id);
    if (!activity) return;
    
    // 預填表單
    document.getElementById('activity-date').value = activity.date;
    document.getElementById('activity-time').value = activity.time;
    document.getElementById('activity-name').value = activity.name;
    document.getElementById('activity-location').value = activity.location;
    document.getElementById('activity-notes').value = activity.notes;
    
    // 移除舊活動
    state.itinerary = state.itinerary.filter(item => item.id !== id);
    
    // 顯示編輯彈出視窗
    showModal('activity-modal');
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
    }
}

// 編輯日記條目
function editDiaryEntry(id) {
    const entry = state.diaryEntries.find(item => item.id === id);
    if (!entry) return;
    
    // 預填表單
    document.getElementById('diary-date').value = entry.date;
    document.getElementById('diary-title').value = entry.title;
    document.getElementById('diary-content').value = entry.content;
    document.getElementById('diary-image').value = entry.image;
    
    // 移除舊條目
    state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
    
    // 顯示編輯彈出視窗
    showModal('diary-modal');
}

// 刪除日記條目
function deleteDiaryEntry(id) {
    if (confirm('您確定要刪除此日記條目嗎？')) {
        state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
        saveToLocalStorage();
        renderDiaryEntries();
    }
}

// 編輯預算項目
function editBudgetItem(id) {
    const item = state.budgetItems.find(budget => budget.id === id);
    if (!item) return;
    
    // 預填表單
    document.getElementById('budget-category').value = item.category;
    document.getElementById('budget-description').value = item.description;
    document.getElementById('budget-amount').value = item.amount;
    document.getElementById('budget-payment').value = item.payment;
    document.getElementById('budget-notes').value = item.notes;
    
    // 移除舊項目
    state.budgetItems = state.budgetItems.filter(budget => budget.id !== id);
    
    // 顯示編輯彈出視窗
    showModal('budget-modal');
}

// 刪除預算項目
function deleteBudgetItem(id) {
    if (confirm('您確定要刪除此預算項目嗎？')) {
        state.budgetItems = state.budgetItems.filter(item => item.id !== id);
        saveToLocalStorage();
        renderBudgetItems();
    }
}

// 編輯資訊項目
function editInfoItem(type, id) {
    const item = state.infoItems[type].find(info => info.id === id);
    if (!item) return;
    
    // 顯示適當類型的彈出視窗
    showInfoModal(type);
    
    // 根據類型預填表單
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
        
        // 移除舊項目
        state.infoItems[type] = state.infoItems[type].filter(info => info.id !== id);
    }, 100);
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
    }
}

// 渲染行程
function renderItinerary() {
    const container = document.querySelector('.itinerary-container');
    if (!container) return;
    
    container.innerHTML = '';
    
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
                <i class="fas fa-calendar-day" style="color: ${state.colors[index % state.colors.length]}"></i>
                <span>第 ${index + 1} 天</span>
            </div>
            <div class="day-date">${formattedDate}</div>
        `;
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
            
            // 添加拖放事件監聽器
            activityItem.addEventListener('dragstart', handleDragStart);
            activityItem.addEventListener('dragover', handleDragOver);
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
}

// 渲染日記條目
function renderDiaryEntries() {
    const container = document.querySelector('.diary-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.diaryEntries.forEach(entry => {
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
}

// 渲染預算項目
function renderBudgetItems() {
    const container = document.querySelector('.budget-container');
    if (!container) return;
    
    container.innerHTML = '';
    
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
    const totalBudget = 15800;
    const remaining = totalBudget - totalSpent;
    
    const spentElement = document.querySelector('.amount.spent');
    const remainingElement = document.querySelector('.amount.remaining');
    
    if (spentElement) spentElement.textContent = `฿${totalSpent.toLocaleString()}`;
    if (remainingElement) remainingElement.textContent = `฿${remaining.toLocaleString()}`;
}

// 獲取類別名稱
function getCategoryName(category) {
    const categories = {
        'food': '飲食',
        'shopping': '購物',
        'leisure': '娛樂',
        'transport': '交通',
        'accommodation': '住宿',
        'other': '其他'
    };
    return categories[category] || category;
}

// 獲取支付方式名稱
function getPaymentName(payment) {
    const payments = {
        'credit-card': '信用卡',
        'cash': '現金',
        'debit-card': '轉帳卡',
        'e-wallet': '電子錢包'
    };
    return payments[payment] || payment;
}

// 渲染資訊項目
function renderInfoItems() {
    // 航班資訊
    const flightContainer = document.getElementById('flight-info');
    if (flightContainer) {
        flightContainer.innerHTML = '';
        
        state.infoItems.flight.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'info-item';
            
            itemElement.innerHTML = `
                <div class="info-field">
                    <strong>航班編號:</strong>
                    <span>${item.flightNumber}</span>
                </div>
                <div class="info-field">
                    <strong>起飛時間:</strong>
                    <span>${item.departureTime}</span>
                </div>
                <div class="info-field">
                    <strong>到達時間:</strong>
                    <span>${item.arrivalTime}</span>
                </div>
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
            
            // 添加編輯和刪除事件監聽器
            const editBtn = itemElement.querySelector('.edit-info');
            const deleteBtn = itemElement.querySelector('.delete-info');
            
            editBtn.addEventListener('click', () => editInfoItem('flight', item.id));
            deleteBtn.addEventListener('click', () => deleteInfoItem('flight', item.id));
            
            flightContainer.appendChild(itemElement);
        });
    }
    
    // 酒店資訊
    const hotelContainer = document.getElementById('hotel-info');
    if (hotelContainer) {
        hotelContainer.innerHTML = '';
        
        state.infoItems.hotel.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'info-item';
            
            itemElement.innerHTML = `
                <div class="info-field">
                    <strong>地址:</strong>
                    <span>${item.address}</span>
                </div>
                <div class="info-field">
                    <strong>入住時間:</strong>
                    <span>${item.checkInTime}</span>
                </div>
                <div class="info-field">
                    <strong>退房時間:</strong>
                    <span>${item.checkOutTime}</span>
                </div>
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
            
            // 添加編輯和刪除事件監聽器
            const editBtn = itemElement.querySelector('.edit-info');
            const deleteBtn = itemElement.querySelector('.delete-info');
            
            editBtn.addEventListener('click', () => editInfoItem('hotel', item.id));
            deleteBtn.addEventListener('click', () => deleteInfoItem('hotel', item.id));
            
            hotelContainer.appendChild(itemElement);
        });
    }
    
    // 租車資訊
    const carContainer = document.getElementById('car-info');
    if (carContainer) {
        carContainer.innerHTML = '';
        
        state.infoItems.car.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'info-item';
            
            itemElement.innerHTML = `
                <div class="info-field">
                    <strong>取車時間:</strong>
                    <span>${item.pickUpTime}</span>
                </div>
                <div class="info-field">
                    <strong>還車時間:</strong>
                    <span>${item.returnTime}</span>
                </div>
                <div class="info-field">
                    <strong>取車地點:</strong>
                    <span>${item.pickUpLocation}</span>
                </div>
                <div class="info-field">
                    <strong>還車地點:</strong>
                    <span>${item.returnLocation}</span>
                </div>
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
            
            // 添加編輯和刪除事件監聽器
            const editBtn = itemElement.querySelector('.edit-info');
            const deleteBtn = itemElement.querySelector('.delete-info');
            
            editBtn.addEventListener('click', () => editInfoItem('car', item.id));
            deleteBtn.addEventListener('click', () => deleteInfoItem('car', item.id));
            
            carContainer.appendChild(itemElement);
        });
    }
    
    // 其他資訊
    const otherContainer = document.getElementById('other-info');
    if (otherContainer) {
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
                    <button class="btn-icon edit-info" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete delete-info" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加編輯和刪除事件監聽器
            const editBtn = itemElement.querySelector('.edit-info');
            const deleteBtn = itemElement.querySelector('.delete-info');
            
            editBtn.addEventListener('click', () => editInfoItem('other', item.id));
            deleteBtn.addEventListener('click', () => deleteInfoItem('other', item.id));
            
            otherContainer.appendChild(itemElement);
        });
    }
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
    if (draggedItem !== this) {
        // 獲取拖動項目和放置目標的ID
        const draggedId = parseInt(draggedItem.getAttribute('data-id'));
        const targetId = parseInt(this.getAttribute('data-id'));
        
        // 查找項目在狀態中的索引
        const draggedIndex = state.itinerary.findIndex(item => item.id === draggedId);
        const targetIndex = state.itinerary.findIndex(item => item.id === targetId);
        
        // 重新排序數組
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [removed] = state.itinerary.splice(draggedIndex, 1);
            state.itinerary.splice(targetIndex, 0, removed);
            
            // 保存並重新渲染
            saveToLocalStorage();
            renderItinerary();
        }
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// 本地存儲功能
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
        
        const titleElement = document.getElementById('trip-title');
        if (titleElement) titleElement.textContent = appData.tripTitle || '我的旅程';
        
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

// 更新天氣和匯率（模擬API調用）
function updateWeatherAndExchange() {
    // 使用模擬數據模擬API調用
    const mockExchangeRate = (4.5 + Math.random() * 0.2 - 0.1).toFixed(2);
    const exchangeElement = document.getElementById('exchange-rate');
    if (exchangeElement) exchangeElement.textContent = `1 港幣 = ${mockExchangeRate} 泰銖`;
    
    const temperatures = [30, 31, 32, 33, 34];
    const weatherConditions = ['晴朗', '多雲', '陰天', '小雨'];
    const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    const weatherElement = document.getElementById('weather-info');
    if (weatherElement) weatherElement.textContent = `曼谷: ${randomTemp}°C, ${randomWeather}`;
    
    // 根據條件更新天氣圖標
    const weatherIcon = document.querySelector('.weather i');
    if (weatherIcon) {
        if (randomWeather.includes('雨')) {
            weatherIcon.className = 'fas fa-cloud-rain';
        } else if (randomWeather.includes('雲')) {
            weatherIcon.className = 'fas fa-cloud';
        } else {
            weatherIcon.className = 'fas fa-sun';
        }
    }
}

// 初始化天氣和匯率更新
setInterval(updateWeatherAndExchange, 30000); // 每30秒更新
updateWeatherAndExchange(); // 初始更新
