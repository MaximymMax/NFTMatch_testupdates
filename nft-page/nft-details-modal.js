const SERVER_BASE_URL = 'https://nftmatchbot20250730152328.azurewebsites.net/';
const API_PHOTO_MODEL_URL = 'https://cdn.changes.tg/gifts/models'; 
const API_SIMILAR_MODELS = '/api/MonoCoof/SimilarNFT'; 

export function initNftDetailsModal() {
    
    const INIT_DATA_KEY = 'tgInitData';
    const BYPASS_KEY_STORAGE = 'apiBypassKey';

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
            const directInitData = window.Telegram.WebApp.initData;
            try { sessionStorage.setItem(INIT_DATA_KEY, directInitData); } catch(e) {}
            return `Tma ${directInitData}`;
        }
        return 'Tma invalid';
    }

    const modalOverlay = document.getElementById('nftDetailsModalOverlay');
    const closeBtn = document.getElementById('closeNftDetailsModalBtn');
    
    const modalTitle = document.getElementById('nftDetailsModalTitle');
    const targetModelPhotoContainer = document.getElementById('targetModelPhoto'); 
    const selectedModelPhotoContainer = document.getElementById('selectedModelPhoto'); 
    const similarModelsList = document.getElementById('similarModelsList');
    const listWrapper = document.getElementById('similarModelsListWrapper'); 

    let currentSimilarModels = [];
    let selectedModelName = null; 
    
    let targetGiftName = ''; 
    let targetModelName = ''; 
    let cardGiftName = '';
    let apiColors = [];

    function formatCount(count) {
        if (count === null || count === undefined) {
            return '<span class="price-value">0 шт.</span>';
        }
        // Форматируем число с пробелами (например 4 951)
        const formatted = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        
        // Используем класс price-value, чтобы сохранить белый цвет и жирный шрифт
        return `<span class="price-value">${formatted} шт.</span>`;
    }
    
    function updateScrollShadows() {
        if (!similarModelsList || !listWrapper) return;
        
        const isAtTop = similarModelsList.scrollTop === 0;
        const isAtBottom = similarModelsList.scrollHeight - similarModelsList.clientHeight <= similarModelsList.scrollTop + 1;
        
        const isScrollable = similarModelsList.scrollHeight > similarModelsList.clientHeight;

        listWrapper.classList.toggle('can-scroll-up', isScrollable && !isAtTop);
        listWrapper.classList.toggle('can-scroll-down', isScrollable && !isAtBottom);

        if (!isScrollable) {
            listWrapper.classList.remove('can-scroll-up', 'can-scroll-down');
        }
    }
    
    function updatePhotoContainers() {
        // --- 1. ЦЕЛЕВАЯ МОДЕЛЬ ---
        if (targetModelName && targetGiftName) {
            const targetUrl = `${API_PHOTO_MODEL_URL}/${encodeURIComponent(targetGiftName)}/png/${encodeURIComponent(targetModelName)}.png`;
            
            // Добавляем кнопку "Подробнее"
            targetModelPhotoContainer.innerHTML = `
                <div class="photo-wrapper">
                    <img src="${targetUrl}" alt="${targetModelName}" class="model-photo">
                </div>
                <button class="more-details-btn" id="btn-details-target">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Подробнее
                </button>
            `;

            // Вешаем обработчик
            const btnTarget = targetModelPhotoContainer.querySelector('#btn-details-target');
            if (btnTarget) {
                btnTarget.addEventListener('click', () => {
                    openFullDetails(targetGiftName, targetModelName);
                });
            }

        } else {
            targetModelPhotoContainer.innerHTML = '<p class="placeholder-text">Нет целевой модели</p>';
        }
        
        // --- 2. ВЫБРАННАЯ (ПОХОЖАЯ) МОДЕЛЬ ---
        const displayModelName = selectedModelName || (currentSimilarModels.length > 0 ? currentSimilarModels[0].name : null);
        
        if (displayModelName && cardGiftName) {
            const selectedUrl = `${API_PHOTO_MODEL_URL}/${encodeURIComponent(cardGiftName)}/png/${encodeURIComponent(displayModelName)}.png`;
            
            // Добавляем кнопку "Подробнее"
            selectedModelPhotoContainer.innerHTML = `
                <div class="photo-wrapper">
                    <img src="${selectedUrl}" alt="${displayModelName}" class="model-photo">
                </div>
                <button class="more-details-btn" id="btn-details-selected">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Подробнее
                </button>
            `;

            // Вешаем обработчик
            const btnSelected = selectedModelPhotoContainer.querySelector('#btn-details-selected');
            if (btnSelected) {
                btnSelected.addEventListener('click', () => {
                    openFullDetails(cardGiftName, displayModelName);
                });
            }

        } else {
            selectedModelPhotoContainer.innerHTML = '<p class="placeholder-text">Выберите модель</p>';
        }
    }
    
    function openFullDetails(gift, model) {
        if (!gift || !model) return;

        if (window.themesModal && typeof window.themesModal.openModelDetail === 'function') {
            // 1. Скрываем текущую модалку
            modalOverlay.classList.add('hidden'); 
            
            // 2. Открываем themes-modal
            window.themesModal.openModelDetail(gift, model, () => {
                // Callback "Назад": Когда в themes-modal нажмут назад/закрыть,
                // мы снова покажем эту модалку
                modalOverlay.classList.remove('hidden');
                
                // ❗️ ВАЖНО: Восстанавливаем блокировку скролла, так как themesModal её снял при закрытии
                document.body.classList.add('modal-open');
            });
        } else {
            console.error("ThemesModal not found or openModelDetail not available");
        }
    }

    function renderSimilarModelsList() {
        similarModelsList.innerHTML = '';
        
        if (currentSimilarModels.length === 0) {
            similarModelsList.innerHTML = '<p class="list-placeholder">Не удалось загрузить похожие модели для данного подарка.</p>';
            updatePhotoContainers();
            listWrapper.classList.remove('can-scroll-up', 'can-scroll-down');
            return;
        }

        currentSimilarModels.forEach(model => {
            const modelName = model.name;
            const coefficient = (model.coof * 100).toFixed(2);
            
            // 🔥 ИЗМЕНЕНИЕ: Используем количество вместо цены
            const countHtml = formatCount(model.count);
            
            const photoUrl = `${API_PHOTO_MODEL_URL}/${encodeURIComponent(cardGiftName)}/png/${encodeURIComponent(modelName)}.png`;

            const modelItem = document.createElement('div');
            modelItem.className = 'model-item';
            modelItem.dataset.modelName = modelName;
            
            const modelToHighlight = selectedModelName || (currentSimilarModels.length > 0 ? currentSimilarModels[0].name : null);
            if (modelToHighlight === modelName) {
                 modelItem.classList.add('selected');
                 if (selectedModelName === null) {
                     selectedModelName = modelName;
                 }
            }

            modelItem.innerHTML = `
                <div class="model-photo-mini">
                    <img src="${photoUrl}" alt="${modelName}" class="model-photo-mini-img">
                </div>
                <div class="model-info">
                    <div class="model-name-coof">
                        <span class="model-name-text">${modelName}</span>
                        <span class="model-coof-text">${coefficient}%</span>
                    </div>
                    <div class="model-price">
                        ${countHtml}
                    </div>
                </div>
            `;
            
            modelItem.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.model-item').forEach(item => item.classList.remove('selected'));
                modelItem.classList.add('selected');
                selectedModelName = modelName;
                updatePhotoContainers(); 
            });

            similarModelsList.appendChild(modelItem);
        });
        
        updatePhotoContainers();
        setTimeout(updateScrollShadows, 100);
    }

    async function fetchSimilarModels() {
        similarModelsList.innerHTML = '<div class="list-loading"><span class="spinner-small"></span> Загрузка моделей...</div>';
        
        try {
            const getTelegramUserData = () => {
                // ... (код получения юзера остается тем же) ...
                // Скопируй логику getTelegramUserData из своего старого файла, 
                // я сократил этот блок для краткости ответа, так как он не меняется.
                let masterUserData = null;
                try {
                    const cachedUserData = sessionStorage.getItem('tgUser');
                    if (cachedUserData) masterUserData = JSON.parse(cachedUserData); 
                } catch (e) {}

                if (!masterUserData) {
                    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
                    if (tgUser) {
                        masterUserData = { telegramId: tgUser.id, username: tgUser.username || null };
                        try { sessionStorage.setItem('tgUser', JSON.stringify({ ...masterUserData, telegramId: parseInt(tgUser.id, 10) })); } catch (e) { } 
                    }
                }
                
                if (masterUserData) {
                    let numericId = null;
                    if (masterUserData.telegramId !== null && masterUserData.telegramId !== undefined) {
                         numericId = parseInt(masterUserData.telegramId, 10);
                         if (isNaN(numericId)) numericId = null; 
                    }
                    return { id: numericId, Username: masterUserData.username };
                }
                return { id: null, Username: null }; 
            };

            const userData = getTelegramUserData();

            const requestBody = {
                ...userData, 
                "Colors": apiColors, 
                "NameTargetGift": null,
                "NameTargetModel": null,
                "NameGift": cardGiftName, 
                "MonohromeModelsOnly": true 
            };
            
            const response = await fetch(`${SERVER_BASE_URL}${API_SIMILAR_MODELS}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': getApiAuthHeader() 
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }

            const data = await response.json(); 

            console.log('Похожие модели загружены:', data);
            
            // 🔥 ИЗМЕНЕНИЕ: Маппинг данных. Берем Count вместо FloorPrice
            currentSimilarModels = data.map(item => ({
                name: item.Name,
                coof: item.Coof,
                count: item.Count // Было floorPrice: item.FloorPrice
            }));
            
            selectedModelName = null;
            renderSimilarModelsList();
            
        } catch (error) {
            console.error('Ошибка при загрузке похожих моделей:', error);
            similarModelsList.innerHTML = `<p class="list-placeholder">Ошибка загрузки: ${error.message}</p>`;
            updatePhotoContainers(); 
            updateScrollShadows(); 
        }
    }

    function openNftDetailsModal(giftNameFromCard, targetGiftNameFromMain, targetModelNameFromMain, colors) {
        if (!giftNameFromCard || !targetGiftNameFromMain || !targetModelNameFromMain) {
             console.error("Не все необходимые данные указаны для модального окна.");
             return;
        }
        modalTitle.textContent = giftNameFromCard;

        cardGiftName = giftNameFromCard; 
        targetGiftName = targetGiftNameFromMain; 
        targetModelName = targetModelNameFromMain; 
        apiColors = colors || []; 

        selectedModelName = null; 
        currentSimilarModels = []; 

        modalOverlay.classList.remove('hidden');
        
        // ❗️ ФИКС: Используем класс вместо style.overflow
        document.body.classList.add('modal-open');
        
        if (similarModelsList) {
             similarModelsList.addEventListener('scroll', updateScrollShadows);
        }
        
        // Сброс скролла в начало при открытии
        if (similarModelsList) similarModelsList.scrollTop = 0;

        updatePhotoContainers(); 
        
        fetchSimilarModels();
    }
    
    function closeNftDetailsModal() {
        modalOverlay.classList.add('hidden');
        
        // ❗️ ФИКС: Убираем класс
        document.body.classList.remove('modal-open');
        // На всякий случай чистим инлайн, если он остался от старого кода
        document.body.style.overflow = ''; 
        
        if (similarModelsList) {
            similarModelsList.removeEventListener('scroll', updateScrollShadows);
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeNftDetailsModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeNftDetailsModal();
            }
        });
    }

    return {
        openNftDetailsModal: openNftDetailsModal,
        closeNftDetailsModal: closeNftDetailsModal
    };
}