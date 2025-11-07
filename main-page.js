document.addEventListener('DOMContentLoaded', () => {
    
    const SERVER_BASE_URL = 'https://nftmatchbot20250730152328.azurewebsites.net';
    const CACHE_KEY = 'giftNamesCache';

    const tgGateOverlay = document.getElementById('tg-gate-overlay');
    const body = document.body;

    const checkEnvironmentAndGate = () => {
    
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            
            console.log('Running inside Telegram WebApp. Initializing app...');
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
                    console.log('REAL User data SAVED to sessionStorage:', userData);
                } else {
                    sessionStorage.removeItem('tgUser');
                    console.warn('tgUser object not found in initDataUnsafe, clearing cache.');
                }
            } catch (e) {
                console.error('Failed to save REAL user data to sessionStorage:', e);
                sessionStorage.removeItem('tgUser');
            }

        } else {
            
            console.log('Not in Telegram WebApp. Saving FAKE user data for testing.');
            try {
                const testUserData = {
                    telegramId: 7593322, 
                    username: "UserOwner583",
                    firstName: "Test",
                    lastName: "Test",
                };
                sessionStorage.setItem('tgUser', JSON.stringify(testUserData));
                console.log('FAKE User data SAVED to sessionStorage:', testUserData);
            } catch (e) {
                console.error('Failed to save FAKE user data to sessionStorage:', e);
            }
        }

        return true; 
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
        try {
            const response = await fetch(`${SERVER_BASE_URL}/api/ListGifts/AllGiftNames`);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const giftNames = await response.json();
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(giftNames));
            console.log('Successfully fetched and cached gift names.');

            signalTelegramAppReady();

        } catch (error) {
            console.error('Failed to preload gift names:', error);
        }
    };

    const isTelegramEnvironment = checkEnvironmentAndGate();

    if (isTelegramEnvironment) {
        preloadGiftNames();
    }
});