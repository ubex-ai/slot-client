import { h, render } from 'preact';
import Slot from './components/Slot';
import IO from 'intersection-observer';
// import * as sfEvents from './sfEvents';

if(!IntersectionObserver || !window.IntersectionObserver){
	window.IntersectionObserver = IntersectionObserver = IO;
	IntersectionObserver.prototype.POLL_INTERVAL = 100;
}

if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = Array.prototype.forEach;
}

document.addEventListener('DOMContentLoaded', () => {
	// console.log('init', w.ubexslot);
	if (!window.ubexslot || !window.ubexslot.length) {
		// console.log('no slots');
		return;
	}
	const positions = {};

	document.querySelectorAll(`[data-ubex-slot]`).forEach((slot, i) => {
		const slotId = slot.getAttribute('data-ubex-slot');
		const inventory = slot.getAttribute('data-ubex-inv');
		slot.setAttribute('id', slotId);
		positions[slotId] = {
			id: slotId,
			dest: `ubx_${slotId}`,
			w: parseInt(slot.style.width),
			h: parseInt(slot.style.height),
		};
		// console.log(`slot foreach: [${i}]: ${slotId}`);
		if (ubexslot[i] !== slotId) {
			// console.log(`render: [${i}]: ${slotId}`);
			render(
				<Slot
					slotId={slotId}
					element={slot}
					inventory={inventory}
					defaultSize={{ w: parseInt(slot.style.width), h: parseInt(slot.style.height) }}
				/>,
				slot,
			);
		}
		ubexslot[i] = slotId;
	});
	const sfConfig =  new $sf.host.Config({
		renderFile:	"https://static.ubex.io/r.html",
		positions,
		// ...sfEvents,
	});
});
