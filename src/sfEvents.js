import { log } from './tools';

/**
 * A function that gets called each time a position sends a request for some functionality. Returning true cancels the command request.
 * @param id
 * @param msgName
 * @param data
 */
export const onBeforePosMsg = (id, msgName, data) => {
	log('Safeframe event: onBeforePosMsg');
	log(id, msgName, data);
};

/**
 * A function which gets called each time a position has finished rendering
 * @param id
 */
export const onEndPosRender = (id) => {
	log('Safeframe event: onEndPosRender');
	log(id);
};

/**
 * A function which gets called anytime a render call has failed or timed out
 * @param id
 */
export const onFailure = (id) => {
	log('Safeframe event: onFailure');
	log(id);
};

/**
 * A callback function which gets called each time a position sends a message up to your web page
 * @param id
 * @param msgName
 * @param data
 */
export const onPosMsg = (id, msgName, data) => {
	log('Safeframe event: onPosMsg');
	log(id, msgName, data);
};

/**
 * A callback function which gets called each time a position is about to be rendered
 * @param id
 */
export const onStartPosRender = (id) => {
	log('Safeframe event: onStartPosRender');
	log(id);
};
