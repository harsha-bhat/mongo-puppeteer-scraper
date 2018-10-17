const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Input = require('./input-model');
const Output = require('./output-model');

// process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 1000;

mongoose.connect('mongodb://localhost/screens')

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 450;
const NUM_IMAGES_PER_PAGE = 1;
const IMAGE_QUALITY = 50;
const PAGE_COUNT = 200;
const MAX_WAIT = 2000;

(async () => {
    // Launch puppeteer in headless mode
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT
        },
        args: [
            '--headless',
            '--hide-scrollbars',
            '--mute-audio'
        ]
    });
    
    let count = 0;
    while (true) {
        
        // Get input data from DB
        let inputs = await Input.find({}).skip(count).limit(PAGE_COUNT);
        if (inputs.length == 0) {
            break;
        }
        count = count + inputs.length;
        console.time('batch');
        let promises = [];
        for (let input of inputs) {

            // Open a new browser page for every input
            promises.push(browser.newPage().then(async page => {
                let output = new Output({
                    _id: input._id,
                    href: input.href
                });
                try {
                    await Promise.race([
                        page.goto(input.href),
                        new Promise(resolve => setTimeout(resolve, MAX_WAIT))
                    ]);
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
                await page.close();
                await output.save();
            }));
        }
        await Promise.all(promises);
        console.timeEnd('batch');
    }
    await browser.close();
    console.log("Done!");
    process.exit(0);
})();