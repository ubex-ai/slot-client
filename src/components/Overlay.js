import { h } from 'preact';

	function Overlay() {
		const containerStyle = {position: 'relative', display: 'inline-block'};
		const overlayStyle = {position: 'absolute', width: '100%', height: '100%'};
		if(!this.state.show){
			overlayStyle.display = 'none';
		}
		return (
			<div style={containerStyle}>
				<div style={overlayStyle} />
				{this.props.children}
			</div>
		);
	}

export default Overlay;
