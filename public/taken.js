(function () {

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : '';
    }

    function fireTracking(url) {
        const img = document.createElement('img');
        img.src = url;
        img.width = 1;
        img.height = 1;
        img.style.display = 'none';
        document.body.appendChild(img);
    }

    function isCartPage() {
        const cartPatterns = ['cart', 'checkout', 'pay', 'shipping', 'review-order', 'payment'];
        return cartPatterns.some(function (path) {
            return window.location.pathname.toLowerCase().includes(path);
        });
    }

    async function initTracking() {
        

        try {
            const uniqueId = getCookie('tracking_uuid') || generateUUID();
            const expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();

            document.cookie =
                'tracking_uuid=' + uniqueId +
                '; expires=' + expires +
                '; path=/; SameSite=Lax';

            const response = await fetch('https://api.aimedialinks.com/api/track-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: location.href,
                    referrer: document.referrer,
                    unique_id: uniqueId,
                    origin: location.hostname
                })
            });

            const result = await response.json();

            if (result.success && result.affiliate_url) {
                fireTracking(result.affiliate_url);
                sessionStorage.setItem('tracking_done', '1');
            } else {
                fireTracking('https://api.aimedialinks.com/api/fallback-pixel?id=' + uniqueId);
            }

        } catch (error) {
            console.error('Tracking error', error);
        }
    }

    function run() {
        const hostname = window.location.hostname;

        const siteConfig = {
            'www.fareastflora.com': { always: false, cartExtra: true },
            'aimedialinks.com':     { always: true,  cartExtra: true },
            'alokozayshop.com':     { always: true, cartExtra: true }
        };

        const config = siteConfig[hostname];

        if (config) {
            if (config.cartExtra && isCartPage()) {
                initTracking();
            } else if (config.always) {
                initTracking();
            }
        }
    }

    document.readyState === 'complete' || document.readyState === 'interactive'
        ? run()
        : window.addEventListener('DOMContentLoaded', run, { once: true });

}());
