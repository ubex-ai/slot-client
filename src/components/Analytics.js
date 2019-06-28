/**
 * Analytics Behavior
 */
import { h, Component } from 'preact';
import uuid4 from 'uuid4';
import sendRequest from '../tools/sendRequest';
import getCookie from '../tools/getCookie';

const COOKIE_NAME = 'UID';
const analyticsUrl = 'http://pixel.ubex.io/v2/slot/';

const AnalyticsBehavior = SlotComponent =>
	class extends Component {
		static displayName = 'AnalyticsBehaviorHOC';

		constructor(props) {
			super(props);
			this.state = {
				counter: 0,
			};
			this.eventsTypes = {
				LOAD: 'load',
				// Слот slot id получил рекламу с impression id
				AD_GET: 'ad_get',
				// Слот slot id показал рекламу с impression id (2 секунды и 60% баннера видно). Пользователь увидел ее через (after) x секунд
				AD_IMP: 'ad_imp',
				// Слот slot id получил клик по рекламе с impression id. Пользователь кликнул через (after) x секунд после загрузки и кликнул в координаты x и y
				AD_CLICK: 'ad_click',
			};


			this.guid = uuid4();
			this.ubexId = getCookie(COOKIE_NAME);
		}

		// Слот slot id загрузился
		// Event: load, params: {'slot_id': .., 'ubex_id': '', 'guid': '', 'seq': ''}
		sendLoad() {
			this.sendEvent(this.eventsTypes.LOAD);
			this.setState({ counter: this.state.counter++ });
		}

		// Слот slot id получил рекламу с impression id
		// Event: ad_get, params: {'slot_id': .., 'ubex_id': '', 'guid': '', 'seq': '', 'impression_id': ''}
		sendAdGet(impressionId) {
			this.addEventListener(this.eventsTypes.AD_GET, params =>
				this.sendEvent(this.eventsTypes.AD_GET, { impression_id: impressionId }),
			);
		}

		// Слот slot id показал рекламу с impression id (2 секунды и 60% баннера видно). Пользователь увидел ее через (after) x секунд
		// Event: ad_imp, params: {'slot_id': .., 'ubex_id': '', 'guid': '', 'seq': '', 'impression_id': '', 'after': '', }
		sendAdImp(impressionId) {
			this.addEventListener(this.eventsTypes.AD_GET, params =>
				this.sendEvent(this.eventsTypes.AD_GET, { impression_id: impressionId, after: 2 }),
			);
		}

		// Слот slot id получил клик по рекламе с impression id. Пользователь кликнул через (after) x секунд после загрузки и кликнул в координаты x и y
		// Event: ad_click, params: {'slot_id': .., 'ubex_id': '', 'guid': '', 'seq': '', 'impression_id': '', 'x': '', 'y': '', 'after': ''}
		sendAdClick(impressionId, x, y, after) {
			this.addEventListener(this.eventsTypes.AD_GET, params =>
				this.sendEvent(this.eventsTypes.AD_GET, { impression_id: impressionId, x, y, after }),
			);
		}

		sendEvent(eventType, params = {}) {
			const data = {
				s: 'slot',
				e: eventType,
				p: {
					slot_id: this.props.slotId,
					ubex_id: this.ubexId,
					guid: this.guid,
					seq: this.state.counter,
					...params,
				},
			};

			return sendRequest({
				url: analyticsUrl,
				method: 'POST',
				body: JSON.stringify(data),
			});
		}

		render() {
			return (
				<SlotComponent
					slotId={this.props.slotId}
					analyticsAPI={{
						sendLoad: this.sendLoad.bind(this),
						sendAdGet: this.sendAdGet.bind(this),
						sendAdImp: this.sendAdImp.bind(this),
						sendAdClick: this.sendAdClick.bind(this),
					}}
				/>
			);
		}
	};

export default AnalyticsBehavior;
