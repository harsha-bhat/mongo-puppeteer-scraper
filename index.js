const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Input = require('./input-model');
const Output = require('./output-model');

mongoose.connect('mongodb://localhost/screens')

const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 675;
const NUM_IMAGES_PER_PAGE = 4;
const IMAGE_QUALITY = 80;
const PAGE_COUNT = 10;

(async () => {
    // Launch puppeteer in headless mode
    const browser = await puppeteer.launch();
    
    let count = 0;
    while (true) {

        // Get input data from DB
        let inputs = await Input.find({}).skip(count).limit(PAGE_COUNT);
        if (inputs.length == 0) {
            break;
        }
        count = count + inputs.length;

        let promises = [];
        for (let input of inputs) {
            console.log(input.href);

            // Open a new browser page for every input
            promises.push(browser.newPage().then(async page => {
                let output = new Output({
                    _id: input._id,
                    href: input.href
                });
                try {
                    await page.goto(input.href);
                    await page.setViewport({
                        'height': VIEWPORT_HEIGHT,
                        'width': VIEWPORT_WIDTH
                    });

                    // Take screenshots
                    for (let i = 1; i <= NUM_IMAGES_PER_PAGE; i++) {
                        await page.screenshot({
                            path: "./output/" + input._id + "_" + i + ".jpg",
                            quality: IMAGE_QUALITY,
                            type: 'jpeg'
                        });
                        await page.evaluate(_ => {
                            window.scrollBy(0, window.innerHeight);
                        });
                        output.images.push("./output/" + input._id + "_" + i + ".jpg");
                    }
                } catch (err) {
                    output.error = err.toString();
                }

                // Close page to free memory and save results to DB
                await page.goto('about:blank');
                await page.close();
                await output.save();
            }));
        }
        await Promise.all(promises);
    }
    await browser.close();
    console.log("Done!");
    process.exit(0);
})();