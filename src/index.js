import { h, render } from 'preact';

import Slot from './components/Slot';
const idPattern = 'ubex-';

(document => {
	document.querySelectorAll(`[id^="${idPattern}"]`).forEach(slot => {
		render(<Slot slotId={slot.id.slice(idPattern.length)} />, slot);
	});
})(document);
