import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
	PostCloseBox,
	PostCloseHeader,
	GuiContainer,
	OverlayContainer,
	ReasonBtn,
	OverlayClicker,
	SpecBtn,
	ReasonBox,
	SpecBtnBox,
	AdSign,
	AdSignBox,
} from './OverlayStyles';
import { openUrl } from '../tools';
import StyledFrameWrapper from './StyledFrameWrapper';

class Overlay extends Component {
	constructor(props) {
		super(props);
		this.btns = {
			'closeReason.contentCover': 1,
			'closeReason.multipleView': 2,
			'closeReason.unacceptable': 3,
			'closeReason.notInteresting': 4,
		};

		this.state = {
			show: false,
			format: this.getFormat(this.props.size),
		};
	}

	componentDidUpdate(prevProps) {
		const { w, h } = this.props.size;
		if (prevProps.size.w !== w || prevProps.size.h !== h) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({
				format: this.getFormat(this.props.size),
			});
		}
	}

	renderSpecBtns() {
		if(this.props.hideGUI) {
			return null;
		}
		return [
			<AdSignBox title="ubex.com" onClick={() => openUrl('https://ubex.com')}>
				<AdSign>Ad</AdSign>
			</AdSignBox>,
			<SpecBtnBox>
				{!this.props.closed ? (
					<SpecBtn
						title={this.props.intl.formatMessage({ id: 'close' })}
						onClick={() => this.setState({ show: !this.state.show })}
					>
						<span>&times;</span>
					</SpecBtn>
				) : null}
			</SpecBtnBox>,
		];
	}

	renderCloseReasons() {
		if(this.props.hideGUI) {
			return null;
		}
		return (
			<ReasonBox format={this.state.format}>
				{!this.props.closed ? (
					Object.keys(this.btns).map(msgId => (
						<ReasonBtn onClick={e => this.props.onCloseAd(this.btns[msgId])}>
							<FormattedMessage id={msgId} />
						</ReasonBtn>
					))
				) : (
					<PostCloseBox>
						<PostCloseHeader>
							<FormattedMessage id="closeMsg.header" />
						</PostCloseHeader>
						<FormattedMessage id="closeMsg.txt" />
					</PostCloseBox>
				)}
			</ReasonBox>
		);
	}

	render() {
		const { onClickAd, size } = this.props;

		return (
			<StyledFrameWrapper size={size}>
				<OverlayContainer style={{width: size.w, height: size.h }}>
					{!this.state.show && !this.props.hideGUI ? <OverlayClicker onClick={e => onClickAd(e)} /> : null}
					<GuiContainer show={this.state.show}>{this.renderCloseReasons()}</GuiContainer>
					{this.renderSpecBtns()}
				</OverlayContainer>
			</StyledFrameWrapper>
		);
	}

	getFormat({ w, h }) {
		switch (true) {
			case w < h || w - h <= 70:
				return 'ver';
			case w > h:
				return 'hor';
			default:
				return 'ver';
		}
	}
}

Overlay.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	closed: PropTypes.bool.isRequired,
	hideGUI: PropTypes.bool.isRequired,
	onClickAd: PropTypes.func.isRequired,
	onCloseAd: PropTypes.func.isRequired,
	intl: PropTypes.object.isRequired,
	size: PropTypes.shape({
		w: PropTypes.number,
		h: PropTypes.number,
	}).isRequired,
};

export default injectIntl(Overlay);
