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
const apiUrl = 'https://stage.ubex.io:8090/v1/slot';

class Slot extends Component {
	constructor(props) {
		super(props);
		this.state = {
			innerCode: null,
			frameUrl: null,
			isLoading: false,
			width: null,
			height: null,
		};
	}

	componentDidMount() {
		this.setState({
			isLoading: true,
		});
		sendRequest({
			url: `${apiUrl}?id=${this.props.id}`,
		})
			.then(response => {
				if (!response) {
					throw new Error('no response');
				}
				const { html, curl, w, h, type } = JSON.parse(response)[this.props.id];

				if (html) {
					this.setState({
						innerCode: html,
						isLoading: false,
						width: w,
						height: h,
					});
				} else if (curl) {
					this.setState({
						frameUrl: curl,
						isLoading: false,
						width: w,
						height: h,
					});
				} else {
					this.setState({
						isLoading: false,
					});
				}
			})
			.catch(e => {
				console.error(e);
				this.setState({
					isLoading: false,
				});
			});
	}

	render() {
		if (this.state.isLoading) {
			return <Loader />;
		}
		if (this.state.innerCode) {
			return (
				<Overlay>
					<BlobFrame src={this.state.innerCode} width={this.state.width} height={this.state.height} />
				</Overlay>
			);
		}
		if (this.state.frameUrl) {
			return (
				<Overlay>
					<UrlFrame url={this.state.frameUrl} width={this.state.width} height={this.state.height} />
				</Overlay>
			);
		}
		return <Empty />;
	}
}

export default Slot;
