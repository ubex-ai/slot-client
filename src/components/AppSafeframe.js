import {h, Component} from 'preact';
import PropTypes from 'prop-types';
import {renderToStaticMarkup} from "react-dom/server";
import { warn, error } from '../tools';

class AppSafeframe extends Component {
	constructor(props) {
		super(props);
		this.pos = null;
	}

	componentDidMount(){
		this.updatePos();
	}

	componentDidUpdate(prevProps) {
		this.updatePos();
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.html !== this.props.html || nextProps.url !== this.props.url
	}

	componentWillUnmount() {
		$sf.host.nuke(this.props.slotId);
		delete this.pos;
	}

	updatePos() {

		const { slotId, size, html, url } = this.props;
		if(!html && !url) {
			error('no resource for safeframe');
			return;
		}
		$sf.host.nuke(slotId);

		const posConf = {
			id: slotId,
			dest: `ubx_${slotId}`,
			...size,
		};
		if(html) {
			posConf.html = html;
		} else {
			posConf.src = url;
		}
		this.pos = new $sf.host.Position(posConf);
		$sf.host.render(this.pos);
	}
}

AppSafeframe.propTypes = {
	slotId: PropTypes.object.isRequired,
	html: PropTypes.string.isRequired,
};

export default AppSafeframe;
