import { h, Component } from 'preact';
import PropTypes from 'prop-types';
function Frame({ url, size }) {
	if(!url){
		return;
	}
	return (
		<iframe
			title="slotus_url"
			src={url}
			width={size.w}
			height={size.h}
			scrolling="no"
			marginWidth="0"
			marginHeight="0"
			frameBorder="0"
			style={{ minHeight: '100%', minWidth: '100%', zIndex: 0 }}
		/>
	);
}

Frame.propTypes = {
	url: PropTypes.string.isRequired,
	size: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
};
export default Frame;
