/* ==========================================================
   NutriTrack Pro - Interactive Dashboard Logic & System States
   ========================================================== */

// Global System States (USDA FDC & Custom Local Storage simulation)
let systemState = {
  user: {
    name: "Dr. Alberto A.",
    age: 34,
    weight: 76,
    gender: "male",
    climate: "temperate",
    activity: "moderate",
    caloriesTarget: 2200,
    waterTarget: 2500,
    audioEnabled: true
  },
  hydration: {
    consumed: 1250,
    directLiquids: {
      pureWater: 900,
      infusions: 350
    },
    foodWater: 350
  },
  meals: [
    {
      id: "bf-1",
      category: "breakfast",
      name: "Organic Oat Flakes",
      portion: "100g serving",
      kcal: 380,
      protein: 12,
      carbs: 65,
      fat: 8,
      source: "USDA"
    },
    {
      id: "lu-1",
      category: "lunch",
      name: "Grilled Chicken Breast",
      portion: "150g serving",
      kcal: 250,
      protein: 42,
      carbs: 0,
      fat: 4,
      source: "USDA"
    },
    {
      id: "lu-2",
      category: "lunch",
      name: "White Quinoa Cooked",
      portion: "180g serving",
      kcal: 440,
      protein: 13,
      carbs: 75,
      fat: 8,
      source: "USDA"
    },
    {
      id: "sn-1",
      category: "snacks",
      name: "Greek Yogurt 2% Fat",
      portion: "200g serving",
      kcal: 380,
      protein: 43,
      carbs: 10,
      fat: 25,
      source: "custom"
    }
  ]
};

// Navigation Maps
const tabToModuleMap = {
  'dashboard': 'dashboard',
  'nutrition': 'meals', // default sub-tab of Nutrition
  'analytics': 'analytics',
  'reports': 'reports',
  'settings': 'settings',
  'support': 'support'
};

const moduleToTabMap = {
  'dashboard': 'dashboard',
  'hydration': 'nutrition',
  'meals': 'nutrition',
  'micronutrients': 'nutrition',
  'analytics': 'analytics',
  'reports': 'reports',
  'settings': 'settings',
  'support': 'support'
};

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWorkspaceNavigation();
  initCardInteractions();
  initPageRouting();
  initHydrationControls();
  initMealsControls();
  initSettingsControls();
  initKeyboardShortcuts();
  initCrocodile(); // Load the interactive 3D crocodile assistant
  initMusicControls(); // Load background menu music controls
  
  // Initial state synchronization
  recalculateMealsTotals();
  updateHydrationUI();
});

/**
 * Live Date and Time Updater
 */
function initClock() {
  const dateStrElement = document.getElementById('date-str');
  const timeStrElement = document.getElementById('time-str');

  function updateClock() {
    const now = new Date();
    
    // Time formatting: e.g. 10:30 AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    
    // Date formatting: e.g. July 15, 2026
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const dateStr = `${month} ${day}, ${year}`;
    
    // Update DOM
    if (dateStrElement) dateStrElement.textContent = dateStr;
    if (timeStrElement) timeStrElement.textContent = timeStr;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Unified Sidebar & Header Navigation Routing
 */
function initWorkspaceNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar .menu-item');
  const headerTabs = document.querySelectorAll('.header-bar .nav-item');

  // Sidebar link actions
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const module = item.getAttribute('data-module');
      if (module) {
        navigateToModule(module);
      }
    });
  });

  // Top header tab actions
  headerTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = tab.getAttribute('data-tab');
      if (tabName) {
        const correspondingModule = tabToModuleMap[tabName];
        navigateToModule(correspondingModule);
      }
    });
  });

  // Quick Action Buttons on Dashboard
  const quickGoButtons = document.querySelectorAll('[data-go]');
  quickGoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModule = btn.getAttribute('data-go');
      if (targetModule) {
        navigateToModule(targetModule);
      }
    });
  });
}

/**
 * Centralized Module Navigator
 */
function navigateToModule(moduleName) {
  if (!moduleName) return;
  
  playClickSound();

  // 1. Update Workspaces Visibility
  const workspaces = document.querySelectorAll('.workspace-section');
  workspaces.forEach(ws => {
    ws.classList.remove('active');
    if (ws.id === `workspace-${moduleName}`) {
      ws.classList.add('active');
    }
  });

  // If reports workspace is activated, trigger resize event to initialize Three.js canvas dimensions
  if (moduleName === 'reports') {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  // 2. Update Context Panels Visibility
  const panels = document.querySelectorAll('.context-panel-section');
  panels.forEach(panel => {
    panel.classList.remove('active');
    if (panel.id === `panel-${moduleName}`) {
      panel.classList.add('active');
    }
  });

  // 3. Highlight active left sidebar item
  const sidebarItems = document.querySelectorAll('.sidebar .menu-item');
  sidebarItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-module') === moduleName || 
       (moduleName === 'support' && item.classList.contains('settings-btn')) // Support doesn't highlight
    ) {
      if (moduleName !== 'support') {
        item.classList.add('active');
      }
    }
  });

  // 4. Highlight active top tab
  const activeTabName = moduleToTabMap[moduleName];
  const headerTabs = document.querySelectorAll('.header-bar .nav-item');
  headerTabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === activeTabName) {
      tab.classList.add('active');
    }
  });
}

/**
 * State Manager: Hydration
 */
function initHydrationControls() {
  const btnAdd = document.getElementById('btn-add-water');
  const btnRemove = document.getElementById('btn-remove-water');
  const dbQuickAdd = document.getElementById('db-quick-add-water');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      modifyWater(250);
    });
  }

  if (btnRemove) {
    btnRemove.addEventListener('click', () => {
      modifyWater(-250);
    });
  }

  if (dbQuickAdd) {
    dbQuickAdd.addEventListener('click', (e) => {
      e.stopPropagation();
      modifyWater(250);
    });
  }
}

function modifyWater(amount) {
  systemState.hydration.consumed = Math.max(0, systemState.hydration.consumed + amount);
  
  // Adjust direct liquids split dynamically for simulation
  if (amount > 0) {
    systemState.hydration.directLiquids.pureWater += amount;
  } else {
    systemState.hydration.directLiquids.pureWater = Math.max(0, systemState.hydration.directLiquids.pureWater + amount);
  }

  playClickSound(amount > 0 ? 659.25 : 440.00); // E5 for add, A4 for subtract
  updateHydrationUI();
}

function updateHydrationUI() {
  const consumed = systemState.hydration.consumed;
  const target = systemState.user.waterTarget;
  const percent = Math.min(100, (consumed / target) * 100);

  // Dashboard readouts
  const dbConsumed = document.getElementById('db-water-consumed');
  const dbProgress = document.getElementById('db-water-progress-bar');
  const dbBriefText = document.querySelector('.hydration-brief .hyd-stats');

  if (dbConsumed) dbConsumed.textContent = consumed.toLocaleString();
  if (dbProgress) dbProgress.style.width = `${percent}%`;
  if (dbBriefText) {
    const diff = Math.max(0, target - consumed);
    dbBriefText.textContent = `${percent.toFixed(1)}% of daily target reached (${diff.toLocaleString()}ml left)`;
  }

  // Hydration Workspace readouts
  const hydConsumedVal = document.getElementById('hyd-consumed-val');
  const hydTargetVal = document.getElementById('hyd-target-val');
  const fillLevel = document.getElementById('water-fill-level');

  if (hydConsumedVal) hydConsumedVal.textContent = consumed.toLocaleString();
  if (hydTargetVal) hydTargetVal.textContent = target.toLocaleString();
  if (fillLevel) fillLevel.style.height = `${percent}%`;

  // Hydration timeline panel events
  const timelineContainer = document.querySelector('.hydration-timeline-events');
  if (timelineContainer) {
    timelineContainer.innerHTML = '';
    
    // Add default events based on consumed volume
    let logs = [];
    if (consumed >= 500) logs.push({ time: "08:30 AM", text: "Logged +500 ml Pure Water" });
    if (consumed >= 750) logs.push({ time: "11:00 AM", text: "Logged +250 ml Organic Infusion" });
    if (consumed >= 1250) logs.push({ time: "01:30 PM", text: "Logged +500 ml Pure Water" });
    
    let remainingVal = consumed - (500 + 250 + 500);
    if (remainingVal > 0) {
      logs.push({ time: "Recent Log", text: `Logged +${remainingVal} ml Liquid Balance` });
    }

    logs.forEach(log => {
      const eventEl = document.createElement('div');
      eventEl.className = 'timeline-event';
      eventEl.style.borderLeft = '2px solid #0bd4e7';
      eventEl.style.paddingLeft = '10px';
      eventEl.style.marginBottom = '12px';
      eventEl.innerHTML = `<span class="event-time" style="font-size: 10px; color: var(--text-muted);">${log.time}</span><p style="font-size:12px;">${log.text}</p>`;
      timelineContainer.appendChild(eventEl);
    });
  }

  // Update diagnostic overall health score dynamically
  calculateOverallBioScore();
}

/**
 * State Manager: Meals Diary (CRUD Logs)
 */
function initMealsControls() {
  const container = document.querySelector('.meals-timeline-container');
  if (!container) return;

  // Add click handler for Duplicating, Deleting, or Editing cards
  container.addEventListener('click', (e) => {
    const target = e.target;
    const card = target.closest('.food-log-card');
    if (!card) return;

    const id = card.getAttribute('data-food-id');

    if (target.classList.contains('btn-delete-food')) {
      deleteFoodItem(id, card);
    } else if (target.classList.contains('btn-duplicate-food')) {
      duplicateFoodItem(id);
    } else if (target.classList.contains('btn-edit-food')) {
      alert("Edit food feature: Match USDA database interface.");
    }
  });

  // Recently Added Panel Action Quick Adds
  const quickAdds = document.querySelectorAll('.btn-add-recent');
  quickAdds.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-food');
      const kcal = parseInt(btn.getAttribute('data-kcal'));
      const macroStr = btn.getAttribute('data-macros'); // P/C/F
      const parts = macroStr.replace(/g/g, '').split('/');
      
      const protein = parseInt(parts[0]);
      const carbs = parseInt(parts[1]);
      const fat = parseInt(parts[2]);

      addNewFoodItem("lunch", name, kcal, protein, carbs, fat);
    });
  });
}

function addNewFoodItem(category, name, kcal, protein, carbs, fat) {
  const newId = `${category.substring(0, 2)}-${Date.now()}`;
  const newItem = {
    id: newId,
    category: category,
    name: name,
    portion: "Custom serving",
    kcal: kcal,
    protein: protein,
    carbs: carbs,
    fat: fat,
    source: "custom"
  };

  systemState.meals.push(newItem);
  renderMealsWorkspace();
  recalculateMealsTotals();
  playClickSound(659.25); // high chirp
}

function deleteFoodItem(id, cardEl) {
  systemState.meals = systemState.meals.filter(item => item.id !== id);
  cardEl.classList.add('removing');
  setTimeout(() => {
    cardEl.remove();
    recalculateMealsTotals();
    renderMealsWorkspace();
  }, 300);
  playClickSound(329.63); // low beep (E4)
}

function duplicateFoodItem(id) {
  const sourceItem = systemState.meals.find(item => item.id === id);
  if (!sourceItem) return;

  const newItem = { ...sourceItem, id: `${sourceItem.category.substring(0, 2)}-${Date.now()}` };
  systemState.meals.push(newItem);
  renderMealsWorkspace();
  recalculateMealsTotals();
}

function renderMealsWorkspace() {
  const categories = ["breakfast", "lunch", "dinner", "snacks"];
  
  categories.forEach(cat => {
    const catSection = document.getElementById(`meal-${cat}`);
    if (!catSection) return;

    const contentDiv = catSection.querySelector('.meal-accordion-content');
    if (!contentDiv) return;

    const items = systemState.meals.filter(m => m.category === cat);
    
    if (items.length === 0) {
      contentDiv.innerHTML = `<p class="empty-meal-text">No food logged for this meal segment. Quick add from panel list.</p>`;
    } else {
      contentDiv.innerHTML = '';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-log-card glass-panel';
        card.setAttribute('data-food-id', item.id);
        card.innerHTML = `
          <div class="food-info">
            <h4>${item.name}</h4>
            <span class="food-portion">${item.portion}</span>
            <span class="source-tag ${item.source === 'USDA' ? 'USDA' : 'custom'}">${item.source === 'USDA' ? 'USDA Database' : 'Custom User DB'}</span>
          </div>
          <div class="food-macros">
            <span>${item.kcal} kcal</span>
            <span>P: ${item.protein}g / C: ${item.carbs}g / F: ${item.fat}g</span>
          </div>
          <div class="food-actions">
            <button class="btn-icon btn-edit-food" title="Edit">✎</button>
            <button class="btn-icon btn-duplicate-food" title="Duplicate">⧉</button>
            <button class="btn-icon btn-delete-food" title="Delete">🗑</button>
          </div>
        `;
        contentDiv.appendChild(card);
      });
    }
  });
}

function recalculateMealsTotals() {
  let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let catTotals = {
    breakfast: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    lunch: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    dinner: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    snacks: { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  };

  // Compile categories and master totals
  systemState.meals.forEach(item => {
    totals.kcal += item.kcal;
    totals.protein += item.protein;
    totals.carbs += item.carbs;
    totals.fat += item.fat;

    if (catTotals[item.category]) {
      catTotals[item.category].kcal += item.kcal;
      catTotals[item.category].protein += item.protein;
      catTotals[item.category].carbs += item.carbs;
      catTotals[item.category].fat += item.fat;
    }
  });

  // 1. Update Workspace Accordion Headers
  Object.keys(catTotals).forEach(cat => {
    const header = document.querySelector(`#meal-${cat} .meal-accordion-header`);
    if (header) {
      const kcalDisplay = header.querySelector('.meal-meta .meal-calories');
      const macroDisplay = header.querySelector('.meal-macros');
      
      if (kcalDisplay) kcalDisplay.textContent = `${catTotals[cat].kcal} kcal`;
      if (macroDisplay) {
        macroDisplay.innerHTML = `<span>P: ${catTotals[cat].protein}g</span><span>C: ${catTotals[cat].carbs}g</span><span>F: ${catTotals[cat].fat}g</span>`;
      }
    }
  });

  // 2. Update Dashboard Master Card Calorie metrics
  const dbCalConsumed = document.getElementById('db-cal-consumed');
  const dbCalTarget = document.getElementById('db-cal-target');
  const dbCalRem = document.getElementById('db-cal-rem');
  const dbCalProgress = document.getElementById('db-cal-progress-bar');

  const calTarget = systemState.user.caloriesTarget;
  const calPercent = Math.min(100, (totals.kcal / calTarget) * 100);

  if (dbCalConsumed) dbCalConsumed.textContent = totals.kcal.toLocaleString();
  if (dbCalTarget) dbCalTarget.textContent = calTarget.toLocaleString();
  if (dbCalRem) {
    const diff = calTarget - totals.kcal;
    dbCalRem.textContent = diff > 0 ? `${diff.toLocaleString()} kcal remaining` : `${Math.abs(diff).toLocaleString()} kcal exceeding limit`;
  }
  if (dbCalProgress) dbCalProgress.style.width = `${calPercent}%`;

  // 3. Update Right Sidebar Donut Chart ratios
  updateDonutChart(totals.protein, totals.carbs, totals.fat);

  // 4. Update Right Sidebar Meal splits
  updateMealSplits(catTotals, totals.kcal);

  // 5. Update latest meal log tables on dashboard home
  updateDashboardMealTable();

  // 6. Recalculate BioScore
  calculateOverallBioScore();
}

function updateDonutChart(p, c, f) {
  const totalGrams = p + c + f;
  if (totalGrams === 0) return;

  const pPct = Math.round((p / totalGrams) * 100);
  const cPct = Math.round((c / totalGrams) * 100);
  const fPct = Math.round((f / totalGrams) * 100);

  // Donut slices dasharray configuration (Circumference is 282.74, so map percentages)
  const pLength = (pPct / 100) * 282.74;
  const cLength = (cPct / 100) * 282.74;
  const fLength = (fPct / 100) * 282.74;

  const circles = document.querySelectorAll('.donut-chart-container circle');
  if (circles.length >= 3) {
    // Protein Circle (offset 0)
    circles[0].setAttribute('stroke-dasharray', `${pLength} 282.74`);
    
    // Carbs Circle (offset = negative Protein Length)
    circles[1].setAttribute('stroke-dasharray', `${cLength} 282.74`);
    circles[1].setAttribute('stroke-dashoffset', `-${pLength}`);
    
    // Fats Circle (offset = negative Protein + Carbs Length)
    circles[2].setAttribute('stroke-dasharray', `${fLength} 282.74`);
    circles[2].setAttribute('stroke-dashoffset', `-${pLength + cLength}`);
  }

  // Update text percentages on sidebar
  const ratios = document.querySelectorAll('.macro-ratios-list .macro-ratio-item span:last-child');
  if (ratios.length >= 3) {
    ratios[0].textContent = `${p}g (${pPct}%)`;
    ratios[1].textContent = `${c}g (${cPct}%)`;
    ratios[2].textContent = `${f}g (${fPct}%)`;
  }
}

function updateMealSplits(catTotals, grandTotalKcal) {
  const categories = ["breakfast", "lunch", "dinner", "snacks"];
  const splitRows = document.querySelectorAll('.meals-calorie-split .split-row strong');

  categories.forEach((cat, index) => {
    if (splitRows[index]) {
      const kcal = catTotals[cat].kcal;
      const pct = grandTotalKcal > 0 ? Math.round((kcal / grandTotalKcal) * 100) : 0;
      splitRows[index].textContent = `${kcal} kcal (${pct}%)`;
    }
  });
}

function updateDashboardMealTable() {
  const table = document.querySelector('.meals-list-table');
  if (!table) return;

  // Preserve header row
  const header = table.querySelector('.table-header');
  table.innerHTML = '';
  table.appendChild(header);

  // Compile unique lists or display last 3 logged items
  const lastLogs = systemState.meals.slice(-3);
  
  if (lastLogs.length === 0) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `<span style="grid-column: 1 / -1; text-align:center; color:var(--text-muted);">No meals logged. Tap shortcut to go to diary.</span>`;
    table.appendChild(row);
  } else {
    lastLogs.forEach(log => {
      const row = document.createElement('div');
      row.className = 'table-row';
      row.innerHTML = `
        <span>${log.category.toUpperCase()}: ${log.name}</span>
        <span>Today</span>
        <span class="highlight-calories">${log.kcal} kcal</span>
        <span>${log.protein}g / ${log.carbs}g / ${log.fat}g</span>
        <span class="db-source ${log.source === 'USDA' ? 'USDA' : 'custom'}">${log.source.toUpperCase()}</span>
      `;
      table.appendChild(row);
    });
  }
}

/**
 * Settings Goal Adjustments Calculations
 */
function initSettingsControls() {
  const btnSave = document.getElementById('btn-save-settings');
  if (!btnSave) return;

  btnSave.addEventListener('click', () => {
    const age = parseInt(document.getElementById('cfg-age').value);
    const weight = parseInt(document.getElementById('cfg-weight').value);
    const gender = document.getElementById('cfg-gender').value;
    const climate = document.getElementById('cfg-climate').value;
    const activity = document.getElementById('cfg-activity').value;
    const calories = parseInt(document.getElementById('cfg-calories').value);
    const audioChecked = document.getElementById('cfg-audio').checked;

    // Recalculate hydration goal baseline: 35ml per kg of weight
    let waterTarget = Math.round(weight * 35);
    
    // Apply climate offsets
    if (climate === 'tropical') {
      waterTarget += 500;
    } else if (climate === 'cold') {
      waterTarget -= 300;
    }

    // Save states
    systemState.user.age = age;
    systemState.user.weight = weight;
    systemState.user.gender = gender;
    systemState.user.climate = climate;
    systemState.user.activity = activity;
    systemState.user.caloriesTarget = calories;
    systemState.user.waterTarget = waterTarget;
    systemState.user.audioEnabled = audioChecked;

    // Update global UI panels
    recalculateMealsTotals();
    updateHydrationUI();

    // Context profiles summary update
    const profileSummaryTexts = document.querySelectorAll('#panel-settings div div');
    if (profileSummaryTexts.length >= 3) {
      profileSummaryTexts[1].innerHTML = `<strong>Basal Metabolic Rate:</strong> ${Math.round(weight * 22)} kcal`;
      profileSummaryTexts[2].innerHTML = `<strong>Total Energy Goal:</strong> ${calories} kcal`;
    }

    alert("Nutrition Engine Recalculated! Goals and hydration target remapped successfully.");
    playClickSound(783.99); // high G note for success confirmation chime
  });
}

/**
 * Recalculate BioScore based on goal thresholds
 */
function calculateOverallBioScore() {
  let score = 100;

  // Calorie calculation
  let totals = { kcal: 0 };
  systemState.meals.forEach(item => totals.kcal += item.kcal);
  
  const kcalDiff = Math.abs(totals.kcal - systemState.user.caloriesTarget);
  const kcalScorePenalty = Math.min(25, Math.round((kcalDiff / systemState.user.caloriesTarget) * 25));
  score -= kcalScorePenalty;

  // Water calculation
  const waterDiff = Math.abs(systemState.hydration.consumed - systemState.user.waterTarget);
  const waterScorePenalty = Math.min(20, Math.round((waterDiff / systemState.user.waterTarget) * 20));
  score -= waterScorePenalty;

  // Deficiencies penalty (simulated)
  if (totals.kcal < 1000) {
    score -= 15; // insufficient general logging
  }

  score = Math.max(30, Math.min(100, score));

  // Update readouts
  const diagnosticNumber = document.querySelector('.overall-diagnostic-badge .diagnostic-score');
  const headerScoreText = document.getElementById('header-health-score');
  
  if (diagnosticNumber) diagnosticNumber.textContent = score;
  if (headerScoreText) headerScoreText.textContent = `BioScore: ${score}%`;
}

/**
 * Keyboard Console Navigation Listener
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore keyboard captures inside input boxes
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toUpperCase();
    
    if (key === 'D') {
      navigateToModule('dashboard');
    } else if (key === 'W') {
      navigateToModule('hydration');
    } else if (key === 'M') {
      navigateToModule('meals');
    } else if (key === 'U') {
      navigateToModule('micronutrients');
    } else if (key === 'A') {
      navigateToModule('analytics');
    } else if (key === 'R') {
      navigateToModule('reports');
    } else if (key === 'S') {
      navigateToModule('settings');
    } else if (key === 'H') {
      // Return to landing page
      const landingPage = document.getElementById('landing-page');
      const dashboardPage = document.getElementById('dashboard-page');
      if (landingPage && dashboardPage && dashboardPage.style.display !== 'none') {
        landingPage.style.display = 'flex';
        dashboardPage.style.display = 'none';
        
        // play sound
        playClickSound(300);
      }
    }
  });
}

/**
 * Parallax Tilt Mouse Interaction Handler
 */
function initCardInteractions() {
  const tiltElements = document.querySelectorAll('.glass-panel:not(.header-bar):not(.sidebar):not(.footer-bar)');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const maxTilt = 1.8;
      const tiltX = ((yc - y) / yc) * maxTilt;
      const tiltY = ((x - xc) / xc) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.008)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/**
 * UI Synthesizer Audio Feedback
 */
function playClickSound(customFreq = 587.33) {
  if (!systemState.user.audioEnabled) return;
  
  try {
    const audioCtx = getAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(customFreq, audioCtx.currentTime); // standard beep freq or custom
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.12);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (error) {
    // browser audio policies safeguard
  }
}

/**
 * Page Switcher Transition Router (Landing -> Dashboard)
 */
function initPageRouting() {
  const landingPage = document.getElementById('landing-page');
  const dashboardPage = document.getElementById('dashboard-page');

  if (!landingPage || !dashboardPage) return;

  function switchPage(toPage, activeTab = null) {
    playClickSound(659.25);
    
    const currentPage = toPage === 'dashboard' ? landingPage : dashboardPage;
    const nextPage = toPage === 'dashboard' ? dashboardPage : landingPage;

    currentPage.style.opacity = '0';
    currentPage.style.transform = 'scale(0.97)';
    
    const bgImage = document.querySelector('.background-image-container');
    const bgVideoContainer = document.querySelector('.background-video-container');
    const bgVideo = document.querySelector('.background-video');

    if (toPage === 'dashboard') {
      if (bgImage) bgImage.classList.add('opaque');
      if (bgVideoContainer) bgVideoContainer.style.opacity = '0';
      if (bgVideo) bgVideo.pause(); 
    } else {
      if (bgImage) bgImage.classList.remove('opaque');
      if (bgVideoContainer) bgVideoContainer.style.opacity = '1';
      if (bgVideo) bgVideo.play().catch(e => console.warn('Autoplay block prevent:', e));
    }
    
    setTimeout(() => {
      currentPage.style.display = 'none';
      currentPage.classList.remove('active');

      nextPage.style.display = 'flex';
      nextPage.offsetHeight; // Reflow force
      nextPage.classList.add('active');
      
      setTimeout(() => {
        nextPage.style.opacity = '1';
        nextPage.style.transform = 'scale(1)';
      }, 50);

      // Route module segment
      if (toPage === 'dashboard') {
        if (activeTab) {
          navigateToModule(activeTab);
        } else {
          navigateToModule('dashboard');
        }
      }
    }, 450); 
  }

  // Hook navigation buttons
  const launchBtn = document.getElementById('launch-dashboard-btn');
  if (launchBtn) launchBtn.addEventListener('click', () => switchPage('dashboard'));

  const playCtaBtn = document.getElementById('cta-nav-play');
  if (playCtaBtn) playCtaBtn.addEventListener('click', () => switchPage('dashboard', 'meals'));

  const footerGamesBtn = document.getElementById('footer-btn-games');
  if (footerGamesBtn) footerGamesBtn.addEventListener('click', () => switchPage('dashboard', 'dashboard'));

  // Feature cards direct routing links
  const gamesCard = document.getElementById('card-games-btn');
  if (gamesCard) gamesCard.addEventListener('click', () => switchPage('dashboard', 'meals'));

  const socialCard = document.getElementById('card-social-btn');
  if (socialCard) socialCard.addEventListener('click', () => switchPage('dashboard', 'hydration'));

  const achCard = document.getElementById('card-achievements-btn');
  if (achCard) achCard.addEventListener('click', () => switchPage('dashboard', 'micronutrients'));

  const storeCard = document.getElementById('card-store-btn');
  if (storeCard) storeCard.addEventListener('click', () => switchPage('dashboard', 'analytics'));

  // Header Nav Items routing matching
  const landingNavItems = document.querySelectorAll('.landing-nav-item');
  landingNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      
      landingNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      if (target === 'home') {
        // stay here
      } else if (target === 'meals') {
        switchPage('dashboard', 'meals');
      } else if (target === 'hydration') {
        switchPage('dashboard', 'hydration');
      } else if (target === 'micronutrients') {
        switchPage('dashboard', 'micronutrients');
      } else if (target === 'analytics') {
        switchPage('dashboard', 'analytics');
      }
    });
  });

  // Return to landing: logo area click
  const dashboardLogo = document.querySelector('.header-bar .logo-area');
  if (dashboardLogo) {
    dashboardLogo.style.cursor = 'pointer';
    dashboardLogo.addEventListener('click', () => {
      resetLandingNav();
      switchPage('landing');
    });
  }

  function resetLandingNav() {
    landingNavItems.forEach(nav => {
      if (nav.getAttribute('data-target') === 'home') {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });
  }
}

/**
 * 3D Interactive Crocodile Clinical Assistant Setup (Vanilla Three.js)
 */
function initCrocodile() {
  const container = document.getElementById('cocodrilo-canvas-container');
  if (!container) return;

  // Limits from Blender metadata
  const LIMITES = {
    ojo: {
      maxX: 0.939293, minX: -1.05972,
      maxY: 0.907181, minY: -0.666336,
    },
    brillo: {
      maxX: 0.76577, minX: -0.699181,
      maxY: 0.449474, minY: -0.7129,
    }
  };

  // Mouse tracking state
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates relative to viewport center (-1 to 1)
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.physicallyCorrectLights = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  // GLTF Model Loader
  const loader = new THREE.GLTFLoader();
  loader.load('assets/cocodrilo_interactivo.glb', (gltf) => {
    const model = gltf.scene;

    // Rotation and scaling
    model.rotation.set(0, Math.PI, 0);
    model.position.set(0, -0.2, 0);
    model.scale.set(2.9, 2.9, 2.9);
    scene.add(model);

    // Skeleton, Bones and Animations
    let huesoOjoR, huesoOjoL, huesoBrilloR, huesoBrilloL;
    let posOrigOjoR, posOrigOjoL, posOrigBrilloR, posOrigBrilloL;
    let esqueletoMaestro = null;
    let mixer;

    model.traverse((child) => {
      // Catch node bones (handle both dot and sanitised names)
      if (child.name === 'ojoR' || child.name === 'ojo.R') {
        huesoOjoR = child;
        posOrigOjoR = child.position.clone();
        child.matrixAutoUpdate = true;
        child.matrixWorldNeedsUpdate = true;
      }
      if (child.name === 'ojoL' || child.name === 'ojo.L') {
        huesoOjoL = child;
        posOrigOjoL = child.position.clone();
        child.matrixAutoUpdate = true;
        child.matrixWorldNeedsUpdate = true;
      }
      if (child.name === 'brilloR' || child.name === 'brillo.R') {
        huesoBrilloR = child;
        posOrigBrilloR = child.position.clone();
        child.matrixAutoUpdate = true;
        child.matrixWorldNeedsUpdate = true;
      }
      if (child.name === 'brilloL' || child.name === 'brillo.L') {
        huesoBrilloL = child;
        posOrigBrilloL = child.position.clone();
        child.matrixAutoUpdate = true;
        child.matrixWorldNeedsUpdate = true;
      }

      if (child.isSkinnedMesh && child.skeleton) {
        esqueletoMaestro = child.skeleton;
      }

      if (child.isMesh) {
        child.frustumCulled = false;
        if (child.morphTargetInfluences) {
          child.matrixAutoUpdate = true;
        }
      }
    });

    const animations = gltf.animations;
    if (animations && animations.length > 0) {
      // Remove eye/glow tracks from keyframe animation so our manual overrides work
      animations.forEach((clip) => {
        clip.tracks = clip.tracks.filter((track) =>
          !track.name.includes('ojo') && !track.name.includes('brillo')
        );
      });

      mixer = new THREE.AnimationMixer(model);
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.reset().play().setEffectiveWeight(1);
      });
    }

    // Elastic spring physics variables
    let velBrilloR = new THREE.Vector3();
    let velBrilloL = new THREE.Vector3();

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      // 1. Clock frame time sync
      if (animations && animations.length > 0 && mixer) {
        const clipPrincipal = animations[0];
        mixer.setTime(clock.getElapsedTime() % clipPrincipal.duration);
      }

      // 2. Map pointer coordinates
      let pointerX = -mouseX;
      let pointerY = mouseY;

      const length = Math.sqrt(pointerX * pointerX + pointerY * pointerY);
      if (length > 1) {
        pointerX /= length;
        pointerY /= length;
      }

      const targetOjoX = pointerX > 0 ? pointerX * LIMITES.ojo.maxX : pointerX * Math.abs(LIMITES.ojo.minX);
      const targetOjoY = pointerY > 0 ? pointerY * LIMITES.ojo.maxY : pointerY * Math.abs(LIMITES.ojo.minY);

      const targetBrilloX = pointerX > 0 ? pointerX * LIMITES.brillo.maxX : pointerX * Math.abs(LIMITES.brillo.minX);
      const targetBrilloY = pointerY > 0 ? pointerY * LIMITES.brillo.maxY : pointerY * Math.abs(LIMITES.brillo.minY);

      // 3. Apply eye translation offset
      if (huesoOjoR && posOrigOjoR) {
        huesoOjoR.position.x = posOrigOjoR.x + targetOjoX;
        huesoOjoR.position.y = posOrigOjoR.y + targetOjoY;
        huesoOjoR.position.z = posOrigOjoR.z;
      }
      if (huesoOjoL && posOrigOjoL) {
        huesoOjoL.position.x = posOrigOjoL.x + targetOjoX;
        huesoOjoL.position.y = posOrigOjoL.y + targetOjoY;
        huesoOjoL.position.z = posOrigOjoL.z;
      }

      // Damped spring physics for eye highlight glimmers
      const k = 0.12;
      const amortiguacion = 0.82;

      if (huesoBrilloR && posOrigBrilloR) {
        const distX = (posOrigBrilloR.x + targetBrilloX) - huesoBrilloR.position.x;
        const distY = (posOrigBrilloR.y + targetBrilloY) - huesoBrilloR.position.y;
        const distZ = posOrigBrilloR.z - huesoBrilloR.position.z;

        velBrilloR.x = (velBrilloR.x + distX * k) * amortiguacion;
        velBrilloR.y = (velBrilloR.y + distY * k) * amortiguacion;
        velBrilloR.z = (velBrilloR.z + distZ * k) * amortiguacion;

        huesoBrilloR.position.x += velBrilloR.x;
        huesoBrilloR.position.y += velBrilloR.y;
        huesoBrilloR.position.z += velBrilloR.z;
      }

      if (huesoBrilloL && posOrigBrilloL) {
        const distX = (posOrigBrilloL.x + targetBrilloX) - huesoBrilloL.position.x;
        const distY = (posOrigBrilloL.y + targetBrilloY) - huesoBrilloL.position.y;
        const distZ = posOrigBrilloL.z - huesoBrilloL.position.z;

        velBrilloL.x = (velBrilloL.x + distX * k) * amortiguacion;
        velBrilloL.y = (velBrilloL.y + distY * k) * amortiguacion;
        velBrilloL.z = (velBrilloL.z + distZ * k) * amortiguacion;

        huesoBrilloL.position.x += velBrilloL.x;
        huesoBrilloL.position.y += velBrilloL.y;
        huesoBrilloL.position.z += velBrilloL.z;
      }

      if (esqueletoMaestro) {
        esqueletoMaestro.update();
      }

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Interactive speech bubble triggers on click
    let bubbleTimeout;
    let isTyping = false;

    container.addEventListener('click', () => {
      if (isTyping) return;

      const bubble = document.getElementById('crocodile-speech-bubble');
      if (!bubble) return;

      // Show bubble and clear previous text
      bubble.classList.add('show');
      const textElement = bubble.querySelector('.bubble-text');
      textElement.textContent = '';

      const message = "Hola! lo siento... pero aún estoy en progreso";
      let charIndex = 0;
      isTyping = true;

      clearTimeout(bubbleTimeout);

      function typeCharacter() {
        if (charIndex < message.length) {
          textElement.textContent += message.charAt(charIndex);
          charIndex++;

          // Play sound for character (exclude spaces for natural speech cadence)
          if (message.charAt(charIndex - 1) !== ' ') {
            playTalkSound();
          }

          setTimeout(typeCharacter, 60);
        } else {
          isTyping = false;
          // Hold bubble visible for 3.5 seconds, then fade out
          bubbleTimeout = setTimeout(() => {
            bubble.classList.remove('show');
          }, 3500);
        }
      }

      typeCharacter();
    });
  });
}

// Shared global AudioContext to prevent exceeding the browser limit (maximum 6 active contexts)
let sharedAudioCtx = null;

function getAudioContext() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Synthesizer Talk Audio Feedback for assistant messages (Web Audio API)
 */
function playTalkSound() {
  if (!systemState.user.audioEnabled) return;

  try {
    const audioCtx = getAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Warm triangle wave for a cozy retro assistant chime
    oscillator.type = 'triangle';
    
    // Pleasant high-pitch frequency range with a subtle pitch sweep
    const baseFreq = 580 + Math.random() * 180;
    oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq + 90, audioCtx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.012, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08);
  } catch (error) {
    // Browser audio policy safety catch
  }
}

/**
 * Background Menu Music Manager (AppSoundMenu_short.mp3)
 */
let menuMusic = new Audio('assets/AppSoundMenu_short.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.35; // Comfortable default background volume level
let musicPlaying = false;

function startMenuMusic() {
  menuMusic.play().then(() => {
    musicPlaying = true;
    updateMusicButtonsUI();
    // Clean up interaction triggers
    document.removeEventListener('click', startMenuMusic);
    document.removeEventListener('keydown', startMenuMusic);
  }).catch(err => {
    // Autoplay blocked (waiting for interaction)
  });
}

function toggleMusic() {
  if (musicPlaying) {
    menuMusic.pause();
    musicPlaying = false;
  } else {
    menuMusic.play().catch(e => console.warn("Audio play prevented:", e));
    musicPlaying = true;
    // In case the interaction triggers hadn't fired yet
    document.removeEventListener('click', startMenuMusic);
    document.removeEventListener('keydown', startMenuMusic);
  }
  updateMusicButtonsUI();
}

function updateMusicButtonsUI() {
  const buttons = [
    document.getElementById('music-toggle-landing'),
    document.getElementById('music-toggle-dashboard')
  ];
  buttons.forEach(btn => {
    if (!btn) return;
    const svg = btn.querySelector('.speaker-icon');
    if (!svg) return;

    if (musicPlaying) {
      btn.style.borderColor = 'rgba(11, 212, 231, 0.7)';
      btn.style.boxShadow = '0 0 8px rgba(11, 212, 231, 0.4)';
      btn.style.color = 'var(--secondary-glow)';
      // Speaker ON Icon
      svg.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      `;
    } else {
      btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      btn.style.boxShadow = 'none';
      btn.style.color = 'rgba(255, 255, 255, 0.4)';
      // Speaker OFF / Mute Icon
      svg.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    }
  });
}

function initMusicControls() {
  const landingBtn = document.getElementById('music-toggle-landing');
  const dashboardBtn = document.getElementById('music-toggle-dashboard');

  if (landingBtn) {
    landingBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering startMenuMusic listener
      toggleMusic();
    });
  }
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering startMenuMusic listener
      toggleMusic();
    });
  }

  // Bind keydown/click trigger to startup audio on first page interaction
  document.addEventListener('click', startMenuMusic);
  document.addEventListener('keydown', startMenuMusic);

  // Initialize button appearance
  updateMusicButtonsUI();
}
