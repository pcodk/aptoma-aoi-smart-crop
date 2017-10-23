'use strict';

const assert = require('chai').assert;
const crop = require('./crop');

describe('crop', () => {
	describe('cropHorizontalCenter', () => {
		it('should create a tall crop around provided center', () => {
			const imageData = {
				width: 600,
				height: 400
			};
			const center = {x: 400, y: 200};
			const width = 150;
			const height = 300;
			const actual = crop.cropHorizontalCenter(imageData, center, {width, height});
			const expected = {
				crop: {
					x: 300,
					y: 0,
					width: 200,
					height: 400
				},
				size: {width, height},
				method: 'cropHorizontalCenter'
			};

			assert.deepEqual(actual, expected);
		});
	});

	describe('cropHorizontalSafe', () => {
		describe('when areaOfInterest is wider than desired crop', () => {
			it('it should include entire area of interest and reduce height to fit source image', () => {
				const imageData = {
					width: 2000,
					height: 1333
				};
				const center = {x: 833, y: 435};
				const width = 200;
				const height = 300;
				const areaOfInterest = {x: 134, y: 278, width: 1582, height: 940};
				const actual = crop.cropHorizontalSafe(areaOfInterest, imageData, {width, height}, center);
				const expected = {
					crop: {
						x: 134,
						y: 0,
						width: 1582,
						height: 1333
					},
					size: {width: 200, height: 169}
				};

				assert.deepEqual(actual.crop, expected.crop);
				assert.deepEqual(actual.size, expected.size);
			});
		});
	});

	describe('cropAreaOfInterestHorizontal', () => {
		it('it should reduce height to match area of interest and center horizontally in middle of area of interest', () => {
			const imageData = {
				width: 2000,
				height: 1333
			};
			const width = 200;
			const height = 300;
			const areaOfInterest = {x: 50, y: 100, width: 1800, height: 1002};
			const actual = crop.cropAreaOfInterestHorizontal(areaOfInterest, {width, height}, imageData.width);
			const expected = {
				crop: {
					x: 616,
					y: 100,
					width: 668,
					height: 1002
				},
				size: {width: 200, height: 300}
			};

			assert.deepEqual(actual.crop, expected.crop);
			assert.deepEqual(actual.size, expected.size);
		});
	});

	describe('cropVerticalCenter', () => {
		it('should create a wide crop around provided center', () => {
			const imageData = {
				width: 600,
				height: 400
			};
			const center = {x: 400, y: 200};
			const width = 300;
			const height = 150;
			const actual = crop.cropVerticalCenter(imageData, center, {width, height});
			const expected = {
				crop: {
					x: 0,
					y: 50,
					width: 600,
					height: 300
				},
				size: {width, height},
				method: 'cropVerticalCenter'
			};

			assert.deepEqual(actual, expected);
		});
	});

	describe('cropVerticalSafe', () => {
		describe('when areaOfInterest is taller than desired crop', () => {
			it('it should include entire area of interest and increase height to fit source image', () => {
				const imageData = {
					width: 768,
					height: 1024
				};
				const center = {x: 500, y: 200};
				const width = 300;
				const height = 100;
				const areaOfInterest = {x: 81, y: 47, width: 600, height: 910};
				const actual = crop.cropVerticalSafe(areaOfInterest, imageData, {width, height}, center);
				const expected = {
					crop: {
						x: 0,
						y: 47,
						width: 768,
						height: 910
					},
					size: {width: 300, height: 355}
				};

				assert.deepEqual(actual.crop, expected.crop);
				assert.deepEqual(actual.size, expected.size);
			});
		});
	});

	describe('cropAreaOfInterestVertical', () => {
		it('it should reduce width to match area of interest and center vertically in middle of area of interest', () => {
			const width = 300;
			const height = 100;
			const areaOfInterest = {x: 50, y: 100, width: 1800, height: 1002};
			const actual = crop.cropAreaOfInterestVertical(areaOfInterest, {width, height});
			const expected = {
				crop: {
					x: 50,
					y: 301,
					width: 1800,
					height: 600
				},
				size: {width: 300, height: 100}
			};

			assert.deepEqual(actual.crop, expected.crop);
			assert.deepEqual(actual.size, expected.size);
		});
	});
});
