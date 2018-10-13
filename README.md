# mongo-puppeteer
Scrape websites using puppeteer and save the results into MongoDB.

Requires MongoDB 3.6+ and Node.js 8.0+

<b>Setup Instructions: </b>
1. Install dependencies

`npm install`


2. Import sample data

`mongoimport --db screens --collection inputs sample.json`


3. Run the code

`npm start`


4. Screenshots will be placed into output directory and the mongo collection `outputs` will have the image paths.


<b>Settings: </b>

There are some settings available in `index.js`:

`VIEWPORT_WIDTH` - Width of the browser viewport

`VIEWPORT_HEIGHT` - Height of the browser viewport

`NUM_IMAGES_PER_PAGE` - The number of screenshots to take, per webpage

`IMAGE_QUALITY`- Quality of the JPEG image

`PAGE_COUNT` - Number of pages to open in parallel
