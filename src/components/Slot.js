/**
 * Slot
 */
import { h, Component } from 'preact';
import sendRequest from '../tools/sendRequest';
import Loader from './Loader';
import Overlay from './Overlay';
import BlobFrame from './BlobFrame';
import UrlFrame from './UrlFrame';
import Empty from './Empty';
import AnalyticsBehavior from './Analytics';
import delay from '../tools/delay';

const apiUrl = 'https://stage.ubex.io:8090/v1/slot';


const SHOW_TIME_SECONDS = 60;
class Slot extends Component {
	constructor(props) {
		super(props);
		this.interval = null;
		this.state = {
			seconds: 0,
			impressionId: 1,
			impressed: false,
			innerCode: null,
			frameUrl: null,
			isLoading: false,
			width: null,
			height: null,
			clickUrl: 'https://google.com',
		};
	}

	// 1) Загружается слот.
	componentDidMount() {
		this.runLoop();
	}

	componentWillUnmount() {
		this.interval = null;
		delete this.interval;
	}

	runLoop() {
		// Передается событие
		this.props.analyticsAPI.sendLoad();
		return async () => {
			while (true) {
				try {
					// 2) Слот получает рекламу
					await this.getAd();
					// Реклама отображается в слоте.
					this.setContent(response);
					// Передается событие с унаикальным guid из шага 1, bid request id и imporession id. Request id создает ssp, impression id создает DSP.
					this.props.analyticsAPI.sendAdGet(1);
					// TODO: менять время в зависимости от this.state.impressed;
					await delay(SHOW_TIME_SECONDS * 1000);
				} catch (e) {
					this.handleGetAdError(e);
				}
			}
		};
	}

	getAd() {
		this.setState({isLoading: true});
		return sendRequest({
			url: `${apiUrl}?id=${this.props.slotId}`,
		})
			.then(response => {
				if (!response) {
					throw new Error('no response');
				}
			})
			.catch(e => this.handleGetAdError(e)).finally(e => this.setState({
				isLoading: false,
			}));
	}

	handleSlotInView(inView = false) {
		if(inView && !this.interval){
			this.interval = setTimeout(()=>{
				this.props.analyticsAPI.sendAdImp(this.state.impressionId).then(()=>this.setState({
					impressed: true,
				}))
			}, 2000);
		}else if(!inView && this.interval) {
			clearInterval(this.interval);
		}
	}

	handleGetAdError(error) {
		console.error(error);
		// Если кривой баннер или ошибка сразу перезапрашивай
		return this.getAd();
	}

	// 4) На рекламу кликают. Те же данные
	onClickOverlay(e) {
		const w = window.open(this.state.clickUrl, '_blank');
		this.props.analyticsAPI.sendAdClick(this.state.impressionId, e.clientX, e.clientY, this.state.seconds);
		w.focus();
	}

	setContent(response) {
		const { html, curl, w, h } = JSON.parse(response)[this.props.slotId];
		if (html) {
			this.setHtmlContent({ html, w, h });
		} else if (curl) {
			this.setCurlContent({ curl, w, h });
		}
	}

	setHtmlContent({ html, w, h }) {
		this.setState({
			innerCode: html,
			width: w,
			height: h,
		});
	}

	setCurlContent({ curl, w, h }) {
		this.setState({
			frameUrl: curl,
			width: w,
			height: h,
		});
	}


	render() {
		if (this.state.isLoading) {
			return <Loader />;
		}
		if (!this.state.innerCode && !this.state.frameUrl) {
			return <Empty />;
		}

		return (
			<Overlay onClick={e => this.onClickOverlay(e)} inView={inView => this.handleSlotInView(inView)}>
				{this.state.innerCode ? (
					<BlobFrame src={this.state.innerCode} width={this.state.width} height={this.state.height} />
				) : (
					<UrlFrame url={this.state.frameUrl} width={this.state.width} height={this.state.height} />
				)}
			</Overlay>
		);
	}
}

export default AnalyticsBehavior(Slot);
