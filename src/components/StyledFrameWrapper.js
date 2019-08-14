/**
 * Wrapper
 */
import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { StyleSheetManager } from 'styled-components';
import ReactFrame, { FrameContextConsumer } from 'react-frame-component';

const overlayFrameStyles = size => ({
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	padding: 0,
	margin: 0,
	border: 0,
	overflow: 'hidden',
	width: size.w,
	height: size.h,
});

const StyledFrameWrapper = props => {
	const { size, children, ...rest } = props;
	return (
		<ReactFrame
			style={overlayFrameStyles(size)}
			scrolling="no"
			marginWidth="0"
			marginHeight="0"
			src="about:blank"
			frameBorder="0"
			initialContent='<!DOCTYPE html><html><head></head><body><div id="mountHere"></div></body></html>'
			mountTarget='#mountHere'
			{...rest}
		>
			<FrameContextConsumer>
				{({ document }) => <StyleSheetManager target={document.body}>{children}</StyleSheetManager>}
			</FrameContextConsumer>
		</ReactFrame>
	);
};

StyledFrameWrapper.propTypes = {
	size: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default StyledFrameWrapper;
