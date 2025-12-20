document.addEventListener('DOMContentLoaded', () => {
    
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        // На главной странице кнопка "Назад" НЕ нужна
        tg.BackButton.hide(); 
        
        // Принудительно сохраняем данные при входе
        if (tg.initData) {
            sessionStorage.setItem('tgInitData', tg.initData);
            console.log("Main Page: InitData saved.");
        }
    }

    const SERVER_BASE_URL = 'https://nftmatchbot20250730152328.azurewebsites.net';
    const CACHE_KEY = 'giftNamesCache';
    const INIT_DATA_KEY = 'tgInitData';
    const BYPASS_KEY_STORAGE = 'apiBypassKey';

    const tgGateOverlay = document.getElementById('tg-gate-overlay');
    const body = document.body;

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Скрываем кнопку "Назад", так как мы на главной
        window.Telegram.WebApp.BackButton.hide();
    }

    function saveInitData() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            const initData = window.Telegram.WebApp.initData;
            if (initData) {
                try {
                    sessionStorage.setItem(INIT_DATA_KEY, initData);
                    console.log('[Auth] InitData saved to sessionStorage.');
                } catch (e) {
                    console.error('[Auth] Failed to save InitData:', e);
                }
                
                try {
                    const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
                    if (tgUser) {
                        const userData = {
                            telegramId: parseInt(tgUser.id, 10), 
                            username: tgUser.username || null,
                            firstName: tgUser.first_name || null,
                            lastName: tgUser.last_name || null,
                        };
                        sessionStorage.setItem('tgUser', JSON.stringify(userData));
                    }
                } catch (e) { /* ignore */ }
                
                return true;
            }
        }
        
        const cachedInitData = sessionStorage.getItem(INIT_DATA_KEY);
        if (cachedInitData) {
            return true;
        }

        const bypassKey = sessionStorage.getItem(BYPASS_KEY_STORAGE);
        if (bypassKey) {
            return true;
        }

        return false;
    }

    saveInitData();


    const checkEnvironmentAndGate = () => {
        const isAuthAvailable = saveInitData();

        if (isAuthAvailable) {
            console.log('Environment: Authorized (Telegram or Bypass).');
            if (tgGateOverlay) tgGateOverlay.classList.add('hidden');
            body.classList.remove('body-gated');
            
            // --- ДОБАВЛЯЕМ КЛАСС ДЛЯ ПОЛНОЭКРАННОГО РЕЖИМА (ОТСТУП В ШАПКЕ) ---
            body.classList.add('tg-fullscreen');
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.expand(); // Разворачиваем на весь экран
            }
            return true;
        } else {
            console.warn('Environment: Unauthorized (Outside Telegram). Showing Gate.');
            
            const urlParams = new URLSearchParams(window.location.search);
            const bypass = urlParams.get('bypass');
            if (bypass) {
                sessionStorage.setItem(BYPASS_KEY_STORAGE, bypass);
                window.location.reload();
                return true;
            }

            if (tgGateOverlay) tgGateOverlay.classList.remove('hidden');
            body.classList.add('body-gated');
            return false;
        }
    };

    const signalTelegramAppReady = () => {
        if (window.Telegram && window.Telegram.WebApp) {
            console.log('Signaling Telegram: WebApp is ready.');
            window.Telegram.WebApp.ready();
        }
    };

    // =======================================================
    // =============== CAROUSEL LOGIC START ==================
    // =======================================================
    const initCarousel = async () => {
        const wrapper = document.getElementById('hero-carousel-wrapper');
        const track = document.getElementById('hero-carousel-track');
        if (!wrapper || !track) return;

        // 1. Get Authentication
        let authHeader = 'Tma invalid';
        const initData = sessionStorage.getItem(INIT_DATA_KEY);
        if (initData) authHeader = `Tma ${initData}`;
        else {
             const bypass = sessionStorage.getItem(BYPASS_KEY_STORAGE);
             if(bypass) authHeader = `Tma ${bypass}`;
        }

        // 2. Define Specific Collection
        const TARGET_COLLECTION = [
            "Santa Hat",
            "Holiday Drink",
            "Candy Cane",
            "Xmas Stocking",
            "Ginger Cookie",
            "Jingle Bells",
            "Winter Wreath",
            "Snow Globe",
            "Snow Mittens",
            "Sleigh Bell",
            "Tama Gadget"
        ];

        console.log(`[Carousel] Fetching gradient for specific target collection.`);

        try {
            // Requesting length 50 as requested
            const response = await fetch(`${SERVER_BASE_URL}/api/MonoCoof/GetCollectionGradient/40`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "CollectionNames": TARGET_COLLECTION })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            if (!data || data.length === 0) {
                console.warn('[Carousel] No data returned.');
                return;
            }

            // 3. Render Cards
            // Function to create a card DOM element
            const createCard = (item) => {
                const card = document.createElement('div');
                card.className = 'carousel-card';
                
                // Use solid hex color from API instead of gradient
                card.style.backgroundColor = item.ColorHex || '#333';
                
                const img = document.createElement('img');
                const safeGiftName = encodeURIComponent(item.GiftName);
                const safeModelName = encodeURIComponent(item.ModelName);
                img.src = `https://cdn.changes.tg/gifts/models/${safeGiftName}/png/${safeModelName}.png`;
                img.alt = item.ModelName;
                
                card.appendChild(img);
                return card;
            };

            // Clear track
            track.innerHTML = '';

            const itemsToRender = [...data];
            
            // Render 4 sets of the data to ensure smooth infinite looping
            for (let i = 0; i < 4; i++) {
                itemsToRender.forEach(item => {
                    track.appendChild(createCard(item));
                });
            }

            wrapper.classList.remove('hidden');

            // 4. Animation & Interaction Logic
            let x = 0;
            let speed = 0.4; // ИЗМЕНЕНО: Базовая скорость уменьшена
            const baseSpeed = 0.4; // ИЗМЕНЕНО: Базовая скорость уменьшена
            let isDragging = false;
            let startX = 0;
            let currentTranslateX = 0;
            let animationId;
            
            // Get dimensions
            // ОБНОВЛЕНО: Ширина карточки (50px) + отступ (15px) = 65px
            const cardFullWidth = 50 + 15; 
            const singleSetWidth = data.length * cardFullWidth; 

            let recoveryTimeout;

            const update = () => {
                if (!isDragging) {
                    // Smoothly return speed to baseSpeed
                    if (Math.abs(speed - baseSpeed) > 0.01) {
                         speed += (baseSpeed - speed) * 0.05; // Lerp ease
                    } else {
                        speed = baseSpeed;
                    }

                    x -= speed;
                }

                // Infinite loop logic
                if (Math.abs(x) >= singleSetWidth) {
                    x += singleSetWidth;
                }
                if (x > 0) {
                    x -= singleSetWidth;
                }

                track.style.transform = `translate3d(${x}px, 0, 0)`;
                animationId = requestAnimationFrame(update);
            };

            // --- Touch / Mouse Events ---

            const startDrag = (e) => {
                isDragging = true;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                startX = clientX;
                currentTranslateX = x;
                
                clearTimeout(recoveryTimeout);
                speed = 0; 
                
                track.style.cursor = 'grabbing';
            };

            const moveDrag = (e) => {
                if (!isDragging) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const delta = clientX - startX;
                x = currentTranslateX + delta;
            };

            const endDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                track.style.cursor = 'grab';

                recoveryTimeout = setTimeout(() => {
                   // Logic handled in update() via lerp
                }, 50); 
            };

            // Event Listeners
            track.addEventListener('mousedown', startDrag);
            track.addEventListener('touchstart', startDrag, {passive: true});

            window.addEventListener('mousemove', moveDrag);
            window.addEventListener('touchmove', moveDrag, {passive: true});

            window.addEventListener('mouseup', endDrag);
            window.addEventListener('touchend', endDrag);

            // Start Loop
            update();

        } catch (e) {
            console.error('[Carousel] Failed:', e);
            wrapper.classList.add('hidden');
        }
    };
    // =======================================================
    // =============== CAROUSEL LOGIC END ====================
    // =======================================================

    const preloadGiftNames = async () => {
        try {
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                console.log('Gift names already in cache. App is ready.');
                signalTelegramAppReady();
                // Запускаем карусель сразу, так как кэш есть
                initCarousel(); 
                return;
            }
        } catch (error) {
            console.error('Failed to read from sessionStorage:', error);
        }

        console.log('Cache is empty. Fetching gift names from server...');
        
        let authHeader = 'Tma invalid';
        const initData = sessionStorage.getItem(INIT_DATA_KEY);
        if (initData) authHeader = `Tma ${initData}`;
        else {
             const bypass = sessionStorage.getItem(BYPASS_KEY_STORAGE);
             if(bypass) authHeader = `Tma ${bypass}`;
        }

        try {
            const response = await fetch(`${SERVER_BASE_URL}/api/ListGifts/AllGiftNames`, {
                headers: { 'Authorization': authHeader }
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const giftNames = await response.json();
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(giftNames));
            console.log('Successfully fetched and cached gift names.');

            signalTelegramAppReady();
            
            // Запускаем карусель после получения данных
            initCarousel();

        } catch (error) {
            console.error('Failed to preload gift names:', error);
            signalTelegramAppReady(); 
            // Все равно пробуем запустить (с дефолтным именем)
            initCarousel();
        }
    };

    const isAuthorized = checkEnvironmentAndGate();

    if (isAuthorized) {
        preloadGiftNames();
    }
});
