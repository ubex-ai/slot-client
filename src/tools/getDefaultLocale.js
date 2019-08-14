export default function() {
	if (navigator.language) {
		return navigator.language;
	} else if (navigator.languages && navigator.languages.length) {
		return navigator.languages[0];
	} else {
		return navigator.userLanguage || navigator.browserLanguage || 'en';
	}
}
