let activeMultitab = null;
let activeMultitabTabs = [];

let tabs = [
  {
    id: 1,
    title: "Pearl Browser - Home",
    url: "pearl://home",
    favicon: "home",
    isIncognito: false,
  },
  {
    id: 2,
    title: ".NET Documentation",
    url: "docs.microsoft.com",
    favicon: "description",
    isIncognito: false,
  },
  {
    id: 3,
    title: "GitHub",
    url: "github.com",
    favicon: "code",
    isIncognito: false,
  },
];
let currentTabId = 1;
let nextTabId = 4;
let currentView = "home"; // 'home', 'search', 'browser'
let currentTabsMode = "single"; // 'single', 'groups'
let isIncognitoMode = false;

// Fake tabs management
let fakeTabs = [];
let nextFakeTabId = 1;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  mdc.autoInit();
  renderTabs();
  updateTabCount();
  initializeTabsView();

  initializeMultitabGroups();

  // Address bar functionality
  const addressBar = document.getElementById("addressBar");
  addressBar.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.value.trim()) {
      navigateToUrl(this.value.trim());
    }
  });

  addressBar.addEventListener("focus", function () {
    if (currentView === "home") {
      showSearch();
    }
  });

  document.getElementById('multitabDetailsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeMultitabDetails();
        }
    });

    // Handle escape key for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMultitabDetails();
            closeAllMultitabMenus();
        }
    });
});

// Wallet dropdown functionality
function toggleWalletDropdown() {
  const dropdown = document.getElementById("walletDropdown");
  dropdown.classList.toggle("open");
}

// Close wallet dropdown when clicking outside
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("walletDropdown");
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});

// Fake tabs system
function createFakeTab(type, title, data = {}) {
  const existingTab = fakeTabs.find(
    (tab) => tab.type === type && tab.title === title
  );
  if (existingTab) {
    switchToFakeTab(existingTab.id);
    return;
  }

  const fakeTab = {
    id: nextFakeTabId++,
    type: type,
    title: title,
    data: data,
  };

  fakeTabs.push(fakeTab);
  createFakeTabElement(fakeTab);
  switchToFakeTab(fakeTab.id);
}

function createFakeTabElement(fakeTab) {
  const tabElement = document.createElement("div");
  tabElement.className = "fake-tab";
  tabElement.id = `fake-tab-${fakeTab.id}`;

  let content = "";

  if (fakeTab.type === "wallet") {
    content = createWalletContent(fakeTab);
  } else if (fakeTab.type === "dapps") {
    content = createDappsContent(fakeTab);
  } else if (fakeTab.type === "ai") {
    content = createAiContent(fakeTab);
  }

  tabElement.innerHTML = content;
  document.getElementById("tabsContainer").appendChild(tabElement);

  // Add event listeners for sidebar toggle if needed
  if (fakeTab.type === "dapps" || fakeTab.type === "ai") {
    // Add sidebar link event listeners
    const sidebarLinks = tabElement.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        if (category) {
          switchCategory(fakeTab.id, category);
          closeSidebar(fakeTab.id);
        }
      });
    });
  }
}

function createWalletContent(fakeTab) {
  return `
                <div class="tab-header">
                    <div class="tab-title">
                        <span class="material-icons">wallet</span>
                        ${fakeTab.title}
                    </div>
                    <button class="tab-close" onclick="closeFakeTab(${fakeTab.id})">×</button>
                </div>
                <div class="tab-content">
                    <div class="main-content">
                        <iframe src="./wallet.html" 
                                style="width: 100%; height: 100%; border: none;"></iframe>
                    </div>
                </div>
            `;
}

function createDappsContent(fakeTab) {
  return `
                <div class="tab-header">
                    <div class="tab-title">
                        <button class="sidebar-toggle" onclick="toggleSidebar(${
                          fakeTab.id
                        })">
                            <span class="material-icons">menu</span>
                        </button>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white"><path d="M120-120v-200h160l160-160v-128q-36-13-58-43.5T360-720q0-50 35-85t85-35q50 0 85 35t35 85q0 38-22 68.5T520-608v128l160 160h160v200H640v-122L480-402 320-242v122H120Z"/></svg>
                        Dapps Menu
                    </div>
                    <button class="tab-close" onclick="closeFakeTab(${
                      fakeTab.id
                    })">×</button>
                </div>
                <div class="tab-content">
                    <div class="sidebar-overlay" id="sidebar-overlay-${
                      fakeTab.id
                    }" onclick="closeSidebar(${fakeTab.id})"></div>
                    <div class="sidebar" id="dapps-sidebar-${fakeTab.id}">
                        <button class="sidebar-close" onclick="closeSidebar(${
                          fakeTab.id
                        })">×</button>
                        <ul class="sidebar-menu">
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link active" data-category="chains">
                                    <span class="sidebar-icon">⛓️</span>
                                    <span class="sidebar-text">Chains</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="all-categories">
                                    <span class="sidebar-icon">📂</span>
                                    <span class="sidebar-text">All Categories</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="defi">
                                    <span class="sidebar-icon">💰</span>
                                    <span class="sidebar-text">DeFi</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="nfts">
                                    <span class="sidebar-icon">🖼️</span>
                                    <span class="sidebar-text">NFTs</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="games">
                                    <span class="sidebar-icon">🎮</span>
                                    <span class="sidebar-text">Games</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="social">
                                    <span class="sidebar-icon">👥</span>
                                    <span class="sidebar-text">Social</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="main-content">
                        <div class="content-header">
                            <h2 style="margin-bottom: 16px; color: #333;">Chains</h2>
                            <div class="search-container">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input" placeholder="Search tool">
                            </div>
                        </div>
                        <table class="content-table" id="dapps-table-${
                          fakeTab.id
                        }">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Logo</th>
                                    <th>Name</th>
                                    <th>Link</th>
                                    <th>Info</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getDappsTableContent("chains")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
}

function createAiContent(fakeTab) {
  return `
                <div class="tab-header">
                    <div class="tab-title">
                        <button class="sidebar-toggle" onclick="toggleSidebar(${
                          fakeTab.id
                        })">
                            <span class="material-icons">menu</span>
                        </button>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white"><path d="M480-40q-50 0-85-35t-35-85q0-14 2.5-26.5T371-211L211-372q-12 5-25 8.5t-27 3.5q-50 0-84.5-35T40-480q0-50 34.5-85t84.5-35q39 0 70 22.5t43 57.5h95q9-26 28-44.5t45-27.5v-95q-35-12-57.5-43T360-800q0-50 35-85t85-35q50 0 85 35t35 85q0 14-3 27t-9 25l160 160q12-6 25-9t27-3q50 0 85 35t35 85q0 50-35 85t-85 35q-39 0-70-22.5T687-440h-95q-9 26-27.5 45T520-367v94q35 12 57.5 43t22.5 70q0 50-35 85t-85 35Z"/></svg>
                        AI Menu
                    </div>
                    <button class="tab-close" onclick="closeFakeTab(${
                      fakeTab.id
                    })">×</button>
                </div>
                <div class="tab-content">
                    <div class="sidebar-overlay" id="sidebar-overlay-${
                      fakeTab.id
                    }" onclick="closeSidebar(${fakeTab.id})"></div>
                    <div class="sidebar" id="ai-sidebar-${fakeTab.id}">
                        <button class="sidebar-close" onclick="closeSidebar(${
                          fakeTab.id
                        })">×</button>
                        <ul class="sidebar-menu">
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link active" data-category="all-categories">
                                    <span class="sidebar-icon">📂</span>
                                    <span class="sidebar-text">All Categories</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="chatbots">
                                    <span class="sidebar-icon">💬</span>
                                    <span class="sidebar-text">Chatbots</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="coding">
                                    <span class="sidebar-icon">⌨️</span>
                                    <span class="sidebar-text">Coding</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="customer-service">
                                    <span class="sidebar-icon">🎧</span>
                                    <span class="sidebar-text">Customer Service</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="content-generators">
                                    <span class="sidebar-icon">✍️</span>
                                    <span class="sidebar-text">Content Generators</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="image-generators">
                                    <span class="sidebar-icon">🎨</span>
                                    <span class="sidebar-text">Image Generators</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="sound-generators">
                                    <span class="sidebar-icon">🎵</span>
                                    <span class="sidebar-text">Sound Generators</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="data-management">
                                    <span class="sidebar-icon">📊</span>
                                    <span class="sidebar-text">Data Management</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="seo">
                                    <span class="sidebar-icon">🔍</span>
                                    <span class="sidebar-text">SEO</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="web3">
                                    <span class="sidebar-icon">🌐</span>
                                    <span class="sidebar-text">Web3</span>
                                </a>
                            </li>
                            <li class="sidebar-item">
                                <a href="#" class="sidebar-link" data-category="libraries">
                                    <span class="sidebar-icon">📚</span>
                                    <span class="sidebar-text">AI Open Source Libraries</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="main-content">
                        <div class="content-header">
                            <h2 style="margin-bottom: 16px; color: #333;">All Categories</h2>
                            <div class="search-container">
                                <span class="material-icons search-icon">search</span>
                                <input type="text" class="search-input" placeholder="Search tool">
                            </div>
                        </div>
                        <table class="content-table" id="ai-table-${
                          fakeTab.id
                        }">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Logo</th>
                                    <th>Name</th>
                                    <th>Link</th>
                                    <th>Info</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getAiTableContent("all-categories")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
}

function getDappsTableContent(category) {
  const dappsData = {
    chains: [
      { name: "Lido", logo: "🌊", link: "lido.fi" },
      { name: "Banana Gun", logo: "🍌", link: "banana.gun" },
      { name: "EigenLayer", logo: "⚡", link: "eigenlayer.xyz" },
    ],
    defi: [
      { name: "Aave V1", logo: "👻", link: "aave.com" },
      { name: "Maker DAO", logo: "Ⓜ️", link: "makerdao.com" },
      { name: "UniSwap V3", logo: "🦄", link: "uniswap.org" },
    ],
    nfts: [
      { name: "1inch Network", logo: "🔗", link: "1inch.io" },
      { name: "Magic Eden", logo: "✨", link: "magiceden.io" },
      { name: "OpenSea", logo: "🌊", link: "opensea.io" },
    ],
  };

  const data = dappsData[category] || dappsData["chains"];
  return data
    .map(
      (item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="table-logo">${item.logo}</div>
                    </td>
                    <td>${item.name}</td>
                    <td>
                        <a onclick="event.stopPropagation(); navigateToSite('https://${
                          item.link
                        }')" class="table-link">
                            <span class="material-icons">open_in_new</span>
                        </a>
                    </td>
                    <td>
                        <button class="info-button">ⓘ</button>
                    </td>
                </tr>
            `
    )
    .join("");
}

function getAiTableContent(category) {
  const aiData = {
    "all-categories": [
      { name: "TensorFlow", logo: "🧠", link: "tensorflow.org" },
      { name: "PyTorch", logo: "🔥", link: "pytorch.org" },
      { name: "Scikit-learn", logo: "📊", link: "scikit-learn.org" },
    ],
    chatbots: [
      { name: "Keras", logo: "🤖", link: "keras.io" },
      { name: "OpenNN", logo: "🧮", link: "opennn.net" },
      { name: "CNTK", logo: "🔗", link: "cntk.ai" },
    ],
    coding: [
      { name: "OpenAI", logo: "🤯", link: "openai.com" },
      { name: "PyBrain", logo: "🧠", link: "pybrain.org" },
      { name: "Caffe", logo: "☕", link: "caffe.berkeleyvision.org" },
    ],
  };

  const data = aiData[category] || aiData["all-categories"];
  return data
    .map(
      (item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="table-logo">${item.logo}</div>
                    </td>
                    <td>${item.name}</td>
                    <td>
                        <a onclick="event.stopPropagation(); navigateToSite('https://${
                          item.link
                        }')" class="table-link">
                            <span class="material-icons">open_in_new</span>
                        </a>
                    </td>
                    <td>
                        <button class="info-button">ⓘ</button>
                    </td>
                </tr>
            `
    )
    .join("");
}

function toggleSidebar(tabId) {
  const sidebar = document.querySelector(`#fake-tab-${tabId} .sidebar`);
  const overlay = document.querySelector(`#fake-tab-${tabId} .sidebar-overlay`);
  if (sidebar && overlay) {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  }
}

function closeSidebar(tabId) {
  const sidebar = document.querySelector(`#fake-tab-${tabId} .sidebar`);
  const overlay = document.querySelector(`#fake-tab-${tabId} .sidebar-overlay`);
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }
}

function switchCategory(tabId, category) {
  const fakeTab = fakeTabs.find((tab) => tab.id === tabId);
  if (!fakeTab) return;

  const tabElement = document.getElementById(`fake-tab-${tabId}`);
  const sidebarLinks = tabElement.querySelectorAll(".sidebar-link");
  const table = tabElement.querySelector(".content-table tbody");
  const header = tabElement.querySelector(".content-header h2");

  // Update active sidebar link
  sidebarLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.category === category) {
      link.classList.add("active");
    }
  });

  // Update table content
  if (fakeTab.type === "dapps") {
    table.innerHTML = getDappsTableContent(category);
    header.textContent =
      category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
  } else if (fakeTab.type === "ai") {
    table.innerHTML = getAiTableContent(category);
    header.textContent =
      category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
  }
}

function switchToFakeTab(tabId) {
  // Hide all fake tabs
  document.querySelectorAll(".fake-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Hide main content
  document.getElementById("homeContent").classList.add("hidden");
  document.getElementById("incognitoHome").classList.remove("active");
  document.getElementById("searchPage").classList.remove("active");
  document.getElementById("browserView").classList.remove("active");

  // Show selected fake tab
  const selectedTab = document.getElementById(`fake-tab-${tabId}`);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  currentView = "fake-tab";
}

function closeFakeTab(tabId) {
  const tabElement = document.getElementById(`fake-tab-${tabId}`);
  if (tabElement) {
    tabElement.classList.add("closing");
    setTimeout(() => {
      tabElement.remove();
      fakeTabs = fakeTabs.filter((tab) => tab.id !== tabId);

      // If this was the active tab, show home
      if (currentView === "fake-tab") {
        const url = document.getElementById("addressBar").value;
        if (url !== "") {
          showBrowser(url);
        } else {
          showHome();
        }
      }
    }, 300);
  }
}

// Tab creation functions
function openWalletTab(walletName) {
  createFakeTab("wallet", walletName);
  toggleWalletDropdown();
}

function openDappsTab() {
  createFakeTab("dapps", "Dapps Menu");
}

function openAiTab() {
  createFakeTab("ai", "AI Menu");
}

// Navigation functions
function navigateToUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes(".") || url.includes(" ")) {
      if (!url.includes(" ")) {
        url = "https://" + url;
      } else {
        url = "https://www.google.com/search?q=" + encodeURIComponent(url);
      }
    } else {
      url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
  }

  showBrowser(url);
  updateCurrentTab(url);
}

function navigateToSite(url) {
  const bookmarksModal = document.getElementById("bookmarksModal");
  if (bookmarksModal && bookmarksModal?.classList.contains("open")) {
    bookmarksModal.classList.remove("open");
  }

  document.querySelectorAll(".sidebar").forEach((sidebar) => {
    sidebar.style.display = "none";
    sidebar.classList.remove("open");
  });

  document.querySelectorAll(".sidebar-overlay").forEach((overlay) => {
    overlay.style.display = "none";
    overlay.classList.remove("open");
  });

  const tabScreen = document.getElementById("tabsScreen");
  if (tabScreen && tabScreen.classList.contains("open")) {
    tabScreen.classList.remove("open");
  }

  document.getElementById("addressBar").value = url;
  navigateToUrl(url);
}

function updateCurrentTab(url) {
  const currentTab = tabs.find((tab) => tab.id === currentTabId);
  if (currentTab) {
    currentTab.url = url;
    const domain = url.replace(/(^\w+:|^)\/\//, "").split("/")[0];
    currentTab.title = domain;
    renderTabs();
    updateTabCount();
  }
}

// View management
function showHome() {
    currentView = "home";

    // Hide all fake tabs
    document.querySelectorAll(".fake-tab").forEach((tab) => {
        tab.classList.remove("active");
    });

    const currentTab = tabs.find((tab) => tab.id === currentTabId);

    if (currentTab && currentTab.isIncognito) {
        document.getElementById("homeContent").classList.add("hidden");
        document.getElementById("incognitoHome").classList.add("active");
        setIncognitoMode(true);
    } else {
        document.getElementById("homeContent").classList.remove("hidden");
        document.getElementById("incognitoHome").classList.remove("active");
        setIncognitoMode(false);
    }

    document.getElementById("searchPage").classList.remove("active");
    document.getElementById("browserView").classList.remove("active");
    document.getElementById("addressBar").value = "";
    
    // Nascondi la barra delle multitab quando si torna alla home
    hideActiveMultitabBar();
    
    updateActiveNav("homeNav");
}

function showSearch() {
  currentView = "search";

  // Hide all fake tabs
  document.querySelectorAll(".fake-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.getElementById("homeContent").classList.add("hidden");
  document.getElementById("incognitoHome").classList.remove("active");
  document.getElementById("searchPage").classList.add("active");
  document.getElementById("browserView").classList.remove("active");
  updateActiveNav("searchNav");
}

function showBrowser(url) {
  currentView = "browser";

  // Hide all fake tabs
  document.querySelectorAll(".fake-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.getElementById("homeContent").classList.add("hidden");
  document.getElementById("incognitoHome").classList.remove("active");
  document.getElementById("searchPage").classList.remove("active");
  document.getElementById("browserView").classList.add("active");

  const iframe = document.getElementById("browserIframe");
  iframe.src = url;

  updateActiveNav("");
}

function setIncognitoMode(incognito) {
  isIncognitoMode = incognito;
  const body = document.body;
  const header = document.getElementById("header");
  const tabsScreen = document.getElementById("tabsScreen");
  const tabsScreenHeader = document.getElementById("tabsScreenHeader");

  if (incognito) {
    body.classList.add("incognito-mode");
    header.classList.add("incognito");
    tabsScreen.classList.add("incognito");
    tabsScreenHeader.classList.add("incognito");
  } else {
    body.classList.remove("incognito-mode");
    header.classList.remove("incognito");
    tabsScreen.classList.remove("incognito");
    tabsScreenHeader.classList.remove("incognito");
  }
}

// Tab management
function toggleTabs() {
  const tabsScreen = document.getElementById("tabsScreen");
  tabsScreen.classList.toggle("open");
  updateTabCount();
}

function closeTabs() {
  document.getElementById("tabsScreen").classList.remove("open");
}

function switchTabsMode(mode) {
    currentTabsMode = mode;
    const singleIcon = document.getElementById("singleTabsIcon");
    const groupIcon = document.getElementById("groupTabsIcon");
    const singleView = document.getElementById("singleTabsView");
    const groupsView = document.getElementById("groupsView");

    if (mode === "single") {
        // Attiva vista single tabs
        singleIcon.classList.add("active");
        groupIcon.classList.remove("active");
        singleView.style.display = "block";
        groupsView.classList.remove("active");
        
        // Nascondi la barra multitab attiva se presente
        hideActiveMultitabBar();
    } else {
        // Attiva vista groups
        groupIcon.classList.add("active");
        singleIcon.classList.remove("active");
        singleView.style.display = "none";
        groupsView.classList.add("active");
    }
}

function initializeTabsView() {
    // Assicurati che la vista corretta sia mostrata all'avvio
    switchTabsMode(currentTabsMode);
}

function initializeMultitabGroups() {
    Object.keys(multitabData).forEach(multitabId => {
        updateMultitabGroupsDisplay(multitabId);
    });
}

function renderTabs() {
  const singleTabsGrid = document.getElementById("singleTabsGrid");
  singleTabsGrid.innerHTML = "";

  tabs.forEach((tab) => {
    const tabItem = document.createElement("div");
    tabItem.className = `single-tab-item ${tab.isIncognito ? "incognito" : ""}`;
    tabItem.onclick = () => navigateToSite("https://" + tab.url);

    tabItem.innerHTML = `
                    <div class="tab-preview ${
                      tab.isIncognito ? "incognito" : ""
                    }">
                        <div class="tab-website-icon">
                            <span class="material-icons" style="font-size: 12px;">${
                              tab.favicon
                            }</span>
                        </div>
                        <div class="tab-close-btn" onclick="event.stopPropagation(); closeTab(${
                          tab.id
                        })">
                            <span class="material-icons" style="font-size: 16px;">close</span>
                        </div>
                    </div>
                    <div class="tab-info-bar">
                        <div class="tab-favicon-small">
                            <span class="material-icons" style="font-size: 8px;">${
                              tab.favicon
                            }</span>
                        </div>
                        <div class="tab-info-text">
                            <div class="tab-title-small">${tab.title}</div>
                            <div class="tab-url-small">${tab.url}</div>
                        </div>
                    </div>
                `;

    singleTabsGrid.appendChild(tabItem);
  });
}

function updateTabCount() {
  const count = tabs.length;
  document.getElementById("tabCountBadge").textContent = count;
  document.getElementById("tabCountBadge2").textContent = count;
}

function addNewTab() {
  const newTab = {
    id: nextTabId++,
    title: "Pearl Browser - Home",
    url: "pearl://home",
    favicon: "home",
    isIncognito: false,
  };

  tabs.push(newTab);
  currentTabId = newTab.id;
  renderTabs();
  updateTabCount();
  showHome();
  closeTabs();
}

function addNewIncognitoTab() {
  const newTab = {
    id: nextTabId++,
    title: "Pearl Browser - Incognito",
    url: "pearl://incognito",
    favicon: "visibility_off",
    isIncognito: true,
  };

  tabs.push(newTab);
  currentTabId = newTab.id;
  renderTabs();
  updateTabCount();
  showHome();
  closeMenu();
}

function closeTab(tabId) {
  const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
  if (tabIndex > -1) {
    tabs.splice(tabIndex, 1);

    if (currentTabId === tabId) {
      if (tabs.length > 0) {
        currentTabId = tabs[Math.max(0, tabIndex - 1)].id;
        showHome();
      } else {
        addNewTab();
      }
    }

    renderTabs();
    updateTabCount();
  }
}

function switchToTab(tabId) {
  currentTabId = tabId;
  const tab = tabs.find((t) => t.id === tabId);

  if (tab) {
    if (tab.url === "pearl://home" || tab.url === "pearl://incognito") {
      showHome();
    } else {
      document.getElementById("addressBar").value = tab.url;
      showBrowser(tab.url);
    }
  }

  closeTabs();
}

// Bookmarks management
function showBookmarks() {
  closeMenu();
  const bookmarksModal = document.getElementById("bookmarksModal");
  bookmarksModal.classList.add("open");
  updateActiveNav("bookmarksNav");
}

function closeBookmarks() {
  document.getElementById("bookmarksModal").classList.remove("open");
}

// Menu management
function toggleMenu() {
  const menuOverlay = document.getElementById("menuOverlay");
  menuOverlay.classList.toggle("open");
}

function closeMenu() {
  document.getElementById("menuOverlay").classList.remove("open");
}

function showSettings() {
  alert("Settings - To be implemented");
}

// Navigation helpers
function updateActiveNav(activeId) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  if (activeId) {
    document.getElementById(activeId).classList.add("active");
  }
}

// Close panels when clicking outside
document.addEventListener("click", function (e) {
  const menuOverlay = document.getElementById("menuOverlay");

  // Close menu if clicking outside
  if (
    menuOverlay.classList.contains("open") &&
    !menuOverlay.contains(e.target) &&
    !document.getElementById("menuNav").contains(e.target)
  ) {
    closeMenu();
  }
});

function showQrScanOverlay() {
  const overlay = document.getElementById("qrScanOverlay");
  overlay.style.display = "block";

  setTimeout(() => {
    let found = false;
    document.querySelectorAll("img").forEach((img) => {
      if (
        (img.alt && img.alt.toLowerCase().includes("qr")) ||
        (img.src && img.src.toLowerCase().includes("qr"))
      ) {
        found = true;
      }
    });

    overlay.style.display = "none";

    if (found) {
      // Qui puoi aggiungere la logica per "trovato" (es: highlight, alert, ecc.)
      Swal.fire({
        icon: "success",
        title: "QR code found!",
        text: "A QR code was detected on this page.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "No QR code found",
        text: "No QR code found on this page.",
      });
    }
  }, 1500); // Durata simulazione scansione
}

// Downloads functions
function showDownloads() {
  closeMenu();
  const downloadsModal = document.getElementById("downloadsModal");
  downloadsModal.classList.add("open");
}

function closeDownloads() {
  document.getElementById("downloadsModal").classList.remove("open");
}

// History functions
function showHistory() {
  closeMenu();
  const historyModal = document.getElementById("historyModal");
  historyModal.classList.add("open");
}

function closeHistory() {
  document.getElementById("historyModal").classList.remove("open");
}

function clearHistory() {
  Swal.fire({
    title: "Clear browsing data?",
    text: "This will remove your browsing history, cookies, and other site data. This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Clear data",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      // Clear the history items
      document.getElementById("historyItemsContainer").innerHTML = `
                        <div style="text-align: center; padding: 40px 20px;">
                            <span class="material-icons" style="font-size: 48px; color: rgba(255, 255, 255, 0.5);">history</span>
                            <h3 style="color: white; margin: 16px 0 8px;">No browsing history</h3>
                            <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                                Pages you visit will appear here
                            </p>
                        </div>
                    `;

      Swal.fire("Cleared!", "Your browsing data has been cleared.", "success");
    }
  });
}

// Handle back button in browser
window.addEventListener("popstate", function (e) {
  if (currentView === "browser") {
    showHome();
  }
});

// Profile management variables
let currentBgColor = "#e53e3e";
let currentFgIcon = "local_hospital";
let userProfile = {
  name: "Default",
  type: "Default",
  theme: "Dark",
  bgColor: "#e53e3e",
  fgIcon: "local_hospital",
  customImage: null,
  wallet: "primary",
};

// Profile type icons mapping
const profileTypeIcons = {
  Default: "person",
  Work: "work",
  Personal: "home",
  Guest: "person_outline",
};

const profileTypeBadges = {
  Default: "☆",
  Work: "W",
  Personal: "P",
  Guest: "G",
};

// Profile Modal Functions
function changeUserAvatar() {
  document.getElementById("profilePictureModal").classList.add("open");
}

function closeProfilePictureModal() {
  document.getElementById("profilePictureModal").classList.remove("open");
}

function switchProfileTab(tab) {
  document
    .querySelectorAll(".profile-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelector(`[onclick="switchProfileTab('${tab}')"]`)
    .classList.add("active");

  if (tab === "icons") {
    document.getElementById("iconsContent").style.display = "block";
    document.getElementById("computerContent").style.display = "none";
  } else {
    document.getElementById("iconsContent").style.display = "none";
    document.getElementById("computerContent").style.display = "block";
  }
}

// Color and Icon Selection Functions
function selectBgColor(color) {
  currentBgColor = color;

  // Update selection visual
  document
    .querySelectorAll(".color-option")
    .forEach((opt) => opt.classList.remove("selected"));
  const selectedOption = document.querySelector(`[data-color="${color}"]`);
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }

  // Update preview
  updateAvatarPreview();
}

function selectFgColor(icon) {
  currentFgIcon = icon;

  // Update selection visual
  document
    .querySelectorAll(".foreground-option")
    .forEach((opt) => opt.classList.remove("selected"));
  const selectedOption = document.querySelector(
    `[onclick="selectFgColor('${icon}')"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }

  // Update preview
  updateAvatarPreview();
}

// Preview and Color Utility Functions
function updateAvatarPreview() {
  const preview = document.getElementById("avatarPreview");
  if (preview) {
    preview.style.background = `linear-gradient(135deg, ${currentBgColor}, ${adjustColor(
      currentBgColor,
      -20
    )})`;
    preview.innerHTML = `<span class="material-icons">${currentFgIcon}</span>`;
  }
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// Picture Validation Functions
function validatePicture() {
  // Update user profile
  userProfile.bgColor = currentBgColor;
  userProfile.fgIcon = currentFgIcon;
  userProfile.customImage = null;

  // Update avatar in menu
  updateUserAvatar();

  closeProfilePictureModal();

  // Success message
  Swal.fire({
    icon: "success",
    title: "Success!",
    text: "Profile picture updated successfully!",
    showConfirmButton: false,
    timer: 1500,
  });
}

function validateUploadedPicture() {
  if (userProfile.customImage) {
    updateUserAvatar();
    closeProfilePictureModal();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Profile picture uploaded successfully!",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

// File Upload Functions
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const uploadedImage = document.getElementById("uploadedImage");
      uploadedImage.src = e.target.result;
      document.getElementById("uploadedPreview").style.display = "block";
      userProfile.customImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Avatar and Profile Update Functions
function updateUserAvatar() {
  const avatar = document.getElementById("userAvatar");
  if (!avatar) return;

  const avatarIcon = avatar.querySelector(".avatar-icon");

  // Remove existing badge
  const existingBadge = avatar.querySelector(".profile-badge");
  if (existingBadge) {
    existingBadge.remove();
  }

  if (userProfile.customImage) {
    // Use custom uploaded image
    avatarIcon.innerHTML = `<img src="${userProfile.customImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    avatar.style.background = "transparent";
  } else {
    // Use icon with background color
    avatarIcon.innerHTML = `<span class="material-icons">${userProfile.fgIcon}</span>`;
    avatar.style.background = `linear-gradient(135deg, ${
      userProfile.bgColor
    }, ${adjustColor(userProfile.bgColor, -20)})`;
  }

  // Add profile type badge
  const badge = document.createElement("div");
  badge.className = `profile-badge ${userProfile.type.toLowerCase()}`;
  badge.textContent = profileTypeBadges[userProfile.type];
  badge.title = `${userProfile.type} Profile`;
  avatar.appendChild(badge);
}

function updateProfileInfo() {
  const userName = document.getElementById("userName");
  const userProfileType = document.getElementById("userProfileType");

  if (userName) {
    userName.textContent = userProfile.name;
  }

  if (userProfileType) {
    userProfileType.innerHTML = `
                    <span class="material-icons profile-type-icon">${
                      profileTypeIcons[userProfile.type]
                    }</span>
                    ${userProfile.type}
                `;
  }
}

// Profile Settings Modal Functions
function showProfileSettings() {
  const profileNameInput = document.getElementById("profileName");
  const profileWalletSelect = document.getElementById("profileWallet");
  const modal = document.getElementById("profileSettingsModal");

  if (!profileNameInput || !profileWalletSelect || !modal) {
    console.error("Profile settings elements not found in DOM");
    return;
  }

  // Popola i valori correnti
  profileNameInput.value = userProfile.name;
  profileWalletSelect.value = userProfile.wallet;

  // Apre il modal
  modal.classList.add("open");
}

function closeProfileSettingsModal() {
  document.getElementById("profileSettingsModal").classList.remove("open");
}

function saveProfileSettings() {
  const nameInput = document.getElementById("profileName");
  const walletSelect = document.getElementById("profileWallet");

  if (!nameInput || !walletSelect) {
    console.error("Profile settings inputs not found");
    return;
  }

  const name = nameInput.value;
  const wallet = walletSelect.value;

  if (!name.trim()) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please enter a valid profile name",
    });
    return;
  }

  // Update profile
  userProfile.name = name;
  userProfile.wallet = wallet;

  // Update UI
  updateProfileInfo();
  updateUserAvatar();

  closeProfileSettingsModal();
  Swal.fire({
    icon: "success",
    title: "Success!",
    text: "Profile settings saved successfully!",
    showConfirmButton: false,
    timer: 1500,
  });
}

// Manage Profiles Modal Functions
function showManageProfiles() {
  document.getElementById("manageProfilesModal").classList.add("open");
}

function closeManageProfilesModal() {
  document.getElementById("manageProfilesModal").classList.remove("open");
}

function switchToProfile(profileId) {
  Swal.fire({
    icon: "success",
    title: "Profile Switched!",
    text: `Switched to ${profileId} profile`,
    showConfirmButton: false,
    timer: 1500,
  });
  // Here you would implement actual profile switching logic
}

function editProfile(profileId) {
  Swal.fire({
    icon: "info",
    title: "Edit Profile",
    text: `Editing ${profileId} profile`,
  });
  // Here you would open profile editing for specific profile
}

function deleteCurrentProfile() {
  Swal.fire({
    title: "Delete Profile?",
    html: `
                    <p style="margin-bottom: 16px;">Deleting this profile related data like history, bookmarks and settings will be lost.</p>
                    <p>All rooms and views related to this profile will be closed and deleted.</p>
                `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#a855f7",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Delete profile",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-wide",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Profile Deleted!",
        text: "The profile has been deleted successfully.",
        showConfirmButton: false,
        timer: 1500,
      });
      closeProfileSettingsModal();
      // Qui implementeresti la logica di cancellazione del profilo
    }
  });
}

function deleteProfile(profileId) {
  Swal.fire({
    title: "Delete Profile?",
    text: `Are you sure you want to delete the ${profileId} profile? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${profileId} profile has been deleted.`,
        showConfirmButton: false,
        timer: 1500,
      });
      // Here you would implement actual profile deletion
    }
  });
}

function addNewProfile() {
  Swal.fire({
    title: "Create New Profile",
    text: "Enter a name for the new profile:",
    input: "text",
    inputPlaceholder: "Profile name...",
    showCancelButton: true,
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Create",
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Please enter a valid name";
      }
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Profile "${result.value}" created successfully!`,
        showConfirmButton: false,
        timer: 1500,
      });
      closeManageProfilesModal();
      // Here you would implement actual profile creation
    }
  });
}

// Reset Upload Function
function resetUpload() {
  document.getElementById("uploadedPreview").style.display = "none";
  document.getElementById("fileInput").value = "";
  userProfile.customImage = null;
}

// Initialization - Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Initialize avatar preview if modal exists
  updateAvatarPreview();
  selectBgColor(currentBgColor);
  selectFgColor(currentFgIcon);

  // Initialize user avatar and profile info
  updateUserAvatar();
  updateProfileInfo();
  Object.keys(multitabData).forEach(multitabId => {
        updateMultitabGroupsDisplay();
    });
});

let currentSelectedMultitab = "";

// Multitab data
const multitabData = {
  sport: {
    name: "Sport",
    color: "#4285f4",
    tabs: [
      { title: "ESPN", url: "espn.com", icon: "sports_soccer" },
      { title: "Sky Sport", url: "skysport.it", icon: "sports_basketball" },
      { title: "La Gazzetta", url: "gazzetta.it", icon: "sports_tennis" },
    ],
  },
  lavoro: {
    name: "Lavoro",
    color: "#666",
    tabs: [
      {
        title: "Microsoft Docs",
        url: "docs.microsoft.com",
        icon: "description",
      },
      { title: "GitHub", url: "github.com", icon: "code" },
      { title: "Stack Overflow", url: "stackoverflow.com", icon: "help" },
      {
        title: "Visual Studio",
        url: "visualstudio.microsoft.com",
        icon: "code",
      },
    ],
  },
};

// Multitab management functions
function selectMultitab(multitabId) {
    // Remove previous selection
    document.querySelectorAll('.multitab-item').forEach((item) => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    const selectedItem = document.querySelector(`[data-multitab="${multitabId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        currentSelectedMultitab = multitabId;
        
        // Se questo multitab è già attivo, mostra la barra
        if (activeMultitab === multitabId) {
            showActiveMultitabBar();
        }
    }
}

function toggleMultitabMenu(multitabId) {
  // Close all other dropdowns
  document.querySelectorAll(".multitab-dropdown").forEach((dropdown) => {
    if (dropdown.id !== `dropdown-${multitabId}`) {
      dropdown.classList.remove("open");
    }
  });

  // Toggle current dropdown
  const dropdown = document.getElementById(`dropdown-${multitabId}`);
  dropdown.classList.toggle("open");
}

function openMultitab(multitabId) {
    const multitab = multitabData[multitabId];
    if (multitab && multitab.tabs.length > 0) {
        activeMultitab = multitabId;
        activeMultitabTabs = [...multitab.tabs];
        showActiveMultitabBar();
        
        // Mostra il modale invece di navigare direttamente
        showMultitabDetails();
    }
    closeAllMultitabMenus();
}

function showActiveMultitabBar() {
    const bar = document.getElementById('activeMultitabBar');
    const multitab = multitabData[activeMultitab];
    
    if (!multitab || !bar) return;
    
    bar.innerHTML = '';
    const section = document.createElement('span');
    section.style.display = 'flex';
    section.style.gap = '0.5em';
    bar.appendChild(section);

    // Bottone per espandere
    const expandBtn = document.createElement('button');
    expandBtn.className = 'open-tabs-btn';
    expandBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="m256-424-56-56 280-280 280 280-56 56-224-223-224 223Z"/></svg>';
    expandBtn.onclick = () => showMultitabDetails();
    section.appendChild(expandBtn);
    
    // Aggiungi le tab attive
    activeMultitabTabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'active-tab-item';
        if (index === 0) tabElement.classList.add('current');
        
        tabElement.innerHTML = `
            <i class="material-icons">${tab.icon}</i>
            <span class="close-tab-x" onclick="event.stopPropagation(); removeTabFromMultitab(${index})" style="display: ${index === 0 ? 'inline-flex' : 'none'};">×</span>
        `;
        
        tabElement.onclick = () => {
            // Rimuovi current da tutte le tab
            document.querySelectorAll('.active-tab-item').forEach(t => t.classList.remove('current'));
            tabElement.classList.add('current');
            
            // Mostra X solo sulla tab corrente
            document.querySelectorAll('.close-tab-x').forEach(x => x.style.display = 'none');
            const closeBtn = tabElement.querySelector('.close-tab-x');
            closeBtn.style.display = 'inline-flex';
            
            if (tab.url) {
                navigateToSite("https://" + tab.url);
            } else {
                navigateToHomeWithMultitab();
            }
        };
        section.appendChild(tabElement);
    });
    
    // Bottone per aggiungere tab
    const addBtn = document.createElement('button');
    addBtn.className = 'add-tab-btn';
    addBtn.innerHTML = '+';
    addBtn.onclick = () => addNewTabToMultitab();
    bar.appendChild(addBtn);
    
    bar.classList.add('show');
}

function removeTabFromMultitab(tabIndex) {
    if (!activeMultitab || tabIndex < 0 || tabIndex >= activeMultitabTabs.length) return;
    
    // Se c'è solo una tab, chiudi il multitab
    if (activeMultitabTabs.length === 1) {
        hideActiveMultitabBar();
        showHome();
        return;
    }
    
    // Rimuovi la tab
    activeMultitabTabs.splice(tabIndex, 1);
    multitabData[activeMultitab].tabs.splice(tabIndex, 1);
    
    // Aggiorna la barra multitab
    showActiveMultitabBar();
    
    // Aggiorna SPECIFICATAMENTE questo multitab nei raggruppamenti
    updateMultitabGroupsDisplay(activeMultitab);
    
    // Se era la tab corrente, attiva la prima disponibile
    const firstTab = activeMultitabTabs[0];
    if (firstTab && firstTab.url) {
        navigateToSite("https://" + firstTab.url);
    } else {
        navigateToHomeWithMultitab();
    }
}

function updateMultitabGroupsDisplay(multitabId = activeMultitab) {
    if (!multitabId || !multitabData[multitabId]) return;
    
    const multitabItem = document.querySelector(`[data-multitab="${multitabId}"]`);
    if (multitabItem) {
        const iconsContainer = multitabItem.querySelector('.multitab-icons');
        if (iconsContainer) {
            iconsContainer.innerHTML = '';
            
            // Mostra tutte le tab (max 3-4 icone)
            const tabsToShow = multitabData[multitabId].tabs.slice(0, 4);
            tabsToShow.forEach((tab, index) => {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'multitab-icon';
                
                // Colori dinamici per le icone
                const colors = ['#1a73e8', '#ea4335', '#34a853', '#fbbc04'];
                iconDiv.style.background = colors[index] || '#666';
                
                iconDiv.innerHTML = `<span class="material-icons">${tab.icon}</span>`;
                iconsContainer.appendChild(iconDiv);
            });
            
            // Se ci sono più di 4 tab, aggiungi un indicatore "+"
            if (multitabData[multitabId].tabs.length > 4) {
                const moreIcon = document.createElement('div');
                moreIcon.className = 'multitab-icon';
                moreIcon.style.background = '#9e9e9e';
                moreIcon.innerHTML = `<span class="material-icons">more_horiz</span>`;
                iconsContainer.appendChild(moreIcon);
            }
        }
    }
}

function hideActiveMultitabBar() {
    const bar = document.getElementById('activeMultitabBar');
    if (bar) {
        bar.classList.remove('show');
    }
    activeMultitab = null;
    activeMultitabTabs = [];
}

function addNewTabToMultitab() {
    if (!activeMultitab) return;
    
    const newTab = {
        title: "Pearl Browser - Home",
        url: "", // URL vuoto per Home
        icon: "home"
    };
    
    // Aggiungi alla lista attiva e ai dati
    activeMultitabTabs.push(newTab);
    multitabData[activeMultitab].tabs.push(newTab);
    
    // Aggiorna la barra multitab
    showActiveMultitabBar();
    
    // Aggiorna SPECIFICATAMENTE questo multitab nei raggruppamenti
    updateMultitabGroupsDisplay(activeMultitab);
    
    // Vai alla home mantenendo il multitab attivo
    navigateToHomeWithMultitab();
    
    // Aggiorna la tab corrente (l'ultima aggiunta)
    setTimeout(() => {
        const activeTabItems = document.querySelectorAll('.active-tab-item');
        activeTabItems.forEach((item, index) => {
            item.classList.toggle('current', index === activeTabItems.length - 1);
            const closeBtn = item.querySelector('.close-tab-x');
            closeBtn.style.display = index === activeTabItems.length - 1 ? 'inline-flex' : 'none';
        });
    }, 100);
}

function navigateToHomeWithMultitab() {
    // Funzione specifica per navigare alla home mantenendo il multitab attivo
    currentView = "home";

    // Hide all fake tabs
    document.querySelectorAll(".fake-tab").forEach((tab) => {
        tab.classList.remove("active");
    });

    const currentTab = tabs.find((tab) => tab.id === currentTabId);

    if (currentTab && currentTab.isIncognito) {
        document.getElementById("homeContent").classList.add("hidden");
        document.getElementById("incognitoHome").classList.add("active");
        setIncognitoMode(true);
    } else {
        document.getElementById("homeContent").classList.remove("hidden");
        document.getElementById("incognitoHome").classList.remove("active");
        setIncognitoMode(false);
    }

    document.getElementById("searchPage").classList.remove("active");
    document.getElementById("browserView").classList.remove("active");
    document.getElementById("addressBar").value = "";
    
    // Mantieni sempre la barra multitab se c'è un multitab attivo
    if (activeMultitab) {
        showActiveMultitabBar();
    }
    
    updateActiveNav("homeNav");
}

function deleteMultitab(multitabId) {
  const multitab = multitabData[multitabId];
  if (!multitab) return;

  const tabCount = multitab.tabs.length;
  const message = tabCount > 0
    ? `Delete "${multitab.name}" with ${tabCount} tab${tabCount > 1 ? "s" : ""}?`
    : `Delete "${multitab.name}"?`;

  // Use SweetAlert instead of ugly confirm()
  Swal.fire({
    title: 'Delete multitab?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true, // Puts "Cancel" on the left
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      content: 'swal-custom-content'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const multitabElement = document.querySelector(`[data-multitab="${multitabId}"]`);
      
      if (multitabElement) {
        // Animate removal
        multitabElement.style.transform = "scale(0)";
        multitabElement.style.opacity = "0";

        setTimeout(() => {
          multitabElement.remove();

          // If the deleted multitab was active, hide the bar
          if (activeMultitab === multitabId) {
            hideActiveMultitabBar();
            showHome();
          }

          if (currentSelectedMultitab === multitabId) {
            currentSelectedMultitab = '';
          }

          // Remove from data as well
          delete multitabData[multitabId];

          // Show success message
          Swal.fire({
            title: 'Deleted!',
            text: `"${multitab.name}" has been successfully deleted.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }, 300);
      }
    }
  });

  closeAllMultitabMenus();
}

function closeAllMultitabMenus() {
  document.querySelectorAll(".multitab-dropdown").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

// Multitab details modal functions
function showMultitabDetails() {
    if (!activeMultitab) {
        if (!currentSelectedMultitab) return;
        activeMultitab = currentSelectedMultitab;
        activeMultitabTabs = [...multitabData[activeMultitab].tabs];
    }

    const multitab = multitabData[activeMultitab];
    if (!multitab) return;

    const modal = document.getElementById("multitabDetailsModal");
    const grid = document.getElementById("multitabDetailsGrid");

    // Clear previous content
    grid.innerHTML = "";

    // Populate with active tabs
    activeMultitabTabs.forEach((tab, index) => {
        const tabElement = document.createElement("div");
        tabElement.className = "multitab-detail-tab";
        tabElement.onclick = () => {
            // Chiudi ENTRAMBI i modali
            closeMultitabDetails();
            closeTabs(); // Chiude anche il tabs screen
            
            // Aggiorna la barra multitab se non è già mostrata
            if (!document.getElementById('activeMultitabBar').classList.contains('show')) {
                showActiveMultitabBar();
            }
            
            // Naviga al sito
            if (tab.url) {
                navigateToSite("https://" + tab.url);
            } else {
                navigateToHomeWithMultitab();
            }
            
            // Update current tab in the bar
            setTimeout(() => {
                document.querySelectorAll('.active-tab-item').forEach((t, i) => {
                    t.classList.toggle('current', i === index);
                    // Mostra X solo sulla tab corrente
                    const closeBtn = t.querySelector('.close-tab-x');
                    if (closeBtn) {
                        closeBtn.style.display = i === index ? 'inline-flex' : 'none';
                    }
                });
            }, 100);
        };

        tabElement.innerHTML = `
            <div class="multitab-tab-preview">
                <span class="material-icons">${tab.icon}</span>
            </div>
            <div class="multitab-tab-info">
                <div class="multitab-tab-favicon">
                    <span class="material-icons" style="font-size: 8px;">${tab.icon}</span>
                </div>
                <div class="multitab-tab-text">
                    <div class="multitab-tab-title">${tab.title}</div>
                    <div class="multitab-tab-url">${tab.url || ''}</div>
                </div>
            </div>
        `;

        grid.appendChild(tabElement);
    });

    modal.classList.add("open");
}

function closeMultitabDetails() {
  document.getElementById("multitabDetailsModal").classList.remove("open");
}

function updatePrivacyStats(blocked = 0, dataSaved = 0, timeSaved = 0) {
  const statsElements = document.querySelectorAll(".privacy-stat-value");
  if (statsElements[0]) statsElements[0].innerHTML = `${blocked}`;
  if (statsElements[1])
    statsElements[1].innerHTML = `${dataSaved}<span style="font-size: 16px;">KB</span>`;
  if (statsElements[2])
    statsElements[2].innerHTML = `${timeSaved}<span style="font-size: 16px;">s</span>`;
}

function simulatePrivacyStats() {
  if (currentSelectedMultitab) {
    const multitab = multitabData[currentSelectedMultitab];
    if (multitab) {
      // Simulate stats based on number of tabs
      const tabCount = multitab.tabs.length;
      const blocked = Math.floor(Math.random() * tabCount * 10);
      const dataSaved = Math.floor(Math.random() * tabCount * 50);
      const timeSaved = Math.floor(Math.random() * tabCount * 2);

      updatePrivacyStats(blocked, dataSaved, timeSaved);
    }
  }
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".multitab-menu")) {
    closeAllMultitabMenus();
  }
});
