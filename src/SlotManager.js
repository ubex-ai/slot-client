import Promise from 'promise-polyfill';
import Slot from './Slot';

const SlotManager = function () {
    const slots = {};
    let pixelInit = false;

    function encodeParams(params) {
        return Object.keys(params).map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
        }).join('&');
    }

    function sendRequest(url, params, method = 'GET', body = null) {
        return new Promise(function (resolve, reject) {
            // check XMLHttpRequest support onload. if not, that is IE8,9, and use XDomainRequest.
            var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
            var xhr = new XHR();
            xhr.open(method, `//${url}?${encodeParams(params)}`, true);
            xhr.send(body);
            xhr.onload = function (arg) {
                resolve(this, arg);
            };
            xhr.onerror = function (arg) {
                reject(this, arg);
            }
        });
    }

    function addSlot(element) {
        const slot = new Slot(element, sendRequest);
        slots[slot.id] = slot;
    }

    function getPixelCounter() {
        if(!pixelInit) {
            (function (w, d, n, u, s) {
                var t = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 10; i++)
                    t += possible.charAt(Math.floor(Math.random() * possible.length));
                w[n] = w[n] || function () {
                    (w[n].q = w[n].q || []).push(arguments)
                };
                var a = d.createElement(s), m = d.getElementsByTagName(s)[0];
                a.async = true;
                a.src = u + '?' + t;
                m.parentNode.insertBefore(a, m);
            })(window, document, 'ubx', '//pixel.ubex.io/pixel.js', 'script');
            pixelInit = true;
        }
    }

    console.log('SlotManager init');
    getPixelCounter();
    return {
        slots: slots,
        getSlot: (id) => {
            return slots[id];
        },
        push: () => {
            const containers = document.getElementsByClassName('ubex-slot');
            for (let i = 0; i < containers.length; i++) {
                addSlot(containers[i]);
            }
        }
    }
};

export default SlotManager;