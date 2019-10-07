import { h, Component } from 'preact';
import PropTypes from 'prop-types';


const overlayFrameStyles = {
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	padding: 0,
	margin: 0,
	border: 0,
	overflow: 'hidden',
	height: '100%',
	width: '100%',
	zIndex: 1,
};



class Overlay extends Component {
	constructor(props) {
		super(props);
		this.frame = null;
	}

	render() {
		const { slotId, size } = this.props;
		const frameUrl = 'https://static.ubex.io/slot_gui/index.html'; //'http://0.0.0.0:8081';//
		return (
			<iframe
				style={{...overlayFrameStyles, display: (this.props.showReasons ? 'block' : 'none')}}
				src={`${frameUrl}?w=${size.w}&h=${size.h}&sid=${slotId}`} />
			);
	}
}

Overlay.propTypes = {
	slotId: PropTypes.string.isRequired,
	showReasons: PropTypes.bool.isRequired,
	onClickAd: PropTypes.func.isRequired,
	onCloseAd: PropTypes.func.isRequired,
	size: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
};

export default Overlay;
