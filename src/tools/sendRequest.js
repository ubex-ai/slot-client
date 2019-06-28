import encodeParams from './encodeParams';

/**
 * sendRequest
 * @param url
 * @param params
 * @param method
 * @param body
 * @param headers
 * @return {Promise}
 */
function sendRequest({ url, params, method = 'GET', body = null, headers = null }) {
	return new Promise((resolve, reject) => {
		// check XMLHttpRequest support onload. if not, that is IE8,9, and use XDomainRequest.
		const XHR = 'onload' in new XMLHttpRequest() ? XMLHttpRequest : XDomainRequest;
		const xhr = new XHR();
		xhr.open(method, `${url}${params ? `?${encodeParams(params)}` : ''}`, true);
		if (headers) {
			Object.keys(headers).forEach(headerKey => xhr.setRequestHeader(headerKey, headers[headerKey]));
		}
		xhr.send(body);
		xhr.onload = arg => {
			resolve(xhr.response);
			/*
				if (this.status >= 200 && this.status < 300) {
					resolve(this, arg);
				}
				const error = new Error(this.statusText);
				error.response = this;
				reject(this, error);
			*/
		};
		xhr.onerror = arg => reject(new Error(arg));
	});
}

export default sendRequest;
