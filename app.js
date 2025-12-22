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

let updateTimer = null;
function startUpdatePolling() {
    if (updateTimer) return; // 防止重複啟動
    updateTimer = setInterval(checkForUpdates, 15000);
    setTimeout(checkForUpdates, 1000); // 立刻先檢查一次
}

function joinSharedBin(binId) {
    state.sharedBinId = binId;
    localStorage.setItem('sharedBinId', binId);
    startUpdatePolling();
}

function leaveCollaboration() {
state.sharedBinId = null;
localStorage.removeItem('sharedBinId');
if (updateTimer) { clearInterval(updateTimer); updateTimer = null; }
}

const state = {
    currentPage: 'home-page',
    sharedBinId: null,
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

const JSONBIN_API_KEY = '$2a$10$Un291SU4uymEeemXfulDTeJrfd2hzdUVRLhUQlD69XvAM8es1E/1y';
function loadApp() {
    console.log("Google Maps loaded. Now starting the main app...");
    initApp(); // This calls your existing initialization function
}

// 初始化應用程序
// 修改 initApp() 函數的結尾部分
// 修改 initApp() 函數的結尾部分
async function initApp() {
    console.log('初始化應用...');
    
    try {
        // Set default form dates
        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('activity-date')) {
            document.getElementById('activity-date').value = today;
        }
        if (document.getElementById('diary-date')) {
            document.getElementById('diary-date').value = today;
        }
        
        // AWAIT the result of loading from the URL
        const loadedFromCloud = await loadFromUrl(); // <-- 這行很重要！

        if (loadedFromCloud) {
            console.log('從雲端加載數據成功。合作模式已啟用。');
            // Don't disable anything, we want collaboration!
        } else {
            // If we didn't load from cloud, load from local storage
            console.log('未找到雲端數據，從本地存儲加載...');
            loadFromLocalStorage();
        }
        
        // Now render the data that was loaded (either from cloud or local)
        renderItinerary();
        renderDiaryEntries();
        renderBudgetItems();
        renderInfoItems();
        
        // Initialize everything else
        initEventListeners();
        showPage('home-page');
        initializeHeaderWidgets(); 
        
        console.log('應用初始化完成');
        
        // 確保定時器啟動
        if (state.sharedBinId) {
            console.log('協作模式已啟用，啟動定期更新檢查');
            // 立即檢查一次更新
            setTimeout(() => checkForUpdates(), 1000);
        }
        
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

        const shareTripBtn = document.getElementById('share-trip-btn');
        if (shareTripBtn) {
            shareTripBtn.addEventListener('click', generateShareLink);
        }

        const copyLinkBtn = document.getElementById('copy-link-btn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', copyShareLink);
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
            tripTitle.addEventListener('blur', saveData);
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
                initializeHeaderWidgets();
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
        
        saveData();
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
        
        saveData();
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
        
        saveData();
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

        saveData();
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
        saveData();
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
        saveData();
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
        saveData();
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
        saveData();
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
            
        // In app.js, inside the renderItinerary function
// REPLACE the old activityItem.innerHTML with this:

activityItem.innerHTML = `
    <!-- This new wrapper is the key to the main layout -->
    <div class="activity-content-wrapper">
        
        <!-- Left Column: All text details -->
        <div class="activity-details-column">
            <div class="activity-header">
                <span class="activity-time" style="background-color: ${typeDetails.color}20; color: ${typeDetails.color};">${activity.time}</span>
                <h4 class="activity-title">
                    <i class="${typeDetails.icon}" style="color: ${typeDetails.color};"></i>
                    <span>${activity.name}</span>
                </h4>
            </div>
            <div class="activity-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${activity.location || '未指定地點'}</span>
            </div>
             ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
        </div>

        <!-- Right Column: Action Buttons -->
        <div class="activity-actions">
            <button class="btn-icon edit-activity" title="編輯">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete delete-activity" title="刪除">
                <i class="fas fa-trash"></i>
            </button>
        </div>

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
            
            saveData();
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
// In app.js, REPLACE the old saveToLocalStorage function

function saveData() {
  // 先保存到本地存儲
  saveToLocalStorage();
  
  // 如果在協作模式，也保存到雲端
  if (state.sharedBinId) {
    saveToCloud();
  }
}

// This is the original function, now just for local use.
// **Its name is saveToLocalStorage, NOT saveData**
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

// REPLACE your old loadFromLocalStorage function with this one.

function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem('travelAppData');
    
    if (savedData) {
      const appData = JSON.parse(savedData);
      
      // Get the title element
      const titleElement = document.getElementById('trip-title');
      if (titleElement && appData.tripTitle) {
        titleElement.textContent = appData.tripTitle;
      }
      
      // *** THIS IS THE CRITICAL FIX ***
      // Update the global 'state' object with the loaded data.
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
      // No need to call resetToEmptyState() here, it's already empty by default.
    }
  } catch (error) {
    console.error('從本地存儲加載數據時出錯:', error);
    resetToEmptyState(); // On error, we should clear everything.
  }
}
// In app.js, add this new helper function

function uint8ArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// In app.js, REPLACE the existing generateShareLink function

// In app.js, REPLACE the old generateShareLink function with this

async function generateShareLink() {
    const shareBtn = document.getElementById('share-trip-btn');
    if (!shareBtn) return;

    const originalIcon = shareBtn.innerHTML;
    shareBtn.innerHTML = '';
    shareBtn.disabled = true;

    const dataToShare = {
        tripTitle: document.getElementById('trip-title')?.textContent || '我的泰國之旅',
        itinerary: state.itinerary,
        diaryEntries: state.diaryEntries,
        budgetItems: state.budgetItems,
        infoItems: state.infoItems
    };

    try {
    const response = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_API_KEY,
    'X-Bin-Private': 'false'
    },
    body: JSON.stringify(dataToShare)
    });

    if (!response.ok) throw new Error('Failed to save data to cloud.');

    const result = await response.json();
    const binId = result.metadata.id;

    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?trip=${binId}`;
    try { history.replaceState(null, '', shareUrl); } catch (_) {}

    joinSharedBin(binId);
    console.log('已切換到協作模式，將定期檢查更新');

    const shareInput = document.getElementById('share-link-input');
    if (shareInput) {
    shareInput.value = shareUrl;
    showModal('share-modal');
    shareInput.select();
    }
    } catch (error) {
    console.error('Share link generation failed:', error);
    alert('無法生成分享連結，請檢查您的網絡或API密鑰。');
    } finally {
    shareBtn.innerHTML = originalIcon;
    shareBtn.disabled = false;
    }
}


function copyShareLink() {
    const shareInput = document.getElementById('share-link-input');
    if (shareInput) {
        navigator.clipboard.writeText(shareInput.value).then(() => {
            const copyBtn = document.getElementById('copy-link-btn');
            copyBtn.textContent = '已複製!';
            setTimeout(() => {
                copyBtn.textContent = '複製';
                closeAllModals();
            }, 2000);
        }).catch(err => {
            console.error('複製失敗:', err);
            alert('複製連結失敗。');
        });
    }
}


async function loadFromUrl() {
const params = new URLSearchParams(window.location.search);
let binId = params.get('trip');

// If URL has no ?trip=, try last shared bin from localStorage and patch the URL
if (!binId) {
const stored = localStorage.getItem('sharedBinId');
if (stored) {
binId = stored;
const baseUrl = window.location.href.split('?')[0];
try { history.replaceState(null, '', `${baseUrl}?trip=${stored}`); } catch (_) {}
} else {
console.log('URL中沒有行程ID，將從本地存儲加載');
return false;
}
}

console.log('從URL/本地記錄檢測到行程ID:', binId);

try {
// Cache-buster to avoid stale responses
const resp = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest?t=${Date.now()}`);
if (!resp.ok) {
if (resp.status === 404) {
console.log('找不到雲端數據，可能已被刪除或權限問題');
} else {
console.error('獲取雲端數據失敗，狀態碼:', resp.status);
}
// Clear collaboration state on failure
state.sharedBinId = null;
localStorage.removeItem('sharedBinId');
return false;
}

const data = await resp.json();
const record = data.record || {};

// Update UI and state
const titleEl = document.getElementById('trip-title');
if (titleEl) titleEl.textContent = record.tripTitle || '我的泰國之旅';

state.itinerary = Array.isArray(record.itinerary) ? record.itinerary : [];
state.diaryEntries = Array.isArray(record.diaryEntries) ? record.diaryEntries : [];
state.budgetItems = Array.isArray(record.budgetItems) ? record.budgetItems : [];
const info = record.infoItems || {};
state.infoItems = {
  flight: Array.isArray(info.flight) ? info.flight : [],
  hotel: Array.isArray(info.hotel) ? info.hotel : [],
  car: Array.isArray(info.car) ? info.car : [],
  other: Array.isArray(info.other) ? info.other : []
};

// Join collaboration only after successful load
joinSharedBin(binId);

// Kick an immediate check once
setTimeout(() => { try { checkForUpdates(); } catch (_) {} }, 1000);

return true;
} catch (err) {
console.error('從URL加載數據失敗:', err);
state.sharedBinId = null;
localStorage.removeItem('sharedBinId');
return false;
}
}

// In app.js, ADD THIS NEW FUNCTION to check for updates

async function checkForUpdates() {
    if (!state.sharedBinId) {
        console.log('沒有 sharedBinId，跳過檢查更新');
        return;
    }

    try {
        console.log('正在檢查雲端更新...', state.sharedBinId);
        
        // 添加緩存避免頻繁請求
        const cacheBuster = Date.now();
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${state.sharedBinId}/latest?t=${cacheBuster}`);
        
        if (!resp.ok) {
            console.log('獲取雲端數據失敗，狀態碼:', resp.status);
            return;
        }

        const data = await resp.json();
        const record = data.record || {};

        // 轉換為可比較的字符串
        const currentString = JSON.stringify({
            tripTitle: document.getElementById('trip-title')?.textContent || '我的泰國之旅',
            itinerary: state.itinerary,
            diaryEntries: state.diaryEntries,
            budgetItems: state.budgetItems,
            infoItems: state.infoItems
        });
        
        const recordString = JSON.stringify(record);

        if (currentString !== recordString) {
            console.log('檢測到雲端更新，正在同步...');
            
            // 顯示更新通知
            showUpdateNotification();
            
            // 更新本地數據
            const titleEl = document.getElementById('trip-title');
            if (titleEl) titleEl.textContent = record.tripTitle || '我的泰國之旅';

            state.itinerary = record.itinerary || [];
            state.diaryEntries = record.diaryEntries || [];
            state.budgetItems = record.budgetItems || [];
            state.infoItems = record.infoItems || { flight: [], hotel: [], car: [], other: [] };

            // 重新渲染所有頁面
            renderItinerary();
            renderDiaryEntries();
            renderBudgetItems();
            renderInfoItems();
            
            // 更新地圖標記
            if (state.currentPage === 'map-page' && state.mapInitialized) {
                updateMapMarkers();
            }
            
            // 更新小工具
            updateCountdown();
            
            logCurrentState('更新後');
        } else {
            console.log('沒有檢測到更新');
        }
    } catch (err) {
        console.error('檢查更新時出錯:', err);
    }
}

// 添加深度比較函數
function deepEqual(obj1, obj2) {
    // 如果兩者是同一個對象，直接返回 true
    if (obj1 === obj2) return true;
    
    // 如果其中一個是 null 或不是對象，則返回 false
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    
    // 獲取鍵值
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // 如果鍵的數量不同，返回 false
    if (keys1.length !== keys2.length) return false;
    
    // 檢查每個鍵
    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        
        const val1 = obj1[key];
        const val2 = obj2[key];
        
        // 如果是數組，特殊處理
        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val1.length !== val2.length) return false;
            for (let i = 0; i < val1.length; i++) {
                if (!deepEqual(val1[i], val2[i])) return false;
            }
        } else if (typeof val1 === 'object' && typeof val2 === 'object') {
            // 遞歸比較對象
            if (!deepEqual(val1, val2)) return false;
        } else {
            // 比較基本類型
            if (val1 !== val2) return false;
        }
    }
    
    return true;
}

// 添加更新通知函數（可選）
function showUpdateNotification() {
  // 創建一個臨時通知
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: #38a169; color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 9999; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-sync-alt"></i>
      <span>行程已更新！</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 3秒後自動消失
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 重置為空狀態
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

// Update exchange (real Frankfurter API)
// In app.js, at the bottom of the file

// Update exchange (real Frankfurter API)
async function updateExchangeRate() {
   const exchangeElement = document.getElementById('exchange-rate');
   if (!exchangeElement) return;
   try {
       const response = await fetch('https://api.frankfurter.app/latest?from=HKD&to=THB');
       if (!response.ok) throw new Error('Network response was not ok');
       const data = await response.json();
       const rate = data.rates.THB;
       exchangeElement.textContent = `1 港幣 = ${rate.toFixed(3)} 泰銖`;
   } catch (error) {
       console.error('Exchange error:', error);
       exchangeElement.textContent = '匯率載入失敗';
   }
}

// Update weather (real Open-Meteo)
async function updateWeather() {
   const weatherElement = document.getElementById('weather-info');
   if (!weatherElement) return;
   try {
       const url = 'https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current=temperature_2m,weather_code&timezone=Asia/Bangkok';
       const response = await fetch(url);
       if (!response.ok) throw new Error('Network response was not ok');
       const data = await response.json();
       const temp = data.current.temperature_2m;
       const code = data.current.weather_code;
       let icon = '☀️'; // Default
       if (code >= 51 && code <= 67) icon = '🌧️'; // Rain
       if (code >= 1 && code <= 3) icon = '🌤️'; // Cloudy
       if (code >= 95) icon = '⛈️'; // Thunderstorm
       weatherElement.textContent = `曼谷: ${temp}°C, ${icon}`;
   } catch (error) {
       console.error('Weather error:', error);
       weatherElement.textContent = '天氣載入失敗';
   }
}

// Update countdown
// PASTE THIS ENTIRE BLOCK AT THE END OF YOUR FILE:

// Update countdown
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    if (state.itinerary.length === 0) {
        countdownElement.textContent = '旅程倒數: -- 天';
        return;
    }

    let earliestDateString = null;
    state.itinerary.forEach(activity => {
        if (!earliestDateString || activity.date < earliestDateString) {
            earliestDateString = activity.date;
        }
    });

    if (!earliestDateString) {
        countdownElement.textContent = '旅程倒數: -- 天';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const tripStartDate = new Date(earliestDateString + 'T00:00:00');

    const timeDiff = tripStartDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff > 0) {
        countdownElement.textContent = `旅程倒數: ${daysDiff} 天`;
    } else if (daysDiff === 0) {
        countdownElement.textContent = '旅程今天開始！';
    } else {
        countdownElement.textContent = '旅程已開始';
    }
}
async function saveToCloud() {
    if (!state.sharedBinId) return;

    console.log('正在保存更改到雲端...', state.sharedBinId);
    
    const dataToSave = {
        tripTitle: document.getElementById('trip-title')?.textContent || '我的泰國之旅',
        itinerary: state.itinerary,
        diaryEntries: state.diaryEntries,
        budgetItems: state.budgetItems,
        infoItems: state.infoItems
    };

    console.log('要保存的數據:', dataToSave);

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${state.sharedBinId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Private': 'false',
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
            console.error('雲端保存失敗，狀態碼:', response.status);
            const errorText = await response.text();
            console.error('錯誤詳情:', errorText);
            throw new Error('無法將更改保存到雲端。');
        }

        console.log('雲端保存成功！');
        logCurrentState('雲端保存後');

    } catch (error) {
        console.error('保存到雲端時出錯:', error);
    }
}

// Combined update function (RENAMED)
async function initializeHeaderWidgets() {
    await updateExchangeRate();
    await updateWeather();
    updateCountdown();
}

// Auto refresh every 5 minutes
setInterval(initializeHeaderWidgets, 300000); // 5 minutes

// Global error handler
window.addEventListener('error', function(e) {
    console.error('全局錯誤:', e.error);
    console.error('錯誤訊息:', e.message);
    console.error('錯誤位置:', e.filename, ':', e.lineno, ':', e.colno);
});

// 修改 logCurrentState 函數
function logCurrentState(message = '') {
    console.log(`=== 當前應用狀態 ${message} ===`);
    console.log('sharedBinId:', state.sharedBinId);
    console.log('行程項目數:', state.itinerary.length);
    console.log('日記條目數:', state.diaryEntries.length);
    console.log('預算項目數:', state.budgetItems.length);
    console.log('========================');
}

// 然後在關鍵位置調用它：
// 在 saveData() 函數末尾添加：
logCurrentState('保存後');

// 在 checkForUpdates() 檢測到更新時添加：
logCurrentState('同步後');

// Confirm script has loaded
console.log('應用程式腳本加載完成');

// Check for new cloud updates every 15 seconds
setInterval(checkForUpdates, 15000); 
