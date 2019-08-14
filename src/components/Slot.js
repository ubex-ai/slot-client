/**
 * Slot
 */
import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { InView } from 'react-intersection-observer';
import uuid4 from 'uuid4';
import { sendRequest, openUrl, getDeviceData, log, error, warn, delay } from '../tools';
import { Overlay, UrlFrame, Analytics, AppSafeframe } from '../components';
import { colors } from './OverlayStyles';

// eslint-disable-next-line no-undef
const apiUrl = API_URL;
const TIME_FOR_IMPRESS = 2;
const VISIBILITY_THRESHOLD = 0.6;
const bannerTypes = { dummy: 'BANNER_DUMMY', html: 'BANNER_HTML', image: 'BANNER_IMAGE' };

class Slot extends Component {
	constructor(props) {
		super(props);
		this.loop = null;

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
			fallback: false, // у HTML баннеров будет "fallback": true прилетать когда будет прилетать пользовательская заглушка
			size: props.defaultSize,
		};
	}

	componentDidMount() {
		this.loop = this.runLoop();
		this.loop();
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
			nextState.size !== this.state.size
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
			const site = { page: window.location.href, ref: document.referrer };
			// Передается событие
			await this.analyticsEvent('sendLoad');
			/* eslint-disable no-await-in-loop */
			let tryingTime = 0;
			while (true) {
				const { inventory } = this.props;
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
				log(`iterate slot ${this.props.slotId}`, this.state);
				// TODO: убрать большой try. Сделать два try там где действительно нужно.
				try {
					// GET AD
					if (conds.afterClick || conds.firstIteration || conds.changeImpressed || conds.chaneNotImpressed) {
						await this.setStateAsync({ isLoading: true });
						// 2) Слот получает рекламу
						const response = await this.getAd({ device, site }).finally(e =>
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
							await this.setStateAsync({ impressionSeconds: impressionSeconds + 1 });
						} else if (!this.state.fallback) {
							await this.analyticsEvent('sendAdImp', { impression, request, inventory });
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
					await this.setStateAsync({ loopSeconds: this.state.loopSeconds + 1 });
					if(this.state.clicked) {
						await this.setStateAsync({ clickSeconds: this.state.clickSeconds + 1 });
					}
				} catch (e) {
					/* ON ERROR */
					// TODO: перенести в отдельный handler
					error(e);
					if (!this.state.fallback) {
						await this.setStateAsync({ hideGUI: true });
					}
					await this.props.analyticsAPI.sendAdFailed(e);
					await delay(tryingTime * 1000);
					tryingTime = tryingTime === 0 ? 2 : tryingTime * 2;
				}
			}
			/* eslint-enable no-await-in-loop */
		};
	}

	getAd({ device, site }) {
		const xHeaders = this.getXHeaders();
		return sendRequest({
			method: 'POST',
			url: `${apiUrl}?id=${this.props.slotId}`,
			body: JSON.stringify({ device, site }),
			headers: { ...xHeaders },
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

	setContent(response) {
		// eslint-disable-next-line camelcase
		const { html, fallback, curl, w, h, url, type, impression, request } = response;

		const params = {};

		if (!w || !h) {
			params.size = this.props.defaultSize;
		}
		if (html) {
			params.innerCode = html;
		} else if (curl) {
			params.frameUrl = curl;
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
			hideGUI: !!fallback,
			fallback: !!fallback,
			clickUrl: url,
			size: { w, h },
		};
	}

	// 4) На рекламу кликают. Те же данные
	handleCustomerClick(e) {
		console.log('click');
		this.setState({
			clicked: true,
		});
		if (!this.state.clickUrl) {
			return;
		}
		openUrl(this.state.clickUrl);

		this.analyticsEvent('sendAdClick', {
			impression: this.state.impression,
			x: e.clientX,
			y: e.clientY,
			after: this.state.loopSeconds,
		});
	}

	handleCloseAd(reason) {
		if (reason === 1) {
			this.setState({ hidden: true });
			this.props.element.style.display = 'none';
		} else {
			this.setState({ closed: true });
		}
		this.analyticsEvent('sendCloseAd', {
			impression: this.state.impression,
			reason,
			after: this.state.loopSeconds,
		});
	}

	getRenderComponent() {
		const { size, innerCode, frameUrl } = this.state;
		if (!innerCode && !frameUrl) {
			return null;
		}
		if (this.state.frameUrl) {
			// в banner_html может быть или html с кодом или curl одно из них
			return <UrlFrame url={frameUrl} size={size} />;
			// return <AppSafeframe url={frameUrl} size={size} slotId={this.props.slotId}/>;
		}

		return <AppSafeframe html={innerCode} size={size} slotId={this.props.slotId} />;
		//return <BlobFrame src={innerCode} size={size} />;
	}

	analyticsEvent(method, params = {}) {
		// И не отсылаем статистику если тип баннера dummy
		if (this.state.type !== bannerTypes.dummy) {
			this.props.analyticsAPI[method](params);
		}
	}

	render() {
		if (this.state.hidden) {
			return null;
		}
		if (this.state.fallback) {
			return <div className="ubx-wrapper">{this.getRenderComponent()}</div>;
		}

		return (
			<InView
				as="div"
				className="ubx-wrapper"
				style={{
					fontSize: 0,
					width: this.state.size.w,
					height: this.state.size.h,
					outline: `1px solid ${colors.borderColor}`,
				}}
				threshold={VISIBILITY_THRESHOLD}
				onChange={inView => this.setState({ inView })}
			>
				{this.getRenderComponent()}
				<Overlay
					hideGUI={this.state.hideGUI}
					size={this.state.size}
					closed={this.state.closed}
					onCloseAd={reason => this.handleCloseAd(reason)}
					onClickAd={e => this.handleCustomerClick(e)}
				/>
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
