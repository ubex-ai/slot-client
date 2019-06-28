import { h } from 'preact';
import { InView } from 'react-intersection-observer';

function Overlay() {
	const containerStyle = { position: 'relative', display: 'inline-block' };
	const overlayStyle = { position: 'absolute', width: '100%', height: '100%' };
	if (!this.state.show) {
		overlayStyle.display = 'none';
	}
	return (
		<InView as="div" onChange={inView => (inView ? this.props.inView(inView) : null)}>
			<div style={containerStyle} onClick={this.props.onClick}>
				<div style={overlayStyle} />
				{this.props.children}
			</div>
		</InView>
	);
}

export default Overlay;
