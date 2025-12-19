document.addEventListener('DOMContentLoaded', () => {

    // --- КОНФИГУРАЦИЯ ---
    const SERVER_BASE_URL = 'https://nftmatchbot20250730152328.azurewebsites.net';
    const API_PHOTO_URL = 'https://cdn.changes.tg/gifts/models';
    const INIT_DATA_KEY = 'tgInitData';
    const BYPASS_KEY_STORAGE = 'apiBypassKey';

    const fixedColors = [
        { id: 'Amber', name: 'Amber', hex: '#DAB345', gradient: 'radial-gradient(circle, rgb(218, 179, 69) 0%, rgb(177, 128, 42) 100%)' },
        { id: 'Aquamarine', name: 'Aquamarine', hex: '#60B195', gradient: 'radial-gradient(circle, rgb(96, 177, 149) 0%, rgb(70, 171, 180) 100%)' },
        { id: 'AzureBlue', name: 'Azure Blue', hex: '#5DB1CB', gradient: 'radial-gradient(circle, rgb(93, 177, 203) 0%, rgb(68, 139, 171) 100%)' },
        { id: 'BattleshipGrey', name: 'Battleship Grey', hex: '#8C8C85', gradient: 'radial-gradient(circle, rgb(140, 140, 133) 0%, rgb(108, 108, 102) 100%)' },
        { id: 'Black', name: 'Black', hex: '#363738', gradient: 'radial-gradient(circle, rgb(54, 55, 56) 0%, rgb(14, 15, 15) 100%)' },
        { id: 'Burgundy', name: 'Burgundy', hex: '#A35E66', gradient: 'radial-gradient(circle, rgb(163, 94, 102) 0%, rgb(109, 65, 74) 100%)' },
        { id: 'BurntSienna', name: 'Burnt Sienna', hex: '#D66F3C', gradient: 'radial-gradient(circle, rgb(214, 111, 60) 0%, rgb(181, 75, 45) 100%)' },
        { id: 'CamoGreen', name: 'Camo Green', hex: '#75944D', gradient: 'radial-gradient(circle, rgb(117, 148, 77) 0%, rgb(84, 115, 65) 100%)' },
        { id: 'Cappuccino', name: 'Cappuccino', hex: '#B1907E', gradient: 'radial-gradient(circle, rgb(177, 144, 126) 0%, rgb(124, 99, 86) 100%)' },
        { id: 'Caramel', name: 'Caramel', hex: '#D09932', gradient: 'radial-gradient(circle, rgb(208, 153, 50) 0%, rgb(183, 116, 49) 100%)' },
        { id: 'Carmine', name: 'Carmine', hex: '#E0574A', gradient: 'radial-gradient(circle, rgb(224, 87, 74) 0%, rgb(168, 56, 59) 100%)' },
        { id: 'CarrotJuice', name: 'Carrot Juice', hex: '#DB9867', gradient: 'radial-gradient(circle, rgb(219, 152, 103) 0%, rgb(199, 111, 79) 100%)' },
        { id: 'CelticBlue', name: 'Celtic Blue', hex: '#49B8ED', gradient: 'radial-gradient(circle, rgb(69, 184, 237) 0%, rgb(56, 134, 217) 100%)' },
        { id: 'Chestnut', name: 'Chestnut', hex: '#BE6F54', gradient: 'radial-gradient(circle, rgb(190, 111, 84) 0%, rgb(153, 72, 56) 100%)' },
        { id: 'Chocolate', name: 'Chocolate', hex: '#A46E58', gradient: 'radial-gradient(circle, rgb(164, 110, 88) 0%, rgb(116, 68, 59) 100%)' },
        { id: 'CobaltBlue', name: 'Cobalt Blue', hex: '#6088CF', gradient: 'radial-gradient(circle, rgb(96, 136, 207) 0%, rgb(81, 98, 184) 100%)' },
        { id: 'Copper', name: 'Copper', hex: '#D08656', gradient: 'radial-gradient(circle, rgb(208, 134, 86) 0%, rgb(157, 101, 49) 100%)' },
        { id: 'CoralRed', name: 'Coral Red', hex: '#DA896B', gradient: 'radial-gradient(circle, rgb(218, 137, 107) 0%, rgb(196, 101, 79) 100%)' },
        { id: 'Cyberpunk', name: 'Cyberpunk', hex: '#858BF3', gradient: 'radial-gradient(circle, rgb(133, 143, 243) 0%, rgb(134, 95, 211) 100%)' },
        { id: 'DarkGreen', name: 'Dark Green', hex: '#516341', gradient: 'radial-gradient(circle, rgb(81, 99, 65) 0%, rgb(43, 69, 47) 100%)' },
        { id: 'DarkLilac', name: 'DarkLilac', hex: '#B17DA5', gradient: 'radial-gradient(circle, rgb(177, 125, 165) 0%, rgb(140, 87, 122) 100%)' },
        { id: 'DeepCyan', name: 'Deep Cyan', hex: '#31B5AA', gradient: 'radial-gradient(circle, rgb(49, 181, 170) 0%, rgb(24, 149, 153) 100%)' },
        { id: 'DesertSand', name: 'Desert Sand', hex: '#B39F82', gradient: 'radial-gradient(circle, rgb(179, 159, 130) 0%, rgb(126, 115, 91) 100%)' },
        { id: 'ElectricIndigo', name: 'Electric Indigo', hex: '#A980F3', gradient: 'radial-gradient(circle, rgb(169, 128, 243) 0%, rgb(91, 98, 216) 100%)' },
        { id: 'ElectricPurple', name: 'Electric Purple', hex: '#CA70C6', gradient: 'radial-gradient(circle, rgb(202, 112, 198) 0%, rgb(150, 98, 212) 100%)' },
        { id: 'Emerald', name: 'Emerald', hex: '#78C585', gradient: 'radial-gradient(circle, rgb(120, 197, 133) 0%, rgb(66, 161, 113) 100%)' },
        { id: 'EnglishViolet', name: 'English Violet', hex: '#B186BB', gradient: 'radial-gradient(circle, rgb(177, 134, 187) 0%, rgb(135, 90, 145) 100%)' },
        { id: 'Fandango', name: 'Fandango', hex: '#E28AB6', gradient: 'radial-gradient(circle, rgb(226, 138, 182) 0%, rgb(164, 88, 139) 100%)' },
        { id: 'Feldgrau', name: 'Feldgrau', hex: '#899288', gradient: 'radial-gradient(circle, rgb(137, 146, 136) 0%, rgb(94, 107, 99) 100%)' },
        { id: 'FireEngine', name: 'Fire Engine', hex: '#F05F4F', gradient: 'radial-gradient(circle, rgb(240, 95, 79) 0%, rgb(196, 57, 73) 100%)' },
        { id: 'FrenchBlue', name: 'French Blue', hex: '#5C9BC4', gradient: 'radial-gradient(circle, rgb(92, 155, 196) 0%, rgb(55, 115, 154) 100%)' },
        { id: 'FrenchViolet', name: 'French Violet', hex: '#C260E6', gradient: 'radial-gradient(circle, rgb(194, 96, 230) 0%, rgb(145, 78, 217) 100%)' },
        { id: 'Grape', name: 'Grape', hex: '#9D73C1', gradient: 'radial-gradient(circle, rgb(157, 116, 193) 0%, rgb(121, 77, 160) 100%)' },
        { id: 'Gunmetal', name: 'Gunmetal', hex: '#4C5D63', gradient: 'radial-gradient(circle, rgb(76, 93, 99) 0%, rgb(47, 59, 66) 100%)' },
        { id: 'GunshipGreen', name: 'Gunship Green', hex: '#558A65', gradient: 'radial-gradient(circle, rgb(85, 138, 101) 0%, rgb(61, 102, 87) 100%)' },
        { id: 'HunterGreen', name: 'Hunter Green', hex: '#8FA078', gradient: 'radial-gradient(circle, rgb(143, 174, 120) 0%, rgb(75, 130, 91) 100%)' },
        { id: 'IndigoDye', name: 'Indigo Dye', hex: '#537991', gradient: 'radial-gradient(circle, rgb(83, 121, 145) 0%, rgb(65, 100, 121) 100%)' },
        { id: 'IvoryWhite', name: 'Ivory White', hex: '#BABAD1', gradient: 'radial-gradient(circle, rgb(186, 182, 177) 0%, rgb(161, 157, 151) 100%)' },
        { id: 'JadeGreen', name: 'Jade Green', hex: '#55C49C', gradient: 'radial-gradient(circle, rgb(85, 196, 156) 0%, rgb(59, 153, 119) 100%)' },
        { id: 'KhakiGreen', name: 'Khaki Green', hex: '#ADAE70', gradient: 'radial-gradient(circle, rgb(173, 176, 112) 0%, rgb(107, 125, 84) 100%)' },
        { id: 'Lavender', name: 'Lavender', hex: '#B789E4', gradient: 'radial-gradient(circle, rgb(183, 137, 228) 0%, rgb(138, 90, 188) 100%)' },
        { id: 'Lemongrass', name: 'Lemongrass', hex: '#AEB85A', gradient: 'radial-gradient(circle, rgb(174, 184, 90) 0%, rgb(85, 147, 69) 100%)' },
        { id: 'LightOlive', name: 'Light Olive', hex: '#C2AF64', gradient: 'radial-gradient(circle, rgb(194, 175, 100) 0%, rgb(136, 126, 69) 100%)' },
        { id: 'Malachite', name: 'Malachite', hex: '#95B457', gradient: 'radial-gradient(circle, rgb(149, 180, 87) 0%, rgb(61, 151, 85) 100%)' },
        { id: 'MarineBlue', name: 'Marine Blue', hex: '#4E689C', gradient: 'radial-gradient(circle, rgb(78, 104, 156) 0%, rgb(59, 75, 122) 100%)' },
        { id: 'MexicanPink', name: 'Mexican Pink', hex: '#E36692', gradient: 'radial-gradient(circle, rgb(227, 102, 146) 0%, rgb(201, 73, 124) 100%)' },
        { id: 'MidnightBlue', name: 'Midnight Blue', hex: '#5C6985', gradient: 'radial-gradient(circle, rgb(92, 105, 133) 0%, rgb(53, 64, 87) 100%)' },
        { id: 'MintGreen', name: 'Mint Green', hex: '#7ECA82', gradient: 'radial-gradient(circle, rgb(126, 203, 130) 0%, rgb(69, 158, 90) 100%)' },
        { id: 'Moonstone', name: 'Moonstone', hex: '#7EB1B4', gradient: 'radial-gradient(circle, rgb(126, 177, 180) 0%, rgb(88, 131, 144) 100%)' },
        { id: 'Mustard', name: 'Mustard', hex: '#D4980D', gradient: 'radial-gradient(circle, rgb(212, 152, 13) 0%, rgb(196, 119, 18) 100%)' },
        { id: 'MysticPearl', name: 'Mystic Pearl', hex: '#D08B6D', gradient: 'radial-gradient(circle, rgb(208, 139, 109) 0%, rgb(176, 87, 112) 100%)' },
        { id: 'NavyBlue', name: 'Navy Blue', hex: '#6C9EDD', gradient: 'radial-gradient(circle, rgb(108, 158, 221) 0%, rgb(92, 110, 201) 100%)' },
        { id: 'NeonBlue', name: 'Neon Blue', hex: '#7596F9', gradient: 'radial-gradient(circle, rgb(117, 150, 249) 0%, rgb(104, 98, 228) 100%)' },
        { id: 'OldGold', name: 'Old Gold', hex: '#B58D38', gradient: 'radial-gradient(circle, rgb(181, 141, 56) 0%, rgb(148, 105, 37) 100%)' },
        { id: 'OnyxBlack', name: 'Onyx Black', hex: '#4D5254', gradient: 'radial-gradient(circle, rgb(77, 82, 84) 0%, rgb(49, 54, 56) 100%)' },
        { id: 'Orange', name: 'Orange', hex: '#D19A3A', gradient: 'radial-gradient(circle, rgb(209, 154, 58) 0%, rgb(192, 111, 71) 100%)' },
        { id: 'PacificCyan', name: 'Pacific Cyan', hex: '#5ABEA6', gradient: 'radial-gradient(circle, rgb(90, 190, 166) 0%, rgb(61, 149, 186) 100%)' },
        { id: 'PacificGreen', name: 'Pacific Green', hex: '#6FC793', gradient: 'radial-gradient(circle, rgb(111, 199, 147) 0%, rgb(59, 156, 132) 100%)' },
        { id: 'Persimmon', name: 'Persimmon', hex: '#E7A75A', gradient: 'radial-gradient(circle, rgb(231, 167, 90) 0%, rgb(197, 103, 95) 100%)' },
        { id: 'PineGreen', name: 'Pine Green', hex: '#6DA97C', gradient: 'radial-gradient(circle, rgb(107, 169, 124) 0%, rgb(62, 121, 112) 100%)' },
        { id: 'Pistachio', name: 'Pistachio', hex: '#97B07C', gradient: 'radial-gradient(circle, rgb(151, 176, 124) 0%, rgb(92, 129, 76) 100%)' },
        { id: 'Platinum', name: 'Platinum', hex: '#B2AEAD', gradient: 'radial-gradient(circle, rgb(178, 174, 167) 0%, rgb(136, 132, 126) 100%)' },
        { id: 'PureGold', name: 'Pure Gold', hex: '#CCAB41', gradient: 'radial-gradient(circle, rgb(204, 171, 65) 0%, rgb(152, 123, 50) 100%)' },
        { id: 'Purple', name: 'Purple', hex: '#AE6EAE', gradient: 'radial-gradient(circle, rgb(174, 108, 174) 0%, rgb(132, 71, 132) 100%)' },
        { id: 'RangerGreen', name: 'Ranger Green', hex: '#5F7849', gradient: 'radial-gradient(circle, rgb(95, 120, 73) 0%, rgb(60, 79, 59) 100%)' },
        { id: 'Raspberry', name: 'Raspberry', hex: '#E07B85', gradient: 'radial-gradient(circle, rgb(224, 123, 133) 0%, rgb(182, 89, 128) 100%)' },
        { id: 'RifleGreen', name: 'Rifle Green', hex: '#64695C', gradient: 'radial-gradient(circle, rgb(100, 105, 92) 0%, rgb(75, 82, 65) 100%)' },
        { id: 'RomanSilver', name: 'Roman Silver', hex: '#A3A8B5', gradient: 'radial-gradient(circle, rgb(163, 168, 181) 0%, rgb(124, 128, 138) 100%)' },
        { id: 'Rosewood', name: 'Rosewood', hex: '#B77A77', gradient: 'radial-gradient(circle, rgb(183, 122, 119) 0%, rgb(129, 76, 82) 100%)' },
        { id: 'Sapphire', name: 'Sapphire', hex: '#58A3C8', gradient: 'radial-gradient(circle, rgb(88, 163, 200) 0%, rgb(83, 121, 194) 100%)' },
        { id: 'SatinGold', name: 'Satin Gold', hex: '#BF9B47', gradient: 'radial-gradient(circle, rgb(191, 155, 71) 0%, rgb(141, 119, 57) 100%)' },
        { id: 'SealBrown', name: 'Seal Brown', hex: '#664D45', gradient: 'radial-gradient(circle, rgb(102, 77, 69) 0%, rgb(71, 54, 46) 100%)' },
        { id: 'ShamrockGreen', name: 'Shamrock Green', hex: '#8AB163', gradient: 'radial-gradient(circle, rgb(138, 177, 99) 0%, rgb(85, 147, 69) 100%)' },
        { id: 'SilverBlue', name: 'Silver Blue', hex: '#80A4B8', gradient: 'radial-gradient(circle, rgb(128, 164, 184) 0%, rgb(96, 124, 145) 100%)' },
        { id: 'SkyBlue', name: 'Sky Blue', hex: '#58B4C8', gradient: 'radial-gradient(circle, rgb(88, 180, 200) 0%, rgb(83, 139, 194) 100%)' },
        { id: 'SteelGrey', name: 'Steel Grey', hex: '#97A2AC', gradient: 'radial-gradient(circle, rgb(151, 162, 172) 0%, rgb(99, 114, 124) 100%)' },
        { id: 'Strawberry', name: 'Strawberry', hex: '#DD8E6F', gradient: 'radial-gradient(circle, rgb(221, 142, 111) 0%, rgb(183, 90, 96) 100%)' },
        { id: 'TacticalPine', name: 'Tactical Pine', hex: '#44826B', gradient: 'radial-gradient(circle, rgb(68, 130, 107) 0%, rgb(47, 99, 105) 100%)' },
        { id: 'Tomato', name: 'Tomato', hex: '#E6793E', gradient: 'radial-gradient(circle, rgb(230, 121, 62) 0%, rgb(212, 78, 63) 100%)' },
        { id: 'Turquoise', name: 'Turquoise', hex: '#5EC0B8', gradient: 'radial-gradient(circle, rgb(94, 192, 184) 0%, rgb(61, 146, 142) 100%)' },
    ];

    // --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
    let state = {
        // Параметры фильтрации
        sortCriteria: 'name',   // 'name', 'count', 'color'
        isAscending: true,      // true (A-Z), false (Z-A)
        filterText: '',         // Текст поиска
        selectedColor: null,    // Для режима поиска по цвету
        
        // Пагинация (NEW)
        page: 1,
        pageSize: 30,
        hasMore: true,
        isFetching: false,

        // Кэш
        colorResults: [],       
    };

    // DOM Elements
    const gridWrapper = document.getElementById('themes-grid');
    const loadingIndicator = document.getElementById('themes-loading');
    
    // Sentinel (элемент для отслеживания скролла)
    let sentinelObserver = null;
    const sentinelId = 'scroll-sentinel';

    // Sort Controls
    const sortDropdownContainer = document.getElementById('sort-dropdown-container');
    const sortDropdownHeader = document.getElementById('sort-dropdown-header');
    const sortDropdownList = document.getElementById('sort-dropdown-list');
    const sortSelectedValue = document.getElementById('sort-selected-value');
    
    const directionBtn = document.getElementById('sort-direction-btn');
    
    // Inputs
    const textInputContainer = document.getElementById('text-input-container');
    const textInput = document.getElementById('theme-text-search');
    const colorInputContainer = document.getElementById('color-input-container');
    
    // Color Dropdown Elements
    const colorDropdown = {
        header: document.getElementById('color-dropdown-header'),
        list: document.getElementById('color-dropdown-list'),
        input: document.getElementById('color-search-input'),
        options: document.getElementById('color-list-options'),
        valueLabel: document.getElementById('color-selected-value')
    };

    // --- UTILS ---
    
    // DEBOUNCE
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function getApiAuthHeader() {
        try {
            const initData = sessionStorage.getItem(INIT_DATA_KEY);
            if (initData) return `Tma ${initData}`;
        } catch (e) { }
        try {
            const bypassKey = sessionStorage.getItem(BYPASS_KEY_STORAGE);
            if (bypassKey) return `Tma ${bypassKey}`;
        } catch (e) { }
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            return `Tma ${window.Telegram.WebApp.initData}`;
        }
        return 'Tma invalid';
    }

    function showLoading(isInitial = false) {
        if (isInitial) {
            if (gridWrapper) gridWrapper.innerHTML = '';
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        } else {
            // Если подгрузка, индикатор внизу уже есть или можно показать спиннер внизу
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        }
    }

    function hideLoading() {
        state.isFetching = false;
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }

    async function secureFetch(url, body) {
        const options = {
            method: body ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': getApiAuthHeader() },
            body: body ? JSON.stringify(body) : null
        };
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    }

    // --- INFINITE SCROLL LOGIC (NEW) ---

    // Функция, которая создает сентинел, если его нет
    function ensureSentinel() {
        let sentinel = document.getElementById(sentinelId);
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = sentinelId;
            // Делаем его видимым и занимающим место, чтобы Observer точно сработал
            sentinel.style.height = '10px';
            sentinel.style.width = '100%';
            sentinel.style.marginTop = '20px'; // Отступ от контента
            
            // Вставляем sentinel ВНУТРЬ gridWrapper, чтобы он был в конце списка
            if (gridWrapper) {
                gridWrapper.appendChild(sentinel);
            }
        } else {
             // Если он уже есть, перемещаем его в самый конец
             if (gridWrapper && gridWrapper.lastElementChild !== sentinel) {
                 gridWrapper.appendChild(sentinel);
             }
        }
        return sentinel;
    }

    function setupIntersectionObserver() {
        // Удаляем старый если есть
        if (sentinelObserver) {
            sentinelObserver.disconnect();
            sentinelObserver = null;
        }

        const options = {
            root: null, // viewport
            rootMargin: '300px', // Грузить заранее
            threshold: 0.1
        };

        sentinelObserver = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && state.hasMore && !state.isFetching && state.sortCriteria !== 'color') {
                console.log('📜 Scroll trigger: loading next page...');
                loadThemes(false);
            }
        }, options);

        const sentinel = ensureSentinel();
        sentinelObserver.observe(sentinel);
    }

    function removeSentinel() {
        if (sentinelObserver) {
            sentinelObserver.disconnect();
            sentinelObserver = null;
        }
        const s = document.getElementById(sentinelId);
        if (s) s.remove();
    }

    // --- UI UPDATES & RENDER ---

    function updateControlsUI() {
        if (state.sortCriteria === 'color') {
            textInputContainer.classList.add('hidden');
            colorInputContainer.classList.remove('hidden');
            removeSentinel(); 
        } else {
            textInputContainer.classList.remove('hidden');
            colorInputContainer.classList.add('hidden');
        }

        if (state.isAscending) {
            directionBtn.classList.remove('rotated');
            directionBtn.title = "По возрастанию";
        } else {
            directionBtn.classList.add('rotated');
            directionBtn.title = "По убыванию";
        }
    }

    // Рендерит данные
    function renderAppendedData(newItems) {
        if (!gridWrapper) return;
        
        if (newItems.length === 0 && state.page === 1) {
            gridWrapper.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Ничего не найдено</p>';
            return;
        }

        // Если сортировка по количеству
        if (state.sortCriteria === 'count') {
            let sectionGrid = gridWrapper.querySelector('.all-themes-grid');
            if (!sectionGrid) {
                const section = document.createElement('div');
                section.className = 'letter-section';
                section.innerHTML = `<div class="letter-header">Все тематики</div>`;
                sectionGrid = document.createElement('div');
                sectionGrid.className = 'themes-page-grid all-themes-grid';
                section.appendChild(sectionGrid);
                gridWrapper.appendChild(section);
            }
            newItems.forEach(item => {
                sectionGrid.appendChild(createThemeCard(item));
            });
        }
        else { 
            // Сортировка по имени (группировка по буквам)
            newItems.forEach(item => {
                const letter = item.CollectionName.charAt(0).toUpperCase();
                const lastSection = gridWrapper.lastElementChild;
                
                // Пропускаем сам sentinel при поиске последней секции
                let targetGrid = null;
                
                // Ищем последнюю секцию, игнорируя sentinel
                const sections = gridWrapper.querySelectorAll('.letter-section');
                const lastRealSection = sections.length > 0 ? sections[sections.length - 1] : null;

                if (lastRealSection && lastRealSection.dataset.letter === letter) {
                    targetGrid = lastRealSection.querySelector('.themes-page-grid');
                } else {
                    const section = document.createElement('div');
                    section.className = 'letter-section';
                    section.dataset.letter = letter;
                    section.innerHTML = `<div class="letter-header">${letter}</div>`;
                    
                    targetGrid = document.createElement('div');
                    targetGrid.className = 'themes-page-grid';
                    section.appendChild(targetGrid);
                    
                    // Вставляем секцию ПЕРЕД сентинелом, если он есть
                    const s = document.getElementById(sentinelId);
                    if (s && gridWrapper.contains(s)) {
                        gridWrapper.insertBefore(section, s);
                    } else {
                        gridWrapper.appendChild(section);
                    }
                }
                
                if (targetGrid) {
                    targetGrid.appendChild(createThemeCard(item));
                }
            });
        }
        
        // После рендера убеждаемся, что сентинел в конце
        ensureSentinel();
    }

    // Рендер для режима цвета
    function renderColorMode() {
        gridWrapper.innerHTML = '';
        if (!state.selectedColor) {
            gridWrapper.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">Выберите цвет для подбора</p>';
            return;
        }
        if (state.colorResults.length === 0) {
            gridWrapper.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Ничего не найдено</p>';
            return;
        }

        let sorted = [...state.colorResults];
        if (state.isAscending) sorted.sort((a, b) => b.Score - a.Score);
        else sorted.sort((a, b) => a.Score - b.Score);
        
        const section = document.createElement('div');
        section.className = 'letter-section';
        section.innerHTML = `<div class="letter-header">Результаты подбора</div>`;
        const innerGrid = document.createElement('div');
        innerGrid.className = 'themes-page-grid';
        
        sorted.forEach(item => {
            innerGrid.appendChild(createThemeCard(item, true));
        });
        
        section.appendChild(innerGrid);
        gridWrapper.appendChild(section);
    }

    function createThemeCard(themeData, isColorMatchMode = false) {
        const card = document.createElement('div');
        card.className = 'theme-page-card';

        const averageColorHex = themeData.ClusterAverageColorHex || themeData.GroupColorHex || '#38bdf8';
        let iconBackgroundStyle;
        
        if (isColorMatchMode && state.selectedColor) {
            iconBackgroundStyle = state.selectedColor.gradient;
        } else {
            iconBackgroundStyle = averageColorHex;
        }

        card.style.setProperty('--glow-color', averageColorHex);
        card.style.setProperty('--theme-color', averageColorHex); 

        const title = themeData.CollectionName || themeData.ThemeName;
        const count = themeData.CountGiftsInTheme || themeData.TotalCount || 0;
        
        const previews = (themeData.TopGifts || themeData.PreviewGifts || []).slice(0, 5);
        const countClass = `items-${previews.length}`; 

        let iconsHtml = '';
        previews.forEach((gift, index) => {
            const imgUrl = `${API_PHOTO_URL}/${encodeURIComponent(gift.GiftName)}/png/${encodeURIComponent(gift.ModelName)}.png`;
            iconsHtml += `
                <div class="tpc-icon-box pos-${index}" style="background: ${iconBackgroundStyle};">
                    <img src="${imgUrl}" class="tpc-img" loading="lazy">
                </div>`;
        });

        let subtitleHtml = `<span class="tpc-count">${count} шт.</span>`;
        if (isColorMatchMode && themeData.Score) {
            const percent = Math.round(themeData.Score * 100);
            subtitleHtml += `<div class="tpc-percent-badge">${percent}%</div>`;
        }

        card.innerHTML = `
            <div class="tpc-left-side">
                <div class="tpc-title">${title}</div>
                <div class="tpc-meta">${subtitleHtml}</div>
            </div>
            
            <div class="tpc-visuals ${countClass}">
                ${iconsHtml}
            </div>
            
            <div class="tpc-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            <div class="tpc-glow"></div>
        `;

        card.addEventListener('click', () => {
            if (window.themesModal && window.themesModal.openCollection) {
                const collectionName = themeData.CollectionName || themeData.ThemeName;
                let bgParam = null;
                if (isColorMatchMode && state.selectedColor) {
                    bgParam = state.selectedColor.name; 
                }
                window.themesModal.openCollection(collectionName, bgParam);
            }
        });

        return card;
    }

    // --- HANDLERS (LOGIC) ---

    async function loadThemes(isReset = false) {
        if (state.isFetching) return;
        if (state.sortCriteria === 'color') return; 

        if (isReset) {
            state.page = 1;
            state.hasMore = true;
            gridWrapper.innerHTML = ''; 
        }

        if (!state.hasMore) return;

        state.isFetching = true;
        showLoading(isReset); 

        const searchParams = new URLSearchParams({
            page: state.page,
            pageSize: state.pageSize,
            sort: state.sortCriteria, 
            desc: !state.isAscending 
        });

        if (state.filterText) {
            searchParams.append('search', state.filterText);
        }

        const url = `${SERVER_BASE_URL}/api/Thematic/GetAllCollections/WithParameters?${searchParams.toString()}`;
        
        try {
            const data = await secureFetch(url);
            
            // Если пришел пустой список, значит данные кончились
            if (!data || data.length === 0) {
                state.hasMore = false;
                removeSentinel();
            } else {
                // Если данных меньше чем просили, возможно это последняя страница, 
                // НО мы все равно их рендерим и оставляем sentinel на всякий случай, 
                // если API так работает. Если совсем 0, то блок выше сработает.
                if (data.length < state.pageSize) {
                     // Можно тут поставить hasMore = false, но лучше перестраховаться
                }
                
                renderAppendedData(data);
                state.page++; 
                
                if (isReset) {
                    setupIntersectionObserver();
                }
            }

            if (isReset && (!data || data.length === 0)) {
                gridWrapper.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Ничего не найдено</p>';
            }

            hideLoading();
        } catch (e) {
            console.error('Failed to load themes:', e);
            hideLoading();
            if (isReset && gridWrapper) {
                gridWrapper.innerHTML = `
                    <div style="text-align:center; padding: 20px;">
                        <p style="color:#f87171; margin-bottom: 10px;">Ошибка загрузки данных</p>
                        <button id="retry-btn" style="background:var(--surface-elevated); border:1px solid var(--border-color); color:white; padding:8px 16px; border-radius:8px; cursor:pointer;">Повторить</button>
                    </div>`;
                document.getElementById('retry-btn').onclick = () => loadThemes(true);
            }
        } finally {
            state.isFetching = false;
            
            // === КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ===
            // Проверяем, виден ли сентинел прямо сейчас после рендера.
            // Если элементов мало (как на скрине), сентинел будет в зоне видимости,
            // но событие 'intersection' не сработает, так как скролла не было.
            if (state.hasMore) {
                const s = document.getElementById(sentinelId);
                if (s) {
                    const rect = s.getBoundingClientRect();
                    // Если верх сентинела выше низа экрана (значит он виден)
                    if (rect.top < window.innerHeight) {
                        console.log('🚀 Sentinel still visible, forcing next load immediately...');
                        // Рекурсивно (но безопасно через setTimeout) грузим дальше
                        setTimeout(() => loadThemes(false), 100);
                    }
                }
            }
        }
    }

    async function searchByColor(colorData) {
        console.log('🎨 Start searching by color:', colorData.name, colorData.hex); 
        
        state.selectedColor = colorData;
        if (colorDropdown.input) {
            colorDropdown.input.value = '';
            colorDropdown.header.classList.remove('value-active'); 
        }
        toggleColorDropdown(false);
        
        showLoading(true);
        const url = `${SERVER_BASE_URL}/api/Thematic/FindCollectionsByColor`;
        
        const requestBody = {
            ColorName: colorData.name, 
            MinScore: 0.3 
        };

        try {
            const data = await secureFetch(url, requestBody);
            console.log('✅ Full API Response:', JSON.stringify(data, null, 2));
            state.colorResults = data;
            hideLoading();
            renderColorMode();
        } catch (e) {
            console.error('❌ Color search error:', e);
            hideLoading();
            if (gridWrapper) gridWrapper.innerHTML = '<p style="text-align:center; color:#f87171">Ошибка API</p>';
        }
    }

    // --- DROPDOWN LOGIC ---

    // 1. Sort Dropdown
    if (sortDropdownHeader) {
        sortDropdownHeader.addEventListener('click', () => {
            const isHidden = sortDropdownList.classList.contains('hidden');
            if (isHidden) {
                sortDropdownList.classList.remove('hidden');
                sortDropdownHeader.classList.add('open', 'active');
                toggleColorDropdown(false); 
            } else {
                sortDropdownList.classList.add('hidden');
                sortDropdownHeader.classList.remove('open', 'active');
            }
        });
    }

    if (sortDropdownList) {
        sortDropdownList.addEventListener('click', (e) => {
            const option = e.target.closest('.list-option');
            if (!option) return;

            const value = option.dataset.value;
            const text = option.textContent;

            state.sortCriteria = value;
            sortSelectedValue.textContent = text;
            sortDropdownList.classList.add('hidden');
            sortDropdownHeader.classList.remove('open', 'active');

            updateControlsUI();

            if (state.sortCriteria === 'color') {
                renderColorMode();
            } else {
                loadThemes(true); 
            }
        });
    }

    // 2. Color Dropdown
    function toggleColorDropdown(show) {
        if (!colorDropdown.list) return;
        if (show) {
            colorDropdown.list.classList.remove('hidden');
            colorDropdown.header.classList.add('open', 'active');
            colorDropdown.input.value = '';
            colorDropdown.input.focus();
            populateColorDropdown(fixedColors);
        } else {
            colorDropdown.list.classList.add('hidden');
            colorDropdown.header.classList.remove('open', 'active');
            if (!state.selectedColor) {
                colorDropdown.valueLabel.textContent = 'Выберите цвет...';
                colorDropdown.header.classList.remove('value-active');
            } else {
                colorDropdown.valueLabel.textContent = state.selectedColor.name;
            }
        }
    }

    function populateColorDropdown(items) {
        if (!colorDropdown.options) return;
        colorDropdown.options.innerHTML = '';
        items.forEach(color => {
            const div = document.createElement('div');
            div.className = 'list-option';
            div.innerHTML = `<div class="color-swatch-mini" style="background:${color.gradient};"></div><span style="font-weight:500;">${color.name}</span>`;
            div.onclick = () => searchByColor(color);
            colorDropdown.options.appendChild(div);
        });
    }

    if (colorDropdown.header) {
        colorDropdown.header.addEventListener('click', (e) => {
            if (e.target !== colorDropdown.input) {
                const isHidden = colorDropdown.list.classList.contains('hidden');
                toggleColorDropdown(isHidden);
            }
        });
    }

    if (colorDropdown.input) {
        colorDropdown.input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = fixedColors.filter(c => c.name.toLowerCase().includes(val));
            populateColorDropdown(filtered);
            if (val.trim() !== '') colorDropdown.header.classList.add('value-active');
            else colorDropdown.header.classList.remove('value-active');
            if (val === '') state.selectedColor = null;
        });
        
        colorDropdown.input.addEventListener('focus', () => {
             if(colorDropdown.list.classList.contains('hidden')) toggleColorDropdown(true);
        });
    }

    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
        if (colorInputContainer && !colorInputContainer.contains(e.target)) {
            if (!colorDropdown.list.classList.contains('hidden')) toggleColorDropdown(false);
        }
        if (sortDropdownContainer && !sortDropdownContainer.contains(e.target)) {
            sortDropdownList.classList.add('hidden');
            sortDropdownHeader.classList.remove('open', 'active');
        }
    });

    // Направление сортировки
    if (directionBtn) {
        directionBtn.addEventListener('click', () => {
            state.isAscending = !state.isAscending;
            updateControlsUI();
            
            if (state.sortCriteria === 'color') {
                renderColorMode();
            } else {
                loadThemes(true); 
            }
        });
    }

    // Поиск текста с Debounce
    if (textInput) {
        const debouncedSearch = debounce((text) => {
            state.filterText = text;
            loadThemes(true); 
        }, 1000);

        textInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    // --- INIT ---
    function init() {
       if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand(); // Разворачиваем на весь экран

            // Настраиваем кнопку назад
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                // Если файл лежит в папке, выходим на уровень вверх
                window.location.href = '../index.html'; 
            });
        }

        populateColorDropdown(fixedColors); 
        loadThemes(true); // Initial Load

        if (window.themesModal && window.themesModal.init) {
            window.themesModal.init(SERVER_BASE_URL, API_PHOTO_URL, null, fixedColors);
        }
    }

    init();
});