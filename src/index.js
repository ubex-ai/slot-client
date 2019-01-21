'use strict';
import SlotManager from './SlotManager';

(function (window) {
    if (!window.ubexslot || !window.ubexslot instanceof SlotManager) {
        window.ubexslot = new SlotManager();
    }
    const slotManager = window.ubexslot;

})(window);