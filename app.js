// 應用程序狀態
const state = {
  currentPage: 'home-page',
  itinerary: [],
  diaryEntries: [],
  expenses: [],
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
  console.log('DOM載入完成，初始化應用...');
  initApp();
});

// 初始化應用程序
function initApp() {
  console.log('初始化應用...');
  
  // 確保所有頁面隱藏
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 設置表單的默認日期為今天
  const today = new Date().toISOString().split('T')[0];
  const activityDate = document.getElementById('activity-date');
  const diaryDate = document.getElementById('diary-date');
  
  if (activityDate) activityDate.value = today;
  if (diaryDate) diaryDate.value = today;
  
  // 從本地存儲加載數據
  loadFromLocalStorage();
  
  // 設置當前頁面
  showPage('home-page');
  
  // 初始化事件監聽器
  initEventListeners();
  
  // 更新天氣和匯率
  updateWeatherAndExchange();
  updateCountdown();
  
  console.log('應用初始化完成');
}

// 初始化事件監聽器
function initEventListeners() {
  console.log('初始化事件監聽器...');
  
  // 導航按鈕
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('導航按鈕點擊:', this.getAttribute('data-page'));
      const pageId = this.getAttribute('data-page');
      if (pageId) {
        showPage(pageId);
      }
    });
  });
  
  // 添加按鈕
  const addActivityBtn = document.getElementById('add-activity');
  const addDiaryBtn = document.getElementById('add-diary-entry');
  const addExpenseBtn = document.getElementById('add-budget-item');
  
  if (addActivityBtn) {
    addActivityBtn.addEventListener('click', () => {
      console.log('添加活動按鈕點擊');
      showModal('activity-modal');
    });
  }
  
  if (addDiaryBtn) {
    addDiaryBtn.addEventListener('click', () => {
      console.log('添加日記按鈕點擊');
      showModal('diary-modal');
    });
  }
  
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
      console.log('添加支出按鈕點擊');
      showModal('budget-modal');
    });
  }
  
  // 資訊按鈕
  document.querySelectorAll('.add-info-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      console.log('添加資訊按鈕點擊:', section);
      showInfoModal(section);
    });
  });
  
  // 表單提交
  const activityForm = document.getElementById('activity-form');
  const diaryForm = document.getElementById('diary-form');
  const expenseForm = document.getElementById('budget-form');
  const infoForm = document.getElementById('info-form');
  
  if (activityForm) {
    activityForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addActivity(e);
    });
  }
  
  if (diaryForm) {
    diaryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addDiaryEntry(e);
    });
  }
  
  if (expenseForm) {
    expenseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addExpense(e);
    });
  }
  
  if (infoForm) {
    infoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addInfoItem(e);
    });
  }
  
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
  const tripTitle = document.getElementById('trip-title');
  if (tripTitle) {
    tripTitle.addEventListener('blur', function() {
      saveToLocalStorage();
    });
  }
  
  // 資訊類型變更
  const infoType = document.getElementById('info-type');
  if (infoType) {
    infoType.addEventListener('change', function() {
      updateInfoFormFields(this.value);
    });
  }
  
  // 顯示路線按鈕
  const showRouteBtn = document.getElementById('show-route');
  if (showRouteBtn) {
    showRouteBtn.addEventListener('click', showRouteOnMap);
  }
  
  console.log('事件監聽器初始化完成');
}

// 顯示頁面
function showPage(pageId) {
  console.log('切換到頁面:', pageId);
  
  if (!pageId) {
    console.error('pageId 未定義');
    return;
  }
  
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
    
    // 頁面特定的初始化
    switch(pageId) {
      case 'home-page':
        renderItinerary();
        break;
      case 'map-page':
        console.log('初始化地圖頁面...');
        if (!state.mapInitialized) {
          setTimeout(() => {
            initMap();
          }, 100);
        } else {
          updateMapMarkers();
        }
        break;
      case 'diary-page':
        renderDiaryEntries();
        break;
      case 'budget-page':
        renderExpenses();
        break;
      case 'info-page':
        renderInfoItems();
        break;
    }
    
    console.log('頁面切換完成:', pageId);
  } else {
    console.error('頁面不存在:', pageId);
  }
}

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
    console.log('地圖初始化成功');
    
    // 添加固定的酒店和機場標記
    addFixedMapMarkers();
    
    // 更新其他標記
    updateMapMarkers();
    
  } catch (error) {
    console.error('初始化地圖時出錯:', error);
    mapContainer.innerHTML = `
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

// 添加固定的酒店和機場標記
function addFixedMapMarkers() {
  if (!state.mapInitialized) return;
  
  // 機場 (BKK)
  const airportMarker = new google.maps.Marker({
    position: { lat: 13.6811, lng: 100.7471 },
    map: state.map,
    title: '蘇凡納布機場 (BKK)',
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }
  });
  
  const airportInfoWindow = new google.maps.InfoWindow({
    content: `<b>蘇凡納布機場 (BKK)</b><br>主要國際機場`
  });
  
  airportMarker.addListener('click', () => {
    airportInfoWindow.open(state.map, airportMarker);
  });
  
  state.mapMarkers.push(airportMarker);
  
  // 酒店 (範例：曼谷文華東方酒店)
  const hotelMarker = new google.maps.Marker({
    position: { lat: 13.7229, lng: 100.5134 },
    map: state.map,
    title: '曼谷文華東方酒店',
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }
  });
  
  const hotelInfoWindow = new google.maps.InfoWindow({
    content: `<b>曼谷文華東方酒店</b><br>五星級酒店`
  });
  
  hotelMarker.addListener('click', () => {
    hotelInfoWindow.open(state.map, hotelMarker);
  });
  
  state.mapMarkers.push(hotelMarker);
  
  console.log('固定標記添加完成');
}

// 更新地圖標記
function updateMapMarkers() {
  if (!state.mapInitialized) return;
  
  console.log('更新地圖標記...');
  
  // 清除活動標記，但保留固定標記
  state.mapMarkers.forEach((marker, index) => {
    if (marker.getTitle() !== '蘇凡納布機場 (BKK)' && marker.getTitle() !== '曼谷文華東方酒店') {
      marker.setMap(null);
    }
  });
  
  // 保留固定標記
  state.mapMarkers = state.mapMarkers.filter(marker => 
    marker.getTitle() === '蘇凡納布機場 (BKK)' || marker.getTitle() === '曼谷文華東方酒店'
  );
  
  // 更新地點列表
  const locationsList = document.getElementById('locations-list');
  if (locationsList) {
    locationsList.innerHTML = '';
  }
  
  // 從行程添加標記
  const locations = [];
  state.itinerary.forEach(activity => {
    if (activity.location) {
      locations.push(activity.name);
      
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
  
  // 更新地點列表
  if (locationsList) {
    if (locations.length > 0) {
      locations.forEach(location => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location}`;
        locationsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = '尚未添加地點';
      locationsList.appendChild(li);
    }
  }
}

// 在地圖上顯示路線
function showRouteOnMap() {
  if (!state.mapInitialized) {
    alert('地圖尚未初始化，請稍候再試');
    return;
  }
  
  console.log('顯示路線...');
  
  if (state.itinerary.length < 2) {
    alert('請至少添加兩個活動來計算路線');
    return;
  }
  
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(state.map);
  
  const waypoints = [];
  
  // 添加活動地點作為途經點
  state.itinerary.slice(1, -1).forEach(activity => {
    if (activity.location) {
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
    travelMode: 'DRIVING',
    optimizeWaypoints: true
  };
  
  directionsService.route(request, function(result, status) {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
      console.log('路線顯示成功');
    } else {
      console.error('路線請求失敗:', status);
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
  
  console.log('關閉所有彈出視窗');
}

// 添加活動到行程
function addActivity(e) {
  e.preventDefault();
  console.log('添加活動...');
  
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
  
  // 更新地圖標記
  if (state.currentPage === 'map-page' && state.mapInitialized) {
    updateMapMarkers();
  }
  
  // 更新倒數計時
  updateCountdown();
  
  console.log('活動添加成功:', activity);
}

// 添加日記條目
function addDiaryEntry(e) {
  e.preventDefault();
  console.log('添加日記條目...');
  
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
  
  console.log('日記條目添加成功:', entry);
}

// 添加支出
function addExpense(e) {
  e.preventDefault();
  console.log('添加支出...');
  
  const expense = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    category: document.getElementById('budget-category').value,
    description: document.getElementById('budget-description').value,
    amount: parseInt(document.getElementById('budget-amount').value),
    payment: document.getElementById('budget-payment').value,
    notes: document.getElementById('budget-notes').value
  };
  
  state.expenses.push(expense);
  saveToLocalStorage();
  renderExpenses();
  closeAllModals();
  
  console.log('支出添加成功:', expense);
}

// 添加資訊項目
function addInfoItem(e) {
  e.preventDefault();
  console.log('添加資訊項目...');
  
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
    document.getElementById('pickup-location').textContent = item.pickUpLocation || '--';
    document.getElementById('return-location').textContent = item.returnLocation || '--';
    
    if (state.currentPage === 'map-page' && state.mapInitialized) {
      updateMapMarkers();
    }
  }
  
  saveToLocalStorage();
  renderInfoItems();
  closeAllModals();
  
  console.log('資訊項目添加成功:', item);
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
  
  // 預填表單
  document.getElementById('diary-date').value = entry.date;
  document.getElementById('diary-title').value = entry.title;
  document.getElementById('diary-content').value = entry.content;
  document.getElementById('diary-image').value = entry.image;
  
  // 移除舊條目
  state.diaryEntries = state.diaryEntries.filter(item => item.id !== id);
  
  // 顯示編輯彈出視窗
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

// 編輯支出
function editExpense(id) {
  const expense = state.expenses.find(item => item.id === id);
  if (!expense) return;
  
  // 預填表單
  document.getElementById('budget-category').value = expense.category;
  document.getElementById('budget-description').value = expense.description;
  document.getElementById('budget-amount').value = expense.amount;
  document.getElementById('budget-payment').value = expense.payment;
  document.getElementById('budget-notes').value = expense.notes;
  
  // 移除舊項目
  state.expenses = state.expenses.filter(item => item.id !== id);
  
  // 顯示編輯彈出視窗
  showModal('budget-modal');
  
  console.log('編輯支出:', id);
}

// 刪除支出
function deleteExpense(id) {
  if (confirm('您確定要刪除此支出項目嗎？')) {
    state.expenses = state.expenses.filter(item => item.id !== id);
    saveToLocalStorage();
    renderExpenses();
    
    console.log('刪除支出:', id);
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
  
  // 移除空狀態訊息
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
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
  
  console.log('行程渲染完成，共', state.itinerary.length, '個活動');
}

// 渲染日記條目
function renderDiaryEntries() {
  const container = document.querySelector('.diary-container');
  if (!container) return;
  
  // 移除空狀態訊息
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
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

// 渲染支出
function renderExpenses() {
  const container = document.querySelector('.budget-container');
  if (!container) return;
  
  // 移除空狀態訊息
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
  container.innerHTML = '';
  
  if (state.expenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-coins fa-3x"></i>
        <h3>尚未添加支出項目</h3>
        <p>開始記錄您的旅行消費</p>
      </div>
    `;
    
    // 更新總支出
    updateTotalExpenses();
    return;
  }
  
  // 按日期降序排序
  const sortedExpenses = [...state.expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  sortedExpenses.forEach(expense => {
    const itemElement = document.createElement('div');
    itemElement.className = 'budget-item';
    
    // 格式化金額
    const formattedAmount = `฿${expense.amount.toLocaleString()}`;
    
    itemElement.innerHTML = `
      <div class="budget-info">
        <div class="budget-category ${expense.category}">${getCategoryName(expense.category)}</div>
        <div class="budget-description">${expense.description}</div>
        <div class="budget-payment">
          <i class="fas fa-credit-card"></i>
          <span>${getPaymentName(expense.payment)}</span>
        </div>
        ${expense.notes ? `<div class="info-notes">${expense.notes}</div>` : ''}
      </div>
      <div style="display: flex; align-items: center;">
        <div class="budget-amount">${formattedAmount}</div>
        <div class="activity-actions">
          <button class="btn-icon edit-expense" title="編輯">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete delete-expense" title="刪除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    // 添加編輯和刪除事件監聽器
    const editBtn = itemElement.querySelector('.edit-expense');
    const deleteBtn = itemElement.querySelector('.delete-expense');
    
    editBtn.addEventListener('click', () => editExpense(expense.id));
    deleteBtn.addEventListener('click', () => deleteExpense(expense.id));
    
    container.appendChild(itemElement);
  });
  
  // 更新總支出
  updateTotalExpenses();
  
  console.log('支出渲染完成，共', state.expenses.length, '個項目');
}

// 更新總支出
function updateTotalExpenses() {
  let totalExpenses = 0;
  state.expenses.forEach(expense => {
    totalExpenses += expense.amount;
  });
  
  // 更新總支出顯示
  const totalExpensesElement = document.getElementById('total-expenses');
  const totalElement = document.querySelector('.budget-summary .amount');
  
  if (totalExpensesElement) {
    totalExpensesElement.textContent = `฿${totalExpenses.toLocaleString()}`;
  }
  
  if (totalElement) {
    totalElement.textContent = `฿${totalExpenses.toLocaleString()}`;
  }
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
  
  // 移除空狀態訊息
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }
  
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
        `;
        break;
      case 'hotel':
        content = `
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
        `;
        break;
      case 'car':
        content = `
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
        `;
        break;
      case 'other':
        content = `
          <div class="info-field">
            <strong>${item.title}:</strong>
            <span>${item.details}</span>
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
      
      console.log('活動重新排序完成');
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
    tripTitle: document.getElementById('trip-title')?.textContent || '我的泰國之旅 🐘',
    itinerary: state.itinerary,
    diaryEntries: state.diaryEntries,
    expenses: state.expenses,
    infoItems: state.infoItems
  };
  
  localStorage.setItem('travelAppData', JSON.stringify(appData));
  console.log('數據已保存到本地存儲');
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem('travelAppData');
  if (savedData) {
    try {
      const appData = JSON.parse(savedData);
      const titleElement = document.getElementById('trip-title');
      
      if (titleElement && appData.tripTitle) {
        titleElement.textContent = appData.tripTitle;
      }
      
      state.itinerary = appData.itinerary || [];
      state.diaryEntries = appData.diaryEntries || [];
      state.expenses = appData.expenses || appData.budgetItems || [];
      state.infoItems = appData.infoItems || {
        flight: [],
        hotel: [],
        car: [],
        other: []
      };
      
      console.log('從本地存儲加載數據成功');
      
      // 渲染數據
      renderItinerary();
      renderDiaryEntries();
      renderExpenses();
      renderInfoItems();
      
    } catch (error) {
      console.error('解析本地存儲數據時出錯:', error);
      resetToEmptyState();
    }
  } else {
    console.log('本地存儲中沒有找到數據，使用默認空狀態');
    resetToEmptyState();
  }
}

// 重置為空狀態
function resetToEmptyState() {
  state.itinerary = [];
  state.diaryEntries = [];
  state.expenses = [];
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
  
  console.log('天氣和匯率更新完成');
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

console.log('應用程序初始化完成');
