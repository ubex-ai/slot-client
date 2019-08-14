import Fingerprint2 from 'fingerprintjs2';
const fpExcludes = {
	userAgent: false,
	webdriver: true,
	language: false,
	colorDepth: true,
	deviceMemory: true,
	pixelRatio: true,
	hardwareConcurrency: true,
	screenResolution: false,
	availableScreenResolution: true,
	timezoneOffset: false,
	timezone: false,
	sessionStorage: true,
	localStorage: true,
	indexedDb: true,
	addBehavior: true,
	openDatabase: true,
	cpuClass: true,
	platform: false,
	doNotTrack: true,
	plugins: true,
	canvas: true,
	webgl: true,
	webglVendorAndRenderer: true,
	adBlock: true,
	hasLiedLanguages: true,
	hasLiedResolution: true,
	hasLiedOs: true,
	hasLiedBrowser: true,
	touchSupport: false,
	fonts: true,
	fontsFlash: true,
	audio: true,
	enumerateDevices: true,
};

export const getDeviceData = async function(options) {
	const data = await Fingerprint2.getPromise({ excludes: fpExcludes, ...options });
	const result = {};
	data.forEach(component => {
		result[component.key] = component.value;
	});
	return formatFp(result);
};

export default getDeviceData;

/**
 * Return browser information
 * https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/master/AdCOM%20v1.0%20FINAL.md#object--device-
 * @param userAgent
 * @param platform
 * @param screenResolution
 * @param pixelRatio
 * @param touchSupport
 * @param language
 * @param timezone
 * @param timezoneOffset
 * @returns {{w: *, h: *, ppi: *, model: *, ua: *, lng: *, tz: *, tzo: *}}
 */
const formatFp = ({
	userAgent,
	platform,
	screenResolution,
	pixelRatio,
	touchSupport,
	language,
	timezone,
	timezoneOffset,
}) => ({
	// Browser user agent string.
	ua: userAgent,
	// Device model (e.g., “iPhone10,1” when the specific device model is known, “iPhone” otherwise). The value obtained from the device O/S should be used when available.
	model: platform,
	// 	Physical width of the screen in pixels.
	w: screenResolution[0],
	// Physical height of the screen in pixels.
	h: screenResolution[1],
	// 	Screen size as pixels per linear inch.
	ppi: pixelRatio,
	// touch support
	ts: touchSupport > 0,
	// language
	lng: language,
	// timezone offset
	tz: timezone,
	tzo: timezoneOffset,
});
