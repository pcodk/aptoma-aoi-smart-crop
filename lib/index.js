'use strict';

const qs = require('qs');
const crypto = require('crypto');

const cropper = require('./crop');

exports.getCrop = cropper.getCrop;
exports.getCuttableArea = cropper.getCuttableArea;
exports.getCutArea = cropper.getCutArea;
exports.modes = cropper.modes;

/**
 * @param {String} imageUrl
 * @param {Size} targetSize
 * @param {Object} actions
 * @param {String} transformToken
 * @param {Object} params extra GET params
 * @return {String}
 */
exports.getResizedImageUrl = (imageUrl, targetSize, actions, transformToken, params = {}) => {
	normalizeActions(actions);
	const baseUrl = imageUrl.split('?')[0];

	if (targetSize.width < 1 || targetSize.height < 1) {
		throw new Error('Target width and height must be positive integers');
	}

	actions = Object.assign(
		{strip: true},
		actions,
		{resize: targetSize}
	);

	if (!actions.strip) {
		delete actions.strip;
	}

	return getImageUrl(baseUrl, actions, transformToken);

	function getImageUrl(baseUrl, actions, accessToken) {
		const url = baseUrl + '?' + actionsToQueryParam(actions);
		return encodeURI(url + '&accessToken=' + createSignature(accessToken, url));

		function actionsToQueryParam(actions) {
			return decodeURI(qs.stringify(Object.assign({}, params, {t: actions})));
		}

		function createSignature(key, url) {
			return crypto
				.createHmac('sha256', Buffer.from(key, 'utf8'))
				.update(url)
				.digest('hex');
		}
	}
};

function normalizeActions(actions) {
	if (actions.crop) {
		actions.crop.x = Math.round(actions.crop.x);
		actions.crop.y = Math.round(actions.crop.y);
		actions.crop.height = Math.ceil(actions.crop.height);
		actions.crop.width = Math.ceil(actions.crop.width);
	}
}
