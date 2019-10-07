/**
 * Analytics Behavior
 */
import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import uuid4 from 'uuid4';
import sendRequest from '../tools/sendRequest';
import CookieHelper from '../tools/cookieHelper';
import FingerprintWrapper from '../fingerprintWrapper';
import CollectorRequest from '../collectorRequest';
import { log } from '../tools';

const COOKIE_NAME = 'UID';
const analyticsUrl = ANALYTIC_URL;

const AnalyticsBehavior = SlotComponent =>
	class extends Component {
		constructor(props) {
			super(props);
			this.state = {
				counter: -1,
			};
			this.eventsTypes = {
				LOAD: 'load',
				// Слот slot id получил рекламу с impression id
				AD_GET: 'ad_get',
				// Слот slot id показал рекламу с impression id (2 секунды и 60% баннера видно). Пользователь увидел ее через (after) x секунд
				AD_IMP: 'ad_imp',
				// Слот slot id получил клик по рекламе с impression id. Пользователь кликнул через (after) x секунд после загрузки и кликнул в координаты x и y
				AD_CLICK: 'ad_click',
				// рекламу закрыли на кнопку
				AD_CLOSE: 'ad_close',
				// слот не загрузился
				AD_GET_FAIL: 'ad_get_fail',
				// Подгрузмлась заглушка
				AD_FALLBACK: 'ad_fallback',
			};

			this.session = uuid4();
			this.cookieHelper = new CookieHelper();
			this.ubexId = this.cookieHelper.read(COOKIE_NAME);
			// eslint-disable-next-line no-undef
			this.collectorRequest = CollectorRequest(PIXEL_URL);

			this.fw = new FingerprintWrapper({
				requiredComponents: {
					language: 'lng',
					availableScreenResolution: 'asr',
					timezoneOffset: 'tzo',
					platform: 'p',
					adBlock: 'ab',
					touchSupport: 'ts',
					pixelRatio: 'pr',
					doNotTrack: 'dnt',
				},
			});
		}

		setUbexId() {
			if (this.ubexId && typeof this.ubexId !== 'undefined' && this.ubexId.length > 0) {
				return null;
			}
			return this.fw.getComponents().then(components => {
				this.ubexId = this.fw.generateHashFromComponents(components);
				this.cookieHelper.create(COOKIE_NAME, this.ubexId);
				return this.collectorRequest.imageRequest({
					fid: this.ubexId,
					rfr: document.referrer,
					cid: window.ubx && window.ubx.q && window.ubx.q[0] && window.ubx.q[0][1],
					uri: window.location.href,
					tl: document.title,
					...this.fw.generateParamsFromComponents(components),
				});
			});
		}

		/**
		 * Слот slot id загрузился
		 * Event: load, params: {'slot_id': .., 'ubex_id': '', 'session': '', 'seq': ''}
		 * @return Promise
		 */
		sendLoad() {
			return this.sendEvent(this.eventsTypes.LOAD);
		}

		/**
		 * AD_GET
		 * Слот slot id получил рекламу с impression id
		 * Event: ad_get, params: {'slot_id': .., 'ubex_id': '', 'session': '', 'seq': '', 'impression_id': ''}
		 * @param {String} impression
		 * @param {String} request
		 * @return Promise
		 */
		sendAdGet({ impression, request }) {
			return new Promise(resolve => {
				this.setState({ counter: this.state.counter + 1 }, resolve);
			}).then(() => this.sendEvent(this.eventsTypes.AD_GET, { impression, request }));
		}

		/**
		 * AD_FALLBACK
		 * Слот slot id получил рекламу с impression id
		 * Event: ad_get, params: {'slot_id': .., 'ubex_id': '', 'session': '', 'seq': '', 'impression_id': ''}
		 * @return Promise
		 */
		sendAdFallback() {
			return new Promise(resolve => {
				this.setState({ counter: this.state.counter + 1 }, resolve);
			}).then(() => this.sendEvent(this.eventsTypes.AD_FALLBACK));
		}

		/**
		 * AD_IMP
		 * Слот slot id показал рекламу с impression id (2 секунды и 60% баннера видно). Пользователь увидел ее через (after) x секунд
		 * Event: ad_imp, params: {'slot_id': .., 'ubex_id': '', 'session': '', 'seq': '', 'impression_id': '', 'after': '', }
		 * @param {String} impression
		 * @param {Number} after
		 * @param {String} request
		 * @return Promise
		 */
		sendAdImp({ impression, after, request }) {
			return this.sendEvent(this.eventsTypes.AD_IMP, {
				impression,
				after,
				request,
			});
		}

		/**
		 * AD_CLICK
		 * Слот slot id получил клик по рекламе с impression id. Пользователь кликнул через (after) x секунд после загрузки и кликнул в координаты x и y
		 * Event: ad_click, params: {'slot_id': .., 'ubex_id': '', 'session': '', 'seq': '', 'impression_id': '', 'x': '', 'y': '', 'after': ''}
		 * @param {String} impression
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} after
		 * @param {String} request
		 * @return Promise
		 */
		sendAdClick({ impression, x, y, after, request }) {
			return this.sendEvent(this.eventsTypes.AD_CLICK, {
				impression,
				x,
				y,
				after,
				request,
			});
		}

		sendCloseAd({ impression, reason, after }) {
			return this.sendEvent(this.eventsTypes.AD_CLOSE, { impression, reason, after });
		}

		sendAdFailed({ reason }) {
			return this.sendEvent(this.eventsTypes.AD_GET_FAIL, { reason });
		}

		getSequence() {
			if (this.state.counter === -1) {
				return 0;
			}

			return this.state.counter;
		}

		sendEvent(eventType, params = {}) {
			const data = {
				s: 'slot',
				e: eventType,
				p: {
					inventory: this.props.inventory,
					slot_id: this.props.slotId,
					ubex_id: this.ubexId,
					session: this.session,
					seq: this.getSequence(),
					...params,
				},
			};

			log(`SEND EVENT: ${eventType}`, data.p);

			return sendRequest({
				url: analyticsUrl,
				method: 'POST',
				body: JSON.stringify(data),
			});
		}

		render() {
			return (
				<SlotComponent
					{...this.props}
					slotId={this.props.slotId}
					inventory={this.props.inventory}
					ubexId={this.ubexId}
					analyticsAPI={{
						setUbexId: this.setUbexId.bind(this),
						sendLoad: this.sendLoad.bind(this),
						sendAdGet: this.sendAdGet.bind(this),
						sendAdImp: this.sendAdImp.bind(this),
						sendAdClick: this.sendAdClick.bind(this),
						sendCloseAd: this.sendCloseAd.bind(this),
						sendAdFailed: this.sendAdFailed.bind(this),
						sendAdFallback: this.sendAdFallback.bind(this),
					}}
				/>
			);
		}
	};

AnalyticsBehavior.propTypes = {
	slotId: PropTypes.string.isRequired,
};

export default AnalyticsBehavior;
