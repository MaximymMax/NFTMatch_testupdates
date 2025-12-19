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

    const preloadGiftNames = async () => {
        try {
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                console.log('Gift names already in cache. App is ready.');
                signalTelegramAppReady();
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

        } catch (error) {
            console.error('Failed to preload gift names:', error);
            signalTelegramAppReady(); 
        }
    };

    const isAuthorized = checkEnvironmentAndGate();

    if (isAuthorized) {
        preloadGiftNames();
    }
});
