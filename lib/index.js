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
 * @return {String}
 */
exports.getResizedImageUrl = (imageUrl, targetSize, actions, transformToken) => {
	const baseUrl = imageUrl.split('?')[0];

	return getImageUrl(baseUrl, Object.assign({}, actions, {
		resize: targetSize,
		strip: true
	}), transformToken);

	function getImageUrl(baseUrl, actions, accessToken) {
		const url = baseUrl + '?' + actionsToQueryParam(actions);
		return encodeURI(url + '&accessToken=' + createSignature(accessToken, url));

		function actionsToQueryParam(actions) {
			return decodeURI(qs.stringify({t: actions}));
		}

		function createSignature(key, url) {
			return crypto
				.createHmac('sha256', Buffer.from(key, 'utf8'))
				.update(url)
				.digest('hex');
		}
	}
};
