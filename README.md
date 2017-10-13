Area of Interest Smart Cropper
==============================

Create smart crops from area of interest data.

This lib is designed be used for images served by Aptoma's Smooth Storage service, but the crop calculations should be
applicable in other contexts.

By provding image data with area of interest and an optional focus point, you can generate data for different crops that
you can use to resize images.

The lib also provides a few helper functions to see how the crop relates to the original image, to allow further modifying
the crop.

Usage:
------

```js
'use strict';

const smartCrop = require('@aptoma/aoi-smart-crop');

// Smooth Storage transform token, for signing image requests
const transformToken = '...';

// The raw data of the image
const imageData = {
	url: 'https://...',
	width: 1200,
	height: 800,
	aoi: {
		x: 200,
		y: 100,
		width: 500,
		height: 300
	},
	// Focus point can be omitted, in which case the center of the area of interest will be used instead
	focusPoint: {
		x: 400,
		y: 200
	}
};

const size = {
	width: 300,
	height: 300
};

const mode = smartCrop.modes.FOCUS_POINT;
// const mode = smartCrop.modes.TIGHT_AREA_OF_INTEREST;
// const mode = smartCrop.modes.TIGHT_AREA_OF_INTEREST_FOCUS_POINT;
// const mode = smartCrop.modes.SAFE;

// Get the crop coordinates matching your desired crop format and area of interesst
const cropData = smartCrop.getCrop(size, imageData, mode);

// Get the url of the resized smart cropped image
// NOTE: When using mode SAFE, the target size might be modified to include the entire area of interest
const imageUrl = smartCrop.getResizedImageUrl(imageData.url, cropData.size, {crop: cropData.crop}, transformToken);

```

Modes
-----

The smart cropper support different modes:

### FOCUS_POINT

FOUCS_POINT will create a large crop centered around either the provided focusPoint or the center of the area of interest.

Depending on whether your requested format is wider or narrower than the area of interest, this will include either the
full width or height of the original image.

This mode will produce the most universally usable crop, as long as the original composition of the image is sensible.

### TIGHT_AREA_OF_INTEREST

TIGHT_AREA_OF_INTEREST will create a crop where the outer edges are confined by the area of interest. Again, whether width
or height is prioritized depends on the requested format vs the area of interest format.

After cutting around the edges, the crop will center around the middle of the area of interest. This mode might end up
cutting out parts of the area of interest, if the area of intereset has a significantly different shape.

This mode can be used when you need to zoom in on the essential parts of the image, eg. when used for thumbnails or
otherwise space constrained areas. If you have a focus point for your image, TIGHT_AREA_OF_INTEREST_FOCUS_POINT can be a
safer choice when the format is tight as well.

### TIGHT_AREA_OF_INTEREST_FOCUS_POINT

TIGHT_AREA_OF_INTEREST_FOCUS_POINT is similar to TIGHT_AREA_OF_INTEREST, but centering after edge cutting will be on the
specified focus point. This risks leaving out large parts of the area of interest in place of content outside of the area
of interest, but the benefit is that the focus point will always be included. This can prevent faces from being cut, when
faces are located near an edge, and the requested format is too different from the area of interest.

### SAFE

SAFE behaves similar to FOCUS_POINT, but after making the initial crop around the focus point, the crop will be moved
to also include the entire area of interest. If necessary for preserving the entire area of interest, the final height
may be adjusted to longer conform to ther requested format.

This mode should be used when it's more important that the entire area of interest is included, than getting the exact
crop format.

Utility functions
-----------------

Smart Crop also provides utility functions to get some data about the crop.

`smartCrop.getCuttableArea(areaOfInterest, crop)` will return an object containing how much more can be cut from each side
without removeing any of the area of interest. The values can be negative, which indicates that the some parts have been cut.

`smartCrop.getCutArea({width: originalWidth, height: originalHeight}, crop)` will return how much has been cut from each edge of the original image.

This data can be used to adjust the crop depending on the context, like making one of two images a bit taller to line up
properly.
