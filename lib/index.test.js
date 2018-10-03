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

			assert.deepEqual(newUrl, 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg?t%5Bstrip%5D=true&t%5Bresize%5D%5Bwidth%5D=100&t%5Bresize%5D%5Bheight%5D=100&accessToken=8c1bea837a4a3eda71213a8f90877770620bb5c8917abf61caa8b8a04bdee760');
		});

		it('should support specifying engine', () => {
			const url = 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg';
			const targetSize = {
				width: 100,
				height: 100
			};
			const newUrl = getResizedImageUrl(url, targetSize, {}, 'secret', {engine: 'sharp'});

			assert.deepEqual(newUrl, 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg?engine=sharp&t%5Bstrip%5D=true&t%5Bresize%5D%5Bwidth%5D=100&t%5Bresize%5D%5Bheight%5D=100&accessToken=42e9de4d7340ad910bbae73357300deb6e8d47069f574738389eb5992c9f8274');
		});

		it('should support not using strip', () => {
			const url = 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg';
			const targetSize = {
				width: 100,
				height: 100
			};
			const newUrl = getResizedImageUrl(url, targetSize, {strip: false}, 'secret');

			assert.deepEqual(newUrl, 'https://smooth-storage-dev.aptoma.no/users/dn/images/986914.jpg?t%5Bresize%5D%5Bwidth%5D=100&t%5Bresize%5D%5Bheight%5D=100&accessToken=b15bd5e493437291e1f3d013e63ca47914a3b519824394befd2da010d4e3b08e');
		});
	});
});
