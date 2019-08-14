/**
 * Button
 */
import { h, Component } from 'preact';
import PropTypes from 'prop-types';

class GuiButton extends Component {
	constructor(props) {
		super(props);
		this.styles = {
			containerStyle: {
				cursor: 'pointer',
				...props.style,
			},
		};
	}

	render() {
		return (
			<div onClick={e => this.props.onClick(e)} style={this.styles.containerStyle}>
				{this.props.children}
			</div>
		);
	}
}

GuiButton.propsTypes = {
	style: PropTypes.object,
	onClick: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default GuiButton;
