/**
 * BlobFrame
 * */
import { h, Component } from 'preact';

class BlobFrame extends Component {
	componentDidMount() {
		this.setState({
			src: this.getGeneratedPageURL({
				html: this.props.src,
			}),
		});
	}

	getGeneratedPageURL({ html, css, js }) {
		const getBlobURL = (code, type) => {
			const blob = new Blob([code], { type });
			return URL.createObjectURL(blob);
		};

		const cssURL = getBlobURL(css, 'text/css');
		const jsURL = getBlobURL(js, 'text/javascript');

		const source = `${html || ''}`;

		return getBlobURL(source, 'text/html');
	}

	render() {
		return (
			<iframe
				title="slotus_blob"
				src={this.state.src}
				width={this.props.width}
				height={this.props.height}
				scrolling="no"
				marginWidth="0"
				marginHeight="0"
				frameBorder="0"
				style="min-height: 100%; min-width: 100%; "
			/>
		);
	}
}

export default BlobFrame;
