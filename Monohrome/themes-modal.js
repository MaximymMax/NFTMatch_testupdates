// themes-modal.js

// Глобальные переменные модуля
let BASE_URL = '';
let PHOTO_URL = '';
let lazyLoadSetup; // Функция для ленивой загрузки

let modalOverlay, modalContent, modalTitle, modalBackButton;
let currentThemes = [];
let currentGift = '';
let currentModel = '';

// --- Новые глобальные переменные ---
let currentView = 'themes'; // 'themes', 'models', 'details'
let currentThemeName = '';
let currentThemeGifts = [];
let currentThemeGroups = [];
let currentSortMode = 'group'; // 'group', 'price', 'count'
let hasColorGroups = false; // ❗️ НОВАЯ ГЛОБАЛЬНАЯ ПЕРЕМЕННАЯ

// Иконка поиска, скопированная из background-finder.js
const searchIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" /></svg>';

// --- Хелперы ---

function getPlural(count, one, few, many) {
    count = Math.abs(count);
    count %= 100;
    if (count >= 5 && count <= 20) {
        return many;
    }
    count %= 10;
    if (count === 1) {
        return one;
    }
    if (count >= 2 && count <= 4) {
        return few;
    }
    return many;
}

function getModelPlural(count) {
    return getPlural(count, 'модель', 'модели', 'моделей');
}

function getGiftPlural(count) {
    return getPlural(count, 'подарок', 'подарка', 'подарков');
}

const tonIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="price-icon" width="24" height="24" viewBox="0 0 24 24"><title>Ton SVG Icon</title><path fill="currentColor" d="M19.012 9.201L12.66 19.316a.857.857 0 0 1-1.453-.005L4.98 9.197a1.8 1.8 0 0 1-.266-.943a1.856 1.856 0 0 1 1.882-1.826h10.817c1.033 0 1.873.815 1.873 1.822a1.8 1.8 0 0 1-.274.951M6.51 8.863l4.633 7.144V8.143H6.994c-.48 0-.694.317-.484.72m6.347 7.144l4.633-7.144c.214-.403-.004-.72-.484-.72h-4.149z"/></svg>`;

// --- Функции API ---

// Эта функция остается для View 1 (Список тематик)

// --- Функции рендеринга ---

function showLoadingState() {
    modalContent.innerHTML = '<div class="themes-modal-spinner"></div>';
    modalContent.classList.add('loading');
}

function hideLoadingState() {
    modalContent.innerHTML = '';
    modalContent.classList.remove('loading');
}

// ❗️ НОВАЯ ФУНКЦИЯ: Создает карточку модели с новыми данными
function createModelCard(gift, sortMode) {
    const card = document.createElement('div');
    card.className = 'model-in-theme-card';
    
    const imageUrl = `${PHOTO_URL}/${encodeURIComponent(gift.GiftName)}/png/${encodeURIComponent(gift.ModelName)}.png`;
    
    let statsHtml = '';
    // ❗️ ИЗМЕНЕНИЕ: priceIcon теперь <img> ❗️
    const priceIcon = tonIconSvg;    
    const countIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3zM2 9.5A1.5 1.5 0 013.5 8h13A1.5 1.5 0 0118 9.5v6.042a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 15.542V9.5z" clip-rule="evenodd" /></svg>`;

    switch (sortMode) {
        case 'price':
            statsHtml = `
                <span class="model-stat-price" title="Цена">
                    ${priceIcon}
                    ${formatPrice(gift.AVGPrice)}
                </span>`;
            break;
        case 'count':
             statsHtml = `
                <span class="model-stat-count" title="Количество">
                    ${countIcon}
                    ${gift.Count}
                </span>`;
            break;
        case 'group':
        default:
            statsHtml = ''; 
            break;
    }
    
    card.innerHTML = `
        <div class="img-wrapper">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
                 data-src="${imageUrl}" 
                 alt="${gift.ModelName}" 
                 class="lazy-load">
        </div>
        <div class="info-wrapper">
            <h4>${gift.ModelName}</h4>
            <p>${gift.GiftName}</p>
            <div class="model-stats">
                ${statsHtml}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        renderModelDetailView(gift, { name: currentThemeName });
    });
    
    return card;
}

// ❗️ НОВАЯ ФУНКЦИЯ: Заполняет сетку на основе сортировки
function populateModelGrid() {
    const container = document.getElementById('tm-models-grid-container');
    if (!container) return;

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    let sortedGifts = [...currentThemeGifts]; 

    if (currentSortMode === 'price') {
        // ❗️ ИСПРАВЛЕНИЕ СОРТИРОВКИ: Обрабатываем null
        sortedGifts.sort((a, b) => (a.AVGPrice ?? Infinity) - (b.AVGPrice ?? Infinity));
        container.className = 'models-in-theme-grid flat-list';
        sortedGifts.forEach(gift => fragment.appendChild(createModelCard(gift, currentSortMode))); // ❗️ Передаем sortMode
    } 
    else if (currentSortMode === 'count') {
        sortedGifts.sort((a, b) => a.Count - b.Count);
        container.className = 'models-in-theme-grid flat-list';
        sortedGifts.forEach(gift => fragment.appendChild(createModelCard(gift, currentSortMode))); // ❗️ Передаем sortMode
    } 
    else { // default is 'group'
        container.className = 'models-in-theme-grid group-list'; 
        
        const groupMap = new Map(currentThemeGroups.map(g => [g.GroupId, g]));
        const giftsByGroup = new Map();

        sortedGifts.forEach(gift => {
            if (!giftsByGroup.has(gift.GroupId)) {
                giftsByGroup.set(gift.GroupId, []);
            }
            giftsByGroup.get(gift.GroupId).push(gift);
        });

        const sortedGroupIds = [...giftsByGroup.keys()].sort((a, b) => {
            if (a === 0) return 1; 
            if (b === 0) return -1; 
            return a - b; 
        });

        sortedGroupIds.forEach((groupId, index) => {
            const groupInfo = groupMap.get(groupId);
            const clusterDiv = document.createElement('div');
            clusterDiv.className = 'theme-group-cluster';

            if (groupInfo && groupInfo.GroupId !== 0 && groupInfo.AverageColorHex) {
                clusterDiv.style.setProperty('--cluster-color', groupInfo.AverageColorHex);
            } else {
                clusterDiv.classList.add('no-color'); 
            }

            // ❗️ Передаем sortMode
            giftsByGroup.get(groupId).forEach(gift => {
                clusterDiv.appendChild(createModelCard(gift, currentSortMode));
            });

            fragment.appendChild(clusterDiv);

            if (index < sortedGroupIds.length - 1) {
                const divider = document.createElement('hr');
                divider.className = 'group-divider';
                fragment.appendChild(divider);
            }
        });
    }

    container.appendChild(fragment);
    lazyLoadSetup(container, modalContent, 'grid');
}

// ❗️ НОВАЯ ФУНКЦИЯ: Рендерит статический UI для View 2
function renderModelListViewUI() {
    hideLoadingState();
    
    const footer = document.querySelector('#themes-modal-overlay .themes-modal-footer');
    if (footer) footer.style.display = 'block';

    // ❗️ НОВАЯ ЛОГИКА: Добавляем <h5 class="tm-content-header">
    modalContent.innerHTML = `
        <label class="tm-sort-label">Сортировать по:</label>
        <div class="tm-sort-controls">
            <button class="tm-sort-button" data-sort="group" id="tm-sort-btn-group">По цветам</button>
            <button class="tm-sort-button" data-sort="price">По цене</button>
            <button class="tm-sort-button" data-sort="count">По кол-ву</button>
        </div>
        <div id="tm-models-grid-container" class="models-in-theme-grid">
            </div>
    `;

    // (Остальная часть функции остается без изменений)
    const groupSortBtn = document.getElementById('tm-sort-btn-group');
    if (!hasColorGroups) {
        groupSortBtn.disabled = true;
    }

    modalContent.querySelectorAll('.tm-sort-button').forEach(btn => {
        if (btn.dataset.sort === currentSortMode) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            modalContent.querySelectorAll('.tm-sort-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSortMode = btn.dataset.sort;
            populateModelGrid(); 
        });
    });
}

function formatPrice(price) {
    if (price === null || price === undefined) {
        return 'N/A';
    }
    if (price >= 1000) {
        // Делим на 1000 и оставляем 1 знак после запятой
        return (price / 1000).toFixed(1) + 'k';
    }
    // Убираем .00
    if (Number.isInteger(price)) {
        return price;
    }
    // Оставляем 2 знака для мелочи (напр. 2.47)
    return price.toFixed(2);
}

// ❗️ НОВАЯ ФУНКЦИЯ: Загрузчик для View 2
async function loadAndRenderModelView(themeName) {
    showLoadingState();
    modalTitle.textContent = `Тематика: ${themeName}`;
    modalBackButton.classList.remove('hidden');
    currentView = 'models';
    currentThemeName = themeName; // Сохраняем имя темы

    const url = `${BASE_URL}/api/BaseInfo/GetGiftsByCollection/${encodeURIComponent(themeName)}/WithParameters`;
    console.log(`[Themes Modal] Загрузка данных... URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json(); 
        console.log("[Themes Modal] Данные JSON получены:", data);

        // ❗️❗️ ИСПРАВЛЕНИЕ: Используем 'Gifts' и 'Groups' (с большой буквы) ❗️❗️
        currentThemeGifts = (data && Array.isArray(data.Gifts)) ? data.Gifts : [];
        currentThemeGroups = (data && Array.isArray(data.Groups)) ? data.Groups : [];

        hasColorGroups = currentThemeGroups.some(g => g.GroupId !== 0 && g.AverageColorHex);

        if (!hasColorGroups) {
            currentSortMode = 'price';
        } else {
            currentSortMode = 'group'; 
        }

        console.log(`[Themes Modal] Парсинг завершен. Gifts: ${currentThemeGifts.length}, Groups: ${currentThemeGroups.length}, HasColorGroups: ${hasColorGroups}`);

        renderModelListViewUI();
        populateModelGrid();

    } catch (error) {
        console.error(`[Themes Modal] КРИТИЧЕСКАЯ ОШИБКА в loadAndRenderModelView:`, error);
        hideLoadingState();
        modalContent.innerHTML = '<p style="text-align: center; color: #f87171;">Не удалось загрузить данные о моделях. (см. консоль)</p>';
    }
}


/**
 * Рендерит View 1: Список тематик (Почти без изменений)
 */
async function renderThemeListView() {
    showLoadingState();
    modalTitle.textContent = `${currentGift} - ${currentModel}`;
    modalBackButton.classList.add('hidden');
    currentView = 'themes';

    const footer = document.querySelector('#themes-modal-overlay .themes-modal-footer');
    if (footer) footer.style.display = 'block';

    hideLoadingState();
    const grid = document.createElement('div');
    grid.className = 'themes-grid';

    // ❗️❗️ ИСПРАВЛЕНИЕ: Убираем вызов fetchThemeData и используем currentThemes ❗️❗️
    currentThemes.forEach(collection => {
        const card = document.createElement('div');
        card.className = 'theme-card-stylized'; // Используем этот класс

        if (collection.ClusterAverageColorHex) {
            card.style.setProperty('--cluster-color', collection.ClusterAverageColorHex);
        } else {
            card.classList.add('no-color');
        }

        // 1. Градиент
        const gradientBg = document.createElement('div');
        gradientBg.className = 'theme-gradient-bg';

        // 2. "Вылетающие" картинки
        const flyout = document.createElement('div');
        flyout.className = 'theme-model-flyout';
        
        collection.TopGifts.slice(2, 5).forEach((gift, index) => {
            const img = document.createElement('img');
            img.src = `${PHOTO_URL}/${encodeURIComponent(gift.GiftName)}/png/${encodeURIComponent(gift.ModelName)}.png`;
            img.alt = gift.ModelName;
            img.className = `model-img-${index + 3}`; // ⬅️ ИЗМЕНЕНИЕ (index + 3)
            flyout.appendChild(img);
        });

        // ❗️ 3. ИЗМЕНЕНИЕ: Новая структура для правой колонки ❗️
        const rightCol = document.createElement('div');
        rightCol.className = 'theme-card-right-col';

        // Контейнер для текста
        const infoDiv = document.createElement('div');
        infoDiv.className = 'theme-card-stylized-info';

        const title = document.createElement('h3');
        title.textContent = collection.CollectionName;
        
        const subtitle = document.createElement('p');
        // Считаем сумму 'Count' из TopGifts
        const modelCount = collection.CountGiftsInTheme;
        subtitle.textContent = `${modelCount} ${getModelPlural(modelCount)}`; 
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(subtitle);

        // Стрелка
        const arrow = document.createElement('div');
        arrow.className = 'theme-card-arrow';
        arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                           </svg>`;
        
        // Собираем правую колонку
        rightCol.appendChild(infoDiv);
        rightCol.appendChild(arrow);

        // Собираем карточку
        card.appendChild(gradientBg);
        card.appendChild(flyout);
        card.appendChild(rightCol); // ⬅️ Добавляем правую колонку
        
        card.addEventListener('click', () => {
            loadAndRenderModelView(collection.CollectionName);
        });
        
        grid.appendChild(card);
    });

    modalContent.appendChild(grid);
    loadAndRenderSimilarGiftsCard(grid, currentGift, currentModel);
}

async function loadAndRenderSimilarGiftsCard(gridContainer, giftName, modelName) {
    const url = `${BASE_URL}/api/BaseInfo/GetSimilarGiftsForVisualization/${encodeURIComponent(giftName)}/${encodeURIComponent(modelName)}`;
    console.log(`[Themes Modal] Загрузка похожих гифтов... URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data || !data.SimilarGifts || data.SimilarGifts.length === 0) {
            console.log("[Themes Modal] Похожие гифты не найдены.");
            return;
        }

        console.log("[Themes Modal] Похожие гифты получены:", data);

        // 1. Создаем разделитель
        const divider = document.createElement('hr');
        divider.className = 'theme-divider-line';

        // 2. Создаем карточку
        const card = document.createElement('div');
        card.className = 'theme-card-stylized';

        if (data.TargetGiftMainColorHex) {
            card.style.setProperty('--cluster-color', data.TargetGiftMainColorHex);
        } else {
            card.classList.add('no-color');
        }

        // 3. Градиент
        const gradientBg = document.createElement('div');
        gradientBg.className = 'theme-gradient-bg';

        // 4. "Вылетающие" картинки
        const flyout = document.createElement('div');
        flyout.className = 'theme-model-flyout';
        
        data.SimilarGifts.slice(2, 5).forEach((gift, index) => {
            const img = document.createElement('img');
            img.src = `${PHOTO_URL}/${encodeURIComponent(gift.GiftName)}/png/${encodeURIComponent(gift.ModelName)}.png`;
            img.alt = gift.ModelName;
            img.className = `model-img-${index + 3}`; // ⬅️ ИЗМЕНЕНИЕ (index + 3)
            flyout.appendChild(img);
        });

        // 5. Правая колонка (Текст + Стрелка)
        const rightCol = document.createElement('div');
        rightCol.className = 'theme-card-right-col';

        // Контейнер для текста
        const infoDiv = document.createElement('div');
        infoDiv.className = 'theme-card-stylized-info';

        const title = document.createElement('h3');
        title.textContent = "Похожие"; // ⬅️ Текст
        
        const subtitle = document.createElement('p');
        subtitle.textContent = "по цвету"; // ⬅️ Текст
        subtitle.style.color = "var(--text-primary)";
        infoDiv.appendChild(title);
        infoDiv.appendChild(subtitle);

        // Стрелка
        const arrow = document.createElement('div');
        arrow.className = 'theme-card-arrow';
        arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                           </svg>`;
        
        // Собираем правую колонку
        rightCol.appendChild(infoDiv);
        rightCol.appendChild(arrow);

        // Собираем карточку
        card.appendChild(gradientBg);
        card.appendChild(flyout);
        card.appendChild(rightCol);
        
        // 6. Навигация
        const destUrl = `/nft-page/index.html?giftName=${encodeURIComponent(giftName)}&modelName=${encodeURIComponent(modelName)}&randomGiftsCount=10`;
        
        card.addEventListener('click', () => {
            window.location.href = destUrl;
        });
        
        // 7. Добавляем в DOM
        gridContainer.appendChild(divider);
        gridContainer.appendChild(card);

    } catch (error) {
        console.error(`[Themes Modal] Ошибка при загрузке похожих гифтов:`, error);
        // Ничего не показываем, если ошибка
    }
}

async function renderSimilarGiftsButtonForDetailView(container, giftName, modelName) {
    // Показываем мини-спиннер
    container.innerHTML = `
        <span style="font-size: 0.9rem; color: var(--text-muted); display: block; text-align: center; margin-top: 1rem;">
            <span class="loading-spinner-mini" style="width:14px; height: 14px; border-width: 2px;"></span>
            Загрузка...
        </span>`;

    const url = `${BASE_URL}/api/BaseInfo/GetSimilarGiftsForVisualization/${encodeURIComponent(giftName)}/${encodeURIComponent(modelName)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response error');
        
        const data = await response.json();
        if (!data || !data.SimilarGifts || data.SimilarGifts.length < 2) {
            throw new Error('Not enough similar gifts found');
        }

        const link = document.createElement('a');
        link.href = `/nft-page/index.html?giftName=${encodeURIComponent(giftName)}&modelName=${encodeURIComponent(modelName)}&randomGiftsCount=10`;
        link.id = 'show-themes-link'; // Используем ID для стилей
        link.className = 'similar-fallback-style'; // Используем класс для стилей

        const color = data.TargetGiftMainColorHex || '#38bdf8';
        link.style.setProperty('--similar-color', color);

        const imgLeftSrc = `${PHOTO_URL}/${encodeURIComponent(data.SimilarGifts[0].GiftName)}/png/${encodeURIComponent(data.SimilarGifts[0].ModelName)}.png`;
        const imgRightSrc = `${PHOTO_URL}/${encodeURIComponent(data.SimilarGifts[1].GiftName)}/png/${encodeURIComponent(data.SimilarGifts[1].ModelName)}.png`;

        link.innerHTML = `
            <div class="fallback-glow"></div>
            <img src="${imgLeftSrc}" alt="similar 1" class="fallback-img left">
            <span>Похожие по цвету</span>
            <img src="${imgRightSrc}" alt="similar 2" class="fallback-img right">
        `;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.href;
        });
        
        container.innerHTML = ''; // Очищаем спиннер
        container.appendChild(link);
        
    } catch (error) {
        console.warn("[Similar Button Fallback] Ошибка:", error.message);
        container.innerHTML = ''; // Ничего не показываем, если ошибка
    }
}

/**
 * Рендерит View 3: Детали (Без изменений, но заголовок теперь ставится из themeData)
 */
function renderModelDetailView(modelData, themeData) {
    currentView = 'details';
    showLoadingState();
    
    modalTitle.textContent = themeData.name; 
    modalBackButton.classList.remove('hidden');

    const footer = document.querySelector('#themes-modal-overlay .themes-modal-footer');
    if (footer) footer.style.display = 'none';

    const lottieUrl = `${PHOTO_URL}/${encodeURIComponent(modelData.GiftName)}/lottie/${encodeURIComponent(modelData.ModelName)}.json`;
    const linkUrl = `background-finder.html?mode=findBgs&gift=${encodeURIComponent(modelData.GiftName)}&model=${encodeURIComponent(modelData.ModelName)}`;
    
    hideLoadingState();
    
    const priceIconHtml = tonIconSvg;

    // ❗️ ИЗМЕНЕНИЕ: Добавлен div #tm-similar-gifts-container
    modalContent.innerHTML = `
        <div class="modal-photo-container">
            <lottie-player
                src="${lottieUrl}"
                background="transparent"
                speed="1"
                loop
                autoplay
            ></lottie-player>
        </div>
        <div class="modal-info">
            <div class="info-row">
                <span class="info-label">Коллекция:</span>
                <span class="info-value">${modelData.GiftName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Модель:</span>
                <span class="info-value">${modelData.ModelName}</span>
                
                <a id="tm-find-backgrounds-btn" class="modal-context-button" title="Найти лучшие фоны для этой модели">
                    ${searchIcon}
                    <span>Лучшие фоны</span>
                </a>
            </div>
            
            <div class="info-row">
                <span class="info-label">Цена:</span>
                <span class="info-value price">${formatPrice(modelData.AVGPrice)} ${priceIconHtml}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Количество:</span>
                <span class="info-value count">${modelData.Count}</span>
            </div>
        </div>
        <div id="tm-similar-gifts-container"></div> 
    `;

    const findBgsBtn = document.getElementById('tm-find-backgrounds-btn');
    if (findBgsBtn) {
        findBgsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            close(); 
            window.location.href = linkUrl; 
        });
    }

    // ❗️ ИЗМЕНЕНИЕ: Добавлен вызов функции для рендера кнопки "Похожие"
    const similarContainer = document.getElementById('tm-similar-gifts-container');
    if (similarContainer) {
        renderSimilarGiftsButtonForDetailView(similarContainer, modelData.GiftName, modelData.ModelName);
    }
}

// --- Публичные методы ---

function open(themes, giftName, modelName) {
    document.body.classList.add('modal-open'); 
    if (!modalOverlay) {
        console.error("Модальное окно тематик не инициализировано.");
        return;
    }
    currentThemes = themes;
    currentGift = giftName;
    currentModel = modelName;
    
    modalOverlay.classList.remove('hidden');
    renderThemeListView();
}

function close() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    hideLoadingState(); 
    document.body.classList.remove('modal-open');

    const footer = document.querySelector('#themes-modal-overlay .themes-modal-footer');
    if (footer) footer.style.display = 'block';
}

/**
 * Инициализация (Обновлена логика кнопки "Назад")
 */
function init(baseUrl, photoUrl, lazyLoaderFunc) {
    BASE_URL = baseUrl;
    PHOTO_URL = photoUrl;
    lazyLoadSetup = lazyLoaderFunc;

    const modalHtml = `
        <div id="themes-modal-overlay" class="modal-overlay hidden">
            <div class="themes-modal">
                <div class="themes-modal-header">
                    <div class="themes-modal-top-row">
                        <button id="themes-modal-back-btn" class="themes-modal-back-btn hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            Назад
                        </button>
                        <button id="themes-modal-close-btn" class="themes-modal-close-btn">&times;</button>
                    </div>
                    <h3 id="themes-modal-title" class="themes-modal-title"></h3>
                </div>
                <div id="themes-modal-content" class="themes-modal-content">
                </div>
                <div class="themes-modal-footer">
                    <span>by <a href="https://t.me/GiftStat" target="_blank" rel="noopener noreferrer">@GiftStat</a></span>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    modalOverlay = document.getElementById('themes-modal-overlay');
    modalContent = document.getElementById('themes-modal-content');
    modalTitle = document.getElementById('themes-modal-title');
    modalBackButton = document.getElementById('themes-modal-back-btn');
    const closeButton = document.getElementById('themes-modal-close-btn');

    closeButton.addEventListener('click', close);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            close();
        }
    });
    
    // ❗️ ОБНОВЛЕННАЯ ЛОГИКА КНОПКИ "НАЗАД"
    modalBackButton.addEventListener('click', () => {
        if (currentView === 'details') {
            // Возвращаемся к списку моделей
            currentView = 'models';
            modalTitle.textContent = `${currentThemeName}`;
            renderModelListViewUI(); // Рендерим кнопки
            populateModelGrid(); // Рендерим сетку (сохранится последняя сортировка)
        } else if (currentView === 'models') {
            // Возвращаемся к списку тематик
            renderThemeListView(); // Эта функция сама выставит currentView = 'themes'
        }
    });
    
    console.log("Модальное окно тематик инициализировано.");
}

// 4. Экспортируем публичные методы в глобальный объект
window.themesModal = {
    init,
    open,
    close
};