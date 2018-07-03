'use strict';

const assert = require('chai').assert;
const {getResizedImageUrl} = require('./index');

describe('getResizedImageUrl', () => {
	describe('Engine', () => {
		it('should support using no engine', () => {
			const url = 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg';
			const targetSize = {
				width: 100,
				height: 100
			};
			const newUrl = getResizedImageUrl(url, targetSize, {}, 'secret');

			assert.deepEqual(newUrl, 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg?t%5Bresize%5D%5Bwidth%5D=100&t%5Bresize%5D%5Bheight%5D=100&t%5Bstrip%5D=true&accessToken=8d379e42d48a7215c0e17b2c0b28dec1cc563164d0b0f679ee7e19723e908128');
		});

		it('should support specifying engine', () => {
			const url = 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg';
			const targetSize = {
				width: 100,
				height: 100
			};
			const newUrl = getResizedImageUrl(url, targetSize, {}, 'secret', {engine: 'sharp'});

			assert.deepEqual(newUrl, 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg?engine=sharp&t%5Bresize%5D%5Bwidth%5D=100&t%5Bresize%5D%5Bheight%5D=100&t%5Bstrip%5D=true&accessToken=7a916cbd7a81ba2d26c5119e0051234a42af054c943a0611623a20caa8c63c26');
		});
	});
});
