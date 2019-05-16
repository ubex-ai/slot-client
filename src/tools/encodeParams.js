function encodeParams(params) {
	return Object.keys(params).map(function (k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
	}).join('&');
}

export default encodeParams;