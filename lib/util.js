'use strict';

/**
 * Loop through all top level properties of object and apply Math.round()
 *
 * @param {Object} obj
 * @return {Object}
 */
exports.round = (obj) => {
	const out = {};
	Object.keys(obj).forEach((key) => {
		const value = obj[key];
		out[key] = typeof value === 'number' ? Math.round(value) : value;
	});

	return out;
};

/**
 * Loop through all top level properties of object and multiply with amount
 *
 * @param {Object} obj
 * @param {Number} amount
 * @return {Object}
 */
exports.scale = (obj, amount) => {
	const out = {};
	Object.keys(obj).forEach((key) => {
		out[key] = obj[key] * amount;
	});

	return out;
};

/**
 * @param {Rectangle} rectangles
 * @return {Rectangle}
 */
exports.outerEdges = (...rectangles) => {
	const edges = {
		left: Math.min(...rectangles.map((r) => r.x)),
		top: Math.min(...rectangles.map((r) => r.y)),
		right: Math.max(...rectangles.map((r) => r.x + r.width)),
		bottom: Math.max(...rectangles.map((r) => r.y + r.height))
	};

	return {
		x: edges.left,
		y: edges.top,
		width: edges.right - edges.left,
		height: edges.bottom - edges.top
	};
};
