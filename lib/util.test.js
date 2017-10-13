'use strict';

const assert = require('chai').assert;
const util = require('./util');

describe('rectangle', () => {
	describe('outerEdges', () => {
		it('should find outer edges of a set of rectangles', () => {
			const rect1 = {
				x: 5,
				y: 10,
				height: 50,
				width: 60
			};
			const rect2 = {
				x: 10,
				y: 0,
				height: 30,
				width: 20
			};

			const actual = util.outerEdges(rect1, rect2);
			const expected = {
				x: 5,
				y: 0,
				height: 60,
				width: 60
			};

			assert.deepEqual(actual, expected);
		});
	});
});
