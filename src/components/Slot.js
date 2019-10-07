/**
 * Slot
 */
import {h, Component} from 'preact';
import PropTypes from 'prop-types';
import {InView} from 'react-intersection-observer';
import uuid4 from 'uuid4';
import {sendRequest, getDeviceData, log, error, warn, delay, getDefaultLocale} from '../tools';
import {Overlay, UrlFrame, Analytics, AppSafeframe} from '../components';
import Btn from './Btn';

// eslint-disable-next-line no-undef
const apiUrl = API_URL;
const TIME_FOR_IMPRESS = 2;
const VISIBILITY_THRESHOLD = 0.6;
const bannerTypes = {dummy: 'BANNER_DUMMY', html: 'BANNER_HTML', image: 'BANNER_IMAGE'};

const clickerStyle = {
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	padding: 0,
	margin: 0,
	border: 0,
	overflow: 'hidden',
	width: '100%',
	height: '100%',
	cursor: 'pointer',
	zIndex: 1,
};

const lang = getDefaultLocale();

const frameHost = 'https://static.ubex.io'; // 'http://0.0.0.0:8081'

class Slot extends Component {
	constructor(props) {
		super(props);
		this.loop = null;
		this.outer = null;
		this.state = {
			loopSeconds: 0,
			impressionSeconds: 0,
			clickSeconds: 0,
			impression: null,
			requestId: null,
			impressed: false,
			innerCode: null,
			frameUrl: null,
			isLoading: false,
			inView: false,
			clickUrl: null,
			hideGUI: true, // скрыть ubex-gui для overlay
			hidden: false, // скрыт полностью, если загораживает контент
			closed: false, // реклама не показывается, но слот виден
			clicked: false,
			type: null, // тип баннера
			fallback: true, // у HTML баннеров будет "fallback": true прилетать когда будет прилетать пользовательская заглушка
			size: props.defaultSize,
			showReasons: false,
		};
	}

	componentDidMount() {
		this.loop = this.runLoop();
		this.loop();
		if (window.addEventListener) {
			window.addEventListener('message', e => this.handlePostMessage(e));
		} else {
			window.attachEvent('onmessage', e => this.handlePostMessage(e))
		}

		this.outer = document.getElementById(this.props.slotId);
		window.outers = window.outers || {};
		if(DEV_MODE) {
			window.outers[this.props.slotId] = this.outer;
		}
	}

	componentWillUnmount() {
		this.loop = null;
		delete this.loop;
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			nextState.fallback !== this.state.fallback ||
			nextState.isLoading !== this.state.isLoading ||
			nextState.frameUrl !== this.state.frameUrl ||
			nextState.innerCode !== this.state.innerCode ||
			nextState.closed !== this.state.closed ||
			nextState.hidden !== this.state.hidden ||
			nextState.size !== this.state.size ||
			nextState.showReasons !== this.state.showReasons
		);
	}

	setStateAsync(state) {
		return new Promise(resolve => {
			this.setState(state, resolve);
		});
	}

	runLoop() {
		// 1) Загружается слот.
		return async () => {
			const device = await getDeviceData();
			await this.props.analyticsAPI.setUbexId();
			// сервер будет ожидать от слота // site: page, ref
			const site = {page: window.location.href, ref: document.referrer};
			// Передается событие
			await this.analyticsEvent('sendLoad');
			/* eslint-disable no-await-in-loop */
			let tryingTime = 0;
			while (true) {
				const {inventory} = this.props;
				const {
					inView,
					impressionSeconds,
					loopSeconds,
					clicked,
					clickSeconds,
					impressed,
					impression,
					request,
					closed,
					hidden,
				} = this.state;

				if (closed || hidden) {
					break;
				}

				const conds = {
					firstIteration: loopSeconds === 0,
					// eslint-disable-next-line no-undef
					afterClick: clicked && clickSeconds >= GET_AFTER_CLICK,
					// eslint-disable-next-line no-undef
					changeImpressed: impressed && loopSeconds >= IMPRESSED_SHOW_SECONDS,
					// eslint-disable-next-line no-undef
					chaneNotImpressed: !impressed && loopSeconds >= NOT_IMPRESSED_SHOW_SECONDS,
				};
				log(`iterate slot ${this.props.slotId}`, conds.changeImpressed, this.state);
				// TODO: убрать большой try. Сделать два try там где действительно нужно.
				try {
					// GET AD
					if (conds.afterClick || conds.firstIteration || conds.changeImpressed || conds.chaneNotImpressed) {
						await this.setStateAsync({isLoading: true});
						// 2) Слот получает рекламу
						const response = await this.getAd({device, site, lang}).finally(e =>
							this.setStateAsync({
								loopSeconds: 0,
								impressionSeconds: 0,
								impressed: false,
								isLoading: false,
								clicked: false,
								clickSeconds: 0,
							}),
						);
						if (response) {
							// Реклама отображается в слоте.
							//const r = {"curl": "//dsp.ubex.io/v1/notice/ce0436d7-b30d-475d-bea8-bb4cd49e13fb/render", "url": "http://ubex.com/?utm_source=ubex-dsp&utm_medium=banner&utm_campaign=1231788", "impression": "ce0436d7-b30d-475d-bea8-bb4cd49e13fb", "request": "UBEX-d013990b-e120-4380-bd4a-a45ba7ed536c", "w": 300, "h": 250, "type": "BANNER_IMAGE"};
							// const r = {"impression": "c85b1ac9-c2de-4ee7-b219-45eca16b584b", "request": "UBEX-99d950b7-01b3-4082-b699-368729155a1c", "html": "\n\t<div>\n\t\t<a href='http://ubex.com/?utm_source=ubex-dsp&utm_medium=banner&utm_campaign=1231788' target='_top' style='text-decoration:none;'>\n\t\t\t<img id='ad' src='//dsp.ubex.io/v1/notice/c85b1ac9-c2de-4ee7-b219-45eca16b584b/render?bid=${AUCTION_PRICE}' style='width:300px;height:250px;border:0px;'/>\n\t\t</a>\n\t</div>\n\t", "w": 300, "h": 250, "type": "BANNER_HTML"};
							this.removeDuplicates();

							await this.setStateAsync(this.setContent(response));
							// Передается событие с унаикальным guid из шага 1, bid request id и imporession id.
							// Request id создает ssp, impression id создает DSP.
							if (!this.state.fallback) {
								await this.analyticsEvent('sendAdGet', {
									impression: this.state.impression,
									request: this.state.request,
									inventory: this.state.inventory,
								});
							} else if (this.state.impression) {
								await this.analyticsEvent('sendAdFallback', {
									request: this.state.request,
									inventory: this.state.inventory,
									impression: this.state.impression,
								});
							}
						}
					}

					// SET IMPRESSION
					if (inView && !impressed) {
						if (impressionSeconds < TIME_FOR_IMPRESS) {
							await this.setStateAsync({impressionSeconds: impressionSeconds + 1});
						} else if (!this.state.fallback) {
							await this.analyticsEvent('sendAdImp', {impression, request, inventory});
							await this.setStateAsync({
								impressed: true,
								loopSeconds: 0,
								impressionSeconds: 0,
							});
						}
					} else {
						await this.setStateAsync({
							impressionSeconds: 0,
						});
					}

					// NEXT ITERATE
					await delay(1000);
					await this.setStateAsync({loopSeconds: this.state.loopSeconds + 1});
					if (this.state.clicked) {
						await this.setStateAsync({clickSeconds: this.state.clickSeconds + 1});
					}
				} catch (e) {
					/* ON ERROR */
					// TODO: перенести в отдельный handler
					error(e);
					if (!this.state.fallback) {
						await this.setStateAsync({hideGUI: true});
					}
					await this.props.analyticsAPI.sendAdFailed(e);
					await delay(tryingTime * 1000);
					tryingTime = tryingTime === 0 ? 2 : tryingTime * 2;
				}
			}
			/* eslint-enable no-await-in-loop */
		};
	}



	getAd({device, site, lang}) {
		const xHeaders = this.getXHeaders();
		return sendRequest({
			method: 'POST',
			url: `${apiUrl}?id=${this.props.slotId}`,
			body: JSON.stringify({device, site, lang, uid: this.props.ubexId}),
			headers: {...xHeaders},
		})
			.then(response => {
				if (!response) {
					throw new Error('no response');
				}
				return JSON.parse(response);
			})
			.catch(e => {
				error('ad_get_failed');
				throw new Error(e);
			});
	}

	setSizesOnRespones(w, h) {
		 if (parseInt(this.outer.style.width) !== w || parseInt(this.outer.style.height) !== h) {
			this.outer.style.width = `${w}px`;
			this.outer.style.height = `${h}px`;
		}
	}

	setContent(response) {
		// eslint-disable-next-line camelcase
		const {html, fallback, curl, w, h, url, type, impression, request} = response;

		const params = {};
		if (!w || !h) {
			params.size = this.props.defaultSize;
		}
		this.setSizesOnRespones(w, h);
		if (html) {
			params.innerCode = html;
			params.frameUrl = null;
		} else if (curl) {
			params.frameUrl = curl;
			params.innerCode = null;
		} else {
			return {
				hideGUI: true,
				fallback: true,
				size: params.size,
			};
		}

		if (!impression) {
			warn('server do not resend "impression"', this.props.slotId);
		}
		if (!request) {
			warn('server do not resend "request"', this.props.slotId);
		}

		return {
			...params,
			impression,
			request,
			type,
			fallback: !!fallback,
			clickUrl: url,
			size: {w, h},
		};
	}

	removeDuplicates() {
		const elems = this.outer.querySelectorAll(`[id=ubx_${this.props.slotId}]`);
		if(elems.length > 1) {
			elems.forEach(e => {
				if(e.tagName !== 'IFRAME') {
					e.parentNode.removeChild(e);
				}
			});
		}
	}

	handlePostMessage({origin, data}) {
		if (origin !== frameHost) {
			//console.warn('wrong origin', origin, frameHost);
			return;
		}
		if (!data || !data.sid) {
			console.warn('no data', data);
			return;
		}
		if (data.sid !== this.props.slotId) {
			return;
		}
		console.log('get post message');
		switch (data.type) {
			case 'adClose':
				if (data.params && data.params.reason) {
					this.handleCloseAd(data.params.reason)
				}
				break;
			default:
				return;
		}
	}

	// 4) На рекламу кликают. Те же данные
	handleCustomerClick({x, y}) {
		this.setState({
			clicked: true,
		});
		if (!this.state.clickUrl) {
			return;
		}
		window.open(this.state.clickUrl, '_blank');

		this.analyticsEvent('sendAdClick', {
			impression: this.state.impression,
			x,
			y,
			after: this.state.loopSeconds,
		});
	}

	handleCloseAd(reason) {
		if (reason === 1) {
			this.setState({hidden: true});
			this.props.element.style.display = 'none';
		} else {
			this.setState({closed: true});
		}
		this.analyticsEvent('sendCloseAd', {
			impression: this.state.impression,
			reason,
			after: this.state.loopSeconds,
		});
	}

	analyticsEvent(method, params = {}) {
		// И не отсылаем статистику если тип баннера dummy
		if (this.state.type !== bannerTypes.dummy) {
			this.props.analyticsAPI[method](params);
		}
	}

	handleCloseBtnClick() {
		this.setState({
			showReasons: !this.state.showReasons,
		});
	}

	renderBtns() {
		if (this.state.fallback) {
			return null;
		}
		return [
			<Btn content={'Ad'} fontSize={11} pos={'left'} onClick={(e) => window.open('https://ubex.com', '_blank')}/>,
			<Btn content={String.fromCharCode(215)} pos={'right'} onClick={(e) => this.handleCloseBtnClick(e)}/>
		];
	}

	render() {

		if (this.state.hidden) {
			return null;
		}
		if (this.state.fallback) {
			return (
				<div className="ubx-wrapper ubx-wrapper--fallback">
				<AppSafeframe html={this.state.innerCode}
			         size={this.state.size}
			         slotId={this.props.slotId}/>
				<div className={`ubx_sf_${this.props.slotId}`} id={`ubx_${this.props.slotId}`} key={this.props.slotId} />
				</div>
			);
		}

		return (
			<InView
				as="div"
				className="ubx-wrapper ubx-wrapper--no-fallback"
				style={{
					fontSize: 0,
					width: this.state.size.w,
					height: this.state.size.h,
					overflow: 'hidden',
					outline: '1px solid #d7d7d7',
				}}

				threshold={VISIBILITY_THRESHOLD}
				onChange={inView => {
					// console.log(`change inView ${inView}`);
					this.setState({inView});
				}}

			>
				{!this.state.clickUrl || !this.state.clickUrl.length || this.state.innerCode ? null : (
					<div className="ubx-clicker" style={clickerStyle} onClick={e => this.handleCustomerClick(e)}/>
				)}
				<Overlay
					slotId={this.props.slotId}
					size={this.state.size}
					showReasons={this.state.showReasons}
					onCloseAd={reason => this.handleCloseAd(reason)}
				/>
				{this.renderBtns()}
				<UrlFrame url={this.state.frameUrl} size={this.state.size}/>
				<AppSafeframe html={this.state.innerCode} size={this.state.size} slotId={this.props.slotId}/>
				<div className={`ubx_sf_${this.props.slotId}`} id={`ubx_${this.props.slotId}`} key={this.props.slotId} />
			</InView>
		);
	}

	getXHeaders() {
		return {
			'x-trace': uuid4(),
			'x-span': uuid4(),
		};
	}
}
Slot.propTypes = {
	slotId: PropTypes.string.isRequired,
	ubexId: PropTypes.string.isRequired,
	inventory: PropTypes.string.isRequired,
	defaultSize: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
	analyticsAPI: PropTypes.shape({
		setUbexId: PropTypes.func,
		sendLoad: PropTypes.func,
		sendAdGet: PropTypes.func,
		sendAdImp: PropTypes.func,
		sendAdClick: PropTypes.func,
		sendCloseAd: PropTypes.func,
		sendAdFailed: PropTypes.func,
		sendAdFallback: PropTypes.func,
	}).isRequired,
};
export default Analytics(Slot);
