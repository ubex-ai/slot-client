/**
 * BlobFrame
 * */
import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import getBlobURL from '../tools/getBlobURL';
class BlobFrame extends Component {
	// componentDidMount() {
	// 	this.setState({
	// 		src: getBlobURL(this.props.src || '', 'text/html'),
	// 	});
	// }
	//
	// componentDidUpdate(prevProps) {
	// 	if(prevProps.src !== this.props.src) {
	// 		this.setState({
	// 			src: getBlobURL(this.props.src || '', 'text/html'),
	// 		});
	// 	}
	// }

	render() {
		const { size } = this.props;
		return (
			<iframe
				title="slotus_blob"
				srcDoc={this.props.src}
				width={size.w}
				height={size.h}
				scrolling="no"
				marginWidth="0"
				marginHeight="0"
				frameBorder="0"
				style={{ minHeight: '100%', minWidth: '100%', width: size.w, height: size.h }}
			/>
		);
	}
}

BlobFrame.propTypes = {
	src: PropTypes.string.isRequired,
	size: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
};

export default BlobFrame;
