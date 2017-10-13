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
 * @typedef {Object} Size
 * @property {Number} width
 * @property {Number} height
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
 * @param {Object} image
 * @param {String} mode
 * @return {CropData}
 */
exports.getCrop = (targetSize, image, mode = modes.FOCUS_POINT) => {
	const imageRatio = image.width / image.height;
	const targetRatio = targetSize.width / targetSize.height;
	const areaOfInterest = image.aoi;
	const center = image.focusPoint || getCenter(areaOfInterest);
	if (imageRatio < targetRatio) {
		switch (mode) {
			case modes.TIGHT_AREA_OF_INTEREST:
				return exports.cropAreaOfInterestVertical(areaOfInterest, targetSize.width, targetSize.height);
			case modes.TIGHT_AREA_OF_INTEREST_FOCUS_POINT:
				return exports.cropAreaOfInterestVertical(areaOfInterest, targetSize.width, targetSize.height, center);
			case modes.SAFE:
				return exports.cropVerticalSafe(areaOfInterest, image, targetSize.width, targetSize.height, center);
			default:
				return exports.cropVerticalCenter(image, center, targetSize.width, targetSize.height);
		}
	} else {
		switch (mode) {
			case modes.TIGHT_AREA_OF_INTEREST:
				return exports.cropAreaOfInterestHorizontal(areaOfInterest, targetSize.width, targetSize.height, image.width);
			case modes.TIGHT_AREA_OF_INTEREST_FOCUS_POINT:
				return exports.cropAreaOfInterestHorizontal(areaOfInterest, targetSize.width, targetSize.height, image.width, center);
			case modes.SAFE:
				return exports.cropHorizontalSafe(areaOfInterest, image, targetSize.width, targetSize.height, center);
			default:
				return exports.cropHorizontalCenter(image, center, targetSize.width, targetSize.height);
		}
	}
};

exports.cropHorizontalCenter = (imageData, center, width, height) => {
	const newWidth = (width / height) * imageData.height;
	let left = Math.max(Math.round(center.x - newWidth / 2), 0);
	const right = Math.min(left + newWidth, imageData.width);

	left = right - newWidth;

	const crop = {
		x: left,
		y: 0,
		width: right - left,
		height: imageData.height
	};

	return {
		crop,
		size: {width, height},
		method: 'cropHorizontalCenter'
	};
};

exports.cropVerticalCenter = (imageData, center, width, height) => {
	const newHeight = (height / width) * imageData.width;
	let top = Math.max(Math.round(center.y - newHeight / 2), 0);
	const heightExceed = (top + newHeight) - imageData.height;

	if (heightExceed > 0) {
		top -= heightExceed;
	}

	const crop = {
		x: 0,
		y: top,
		width: imageData.width,
		height: newHeight
	};

	return {
		crop,
		size: {width, height},
		method: 'cropVerticalCenter'
	};
};

exports.cropHorizontalSafe = (areaOfInterest, imageData, width, height, center) => {
	const crop = exports.cropHorizontalCenter(imageData, center, width, height).crop;

	const cuttable = exports.getCuttableArea(areaOfInterest, crop);
	const cuttableResized = util.scale(cuttable, width / imageData.width);

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
	const widthRatio = areaOfInterest.width / imageData.width;
	const scaleAfterCrop = appliedWidth / imageData.width;
	const maxHeight = imageData.height * scaleAfterCrop / widthRatio;

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

exports.cropVerticalSafe = (areaOfInterest, imageData, width, height, center) => {
	const crop = exports.cropVerticalCenter(imageData, center, width, height).crop;

	const cuttable = exports.getCuttableArea(areaOfInterest, crop);
	const cuttableResized = util.scale(cuttable, width / imageData.width);

	if (cuttable.bottom < 0) {
		crop.y = crop.y + cuttable.top;
		crop.height = crop.height + (Math.abs(cuttable.bottom) - cuttable.top);
		height = height + Math.abs(cuttableResized.bottom) - cuttableResized.top;
	}

	return {
		crop,
		size: util.round({width, height}),
		method: 'cropVerticalSafe'
	};
};

exports.cropAreaOfInterestHorizontal = (featureArea, width, height, rightEdge, center) => {
	if (!center) {
		center = getCenter(featureArea);
	}
	const newWidth = (width / height) * featureArea.height;
	const crop = {
		// Compress x to value that allows filling the desired width
		x: Math.min(center.x - (newWidth / 2), rightEdge - newWidth),
		y: featureArea.y,
		width: newWidth,
		height: featureArea.height
	};

	return {
		crop,
		size: {width, height},
		method: 'cropAreaOfInterestHorizontal'
	};
};

exports.cropAreaOfInterestVertical = (featureArea, width, height, center) => {
	if (!center) {
		center = getCenter(featureArea);
	}

	const newHeight = (height / width) * featureArea.width;

	const crop = {
		x: featureArea.x,
		// Prevent top from being outside of image frame
		y: Math.max(0, center.y - (newHeight / 2)),
		width: featureArea.width,
		height: newHeight
	};

	return {
		crop,
		size: {width, height},
		method: 'cropAreaOfInterestVertical'
	};
};

/**
 * Get data about how much more can be cut from each side while still including the entire area of interest
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
 * Get data about how much of the source image has been cut from each side.
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

