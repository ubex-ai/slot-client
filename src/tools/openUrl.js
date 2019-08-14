export default url => {
	const w = window.open(url, '_blank');
	w.focus();
	// console.log(`open ${url}`);
};
