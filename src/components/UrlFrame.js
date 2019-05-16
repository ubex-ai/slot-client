export default function Frame(props) {
	return (
		<iframe
			title="slotus_url"
			src={props.url}
			width={props.width}
			height={props.height}
			scrolling="no"
			marginWidth="0"
			marginHeight="0"
			frameBorder="0"
			style="min-height: 100%; min-width: 100%; "
		/>
	);
}
