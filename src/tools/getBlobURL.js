const getBlobURL = (code, type) => {
	const blob = new Blob([code], { type });
	return URL.createObjectURL(blob);
};

export default getBlobURL;
