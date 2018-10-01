'use strict';

const util = require('./util');

const modes = {
	TIGHT_AREA_OF_INTEREST: 'areaOfInterest',
	TIGHT_AREA_OF_INTEREST_FOCUS_POINT: 'areaOfInterestWithFocusPoint',
	FOCUS_POINT: 'focusPoint',
	SAFE: 'safe'
};

exports.modes = modes;

/**
 * @typedef {Object} AreaOfInterestImgae
 * @property {Number} width
 * @property {Number} height
 * @property {AreaOfInterest} aoi
 */

/**
 * @typedef {Object} AreaOfInterest
 * @property {Number} width
 * @property {Number} height
 * @property {Number} x
 * @property {Number} y
 * @property {Point} focus
 * @property {String} origin
 */

/**
 * @typedef {Object} Size
 * @property {Number} width
 * @property {Number} height
 */

/**
 * @typedef {Object} Point
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @typedef {Object} Rectangle
 * @property {Number} width
 * @property {Number} height
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @typedef {Object} Sides
 * @property {Number} left
 * @property {Number} top
 * @property {Number} right
 * @property {Number} bottom
 */

/**
 * @typedef {Object} CropData
 * @property {Rectangle} crop
 * @property {Size} size
 */

/**
 * @param {Size} targetSize
 * @param {AreaOfInterestImgae} image
 * @param {String} mode
 * @return {CropData}
 */
// eslint-disable-next-line complexity
exports.getCrop = (targetSize, image, mode = modes.FOCUS_POINT) => {
	if (targetSize.width < 1 || targetSize.height < 1) {
		throw new Error('Target width and height must be positive integers');
	}

	const imageRatio = image.width / image.height;
	const targetRatio = targetSize.width / targetSize.height;
	const areaOfInterest = Object.assign({
		x: 0,
		y: 0,
		width: image.width,
		height: image.height
	}, image.aoi);
	const focusPoint = areaOfInterest.focus || getCenter(areaOfInterest);
	if (imageRatio < targetRatio) {
		switch (mode) {
			case modes.TIGHT_AREA_OF_INTEREST:
				return exports.cropAreaOfInterestVertical(areaOfInterest, targetSize);
			case modes.TIGHT_AREA_OF_INTEREST_FOCUS_POINT:
				return exports.cropAreaOfInterestVertical(areaOfInterest, targetSize, focusPoint);
			case modes.SAFE:
				return exports.cropVerticalSafe(areaOfInterest, image, targetSize, focusPoint);
			default:
				return exports.cropVerticalCenter(image, focusPoint, targetSize);
		}
	} else {
		switch (mode) {
			case modes.TIGHT_AREA_OF_INTEREST:
				return exports.cropAreaOfInterestHorizontal(areaOfInterest, targetSize, image.width);
			case modes.TIGHT_AREA_OF_INTEREST_FOCUS_POINT:
				return exports.cropAreaOfInterestHorizontal(areaOfInterest, targetSize, image.width, focusPoint);
			case modes.SAFE:
				return exports.cropHorizontalSafe(areaOfInterest, image, targetSize, focusPoint);
			default:
				return exports.cropHorizontalCenter(image, focusPoint, targetSize);
		}
	}
};

/**
 * @param {Size} originalSize
 * @param {Point} center
 * @param {Size} targetSize
 * @return {CropData}
 */
exports.cropHorizontalCenter = (originalSize, center, {width, height}) => {
	const newWidth = (width / height) * originalSize.height;
	let left = Math.max(Math.round(center.x - newWidth / 2), 0);
	const right = Math.min(left + newWidth, originalSize.width);

	left = right - newWidth;

	const crop = {
		x: left,
		y: 0,
		width: right - left,
		height: originalSize.height
	};

	return {
		crop,
		size: {width, height},
		method: 'cropHorizontalCenter'
	};
};

/**
 * @param {Size} originalSize
 * @param {Point} center
 * @param {Size} targetSize
 * @return {CropData}
 */
exports.cropVerticalCenter = (originalSize, center, {width, height}) => {
	const newHeight = (height / width) * originalSize.width;
	let top = Math.max(Math.round(center.y - newHeight / 2), 0);
	const heightExceed = (top + newHeight) - originalSize.height;

	if (heightExceed > 0) {
		top -= heightExceed;
	}

	const crop = {
		x: 0,
		y: top,
		width: originalSize.width,
		height: newHeight
	};

	return {
		crop,
		size: {width, height},
		method: 'cropVerticalCenter'
	};
};

/**
 * @param {AreaOfInterest} areaOfInterest
 * @param {Size} originalSize
 * @param {Size} targetSize
 * @param {Point} center
 * @return {CropData}
 */
exports.cropHorizontalSafe = (areaOfInterest, originalSize, {width, height}, center) => {
	const crop = exports.cropHorizontalCenter(originalSize, center, {width, height}).crop;

	const cuttable = exports.getCuttableArea(areaOfInterest, crop);
	const cuttableResized = util.scale(cuttable, width / originalSize.width);

	let appliedWidth = width;
	if (cuttable.right < 0) {
		crop.x = crop.x + cuttable.left;
		crop.width = crop.width + (Math.abs(cuttable.right) - cuttable.left);
		appliedWidth = width + Math.abs(cuttableResized.right) - cuttableResized.left;
	} else if (cuttable.left < 0) {
		crop.x = crop.x - Math.abs(cuttable.left);
		crop.width = Math.max(areaOfInterest.width, crop.width);
	}

	// How much of the original image width that is included in the area of interest
	const widthRatio = areaOfInterest.width / originalSize.width;
	const scaleAfterCrop = appliedWidth / originalSize.width;
	const maxHeight = originalSize.height * scaleAfterCrop / widthRatio;

	let appliedHeight = height;
	if (maxHeight < appliedHeight) {
		appliedHeight = maxHeight * (width / appliedWidth);
		appliedWidth = width;
	}

	return {
		crop,
		size: util.round({width: appliedWidth, height: appliedHeight}),
		method: 'cropHorizontalSafe'
	};
};

/**
 * @param {AreaOfInterest} areaOfInterest
 * @param {Size} originalSize
 * @param {Size} targetSize
 * @param {Point} center
 * @return {CropData}
 */
exports.cropVerticalSafe = (areaOfInterest, originalSize, {width, height}, center) => {
	const crop = exports.cropVerticalCenter(originalSize, center, {width, height}).crop;
	let cuttable = exports.getCuttableArea(areaOfInterest, crop);

	// When we have cut too much from top, we move the y-offset to include the cut area
	if (cuttable.top < 0) {
		const missingFromTop = Math.abs(cuttable.top);
		crop.y = crop.y - missingFromTop;
		cuttable = exports.getCuttableArea(areaOfInterest, crop);
	}

	if (cuttable.bottom < 0) {
		const missingFromBottom = Math.abs(cuttable.bottom);
		crop.height = crop.height + missingFromBottom;
		if (cuttable.top > 0) {
			const maxCutTop = Math.min(missingFromBottom, cuttable.top);
			crop.y = crop.y + maxCutTop;
			crop.height = crop.height - maxCutTop;
		}
	}

	height = crop.height * width / originalSize.width;

	return {
		crop,
		size: util.round({width, height}),
		method: 'cropVerticalSafe'
	};
};

/**
 * @param {AreaOfInterest} areaOfInterest
 * @param {Size} targetSize
 * @param {Number} rightEdge
 * @param {Point} center
 * @return {CropData}
 */
exports.cropAreaOfInterestHorizontal = (areaOfInterest, {width, height}, rightEdge, center) => {
	if (!center) {
		center = getCenter(areaOfInterest);
	}
	const newWidth = (width / height) * areaOfInterest.height;
	const crop = {
		// Compress x to value that allows filling the desired width
		x: Math.min(center.x - (newWidth / 2), rightEdge - newWidth),
		y: areaOfInterest.y,
		width: newWidth,
		height: areaOfInterest.height
	};

	return {
		crop,
		size: {width, height},
		method: 'cropAreaOfInterestHorizontal'
	};
};

/**
 * @param {AreaOfInterest} areaOfInterest
 * @param {Size} targetSize
 * @param {Point} center
 * @return {CropData}
 */
exports.cropAreaOfInterestVertical = (areaOfInterest, {width, height}, center) => {
	if (!center) {
		center = getCenter(areaOfInterest);
	}

	const newHeight = (height / width) * areaOfInterest.width;

	const crop = {
		x: areaOfInterest.x,
		// Prevent top from being outside of image frame
		y: Math.max(0, center.y - (newHeight / 2)),
		width: areaOfInterest.width,
		height: newHeight
	};

	return {
		crop,
		size: {width, height},
		method: 'cropAreaOfInterestVertical'
	};
};

/**
 * Get data about how much more can be cut from each edge while still including the entire area of interest
 *
 * Negative values mean that parts of the area of interest have been cut in order to support the crop
 *
 * @param {Rectangle} areaOfInterest
 * @param {Rectangle} crop
 * @return {Sides}
 */
exports.getCuttableArea = (areaOfInterest, crop) => {
	return {
		left: areaOfInterest.x - crop.x,
		right: (crop.x + crop.width) - (areaOfInterest.width + areaOfInterest.x),
		top: areaOfInterest.y - crop.y,
		bottom: (crop.y + crop.height) - (areaOfInterest.height + areaOfInterest.y)
	};
};

/**
 * Get data about how much of the source image has been cut from each edge.
 *
 * @param {Size} imageData
 * @param {Rectangle} crop
 * @return {Sides}
 */
exports.getCutArea = (imageData, crop) => {
	return {
		left: crop.x,
		right: imageData.width - crop.x - crop.width,
		top: crop.y,
		bottom: imageData.height - crop.y - crop.height
	};
};

/**
 * @param {Rectangle} rect
 * @return {Object} center
 */
function getCenter(rect) {
	const x = rect.x + rect.width / 2;
	const y = rect.y + rect.height / 2;

	return {x, y};
}

