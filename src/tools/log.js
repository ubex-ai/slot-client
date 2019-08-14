const log = (...args) => {
	if(DEV_MODE || window.ubx_debug) {
		args.unshift("%c[UBX_DEBUG_LOG] :: ",
			`color: #8942ae; font-weight: bold; text-shadow: 0 0 5px rgba(0,0,0,0.2);`);
		console.log.apply(console, args);
	}
};

const error = (...args) => {
	if(DEV_MODE || window.ubx_debug) {
		args.unshift("%c[UBX_DEBUG_ERROR] :: ",
			`color: #BA2448; font-weight: bold; text-shadow: 0 0 5px rgba(0,0,0,0.2);`);
		console.error.apply(console, args);
	}
};

const warn = (...args) => {
	if(DEV_MODE || window.ubx_debug) {
		args.unshift("%c[UBX_DEBUG_WARN] :: ",
			`color: #ba2e91; font-weight: bold; text-shadow: 0 0 5px rgba(0,0,0,0.2);`);
		console.warn.apply(console, args);
	}
};

export {
	log,
	warn,
	error,
};
