const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const site = 'https://www.finra.org';

  // let's navigate to the dev.to homepage
  console.log(site);
  await page.goto(site);

  // evaluate will run the function in the page context
  const perf = await page.evaluate(_ => {
    // let's get the latency-related performance information
    const { loadEventEnd, navigationStart } = performance.timing;

    // calculate the load time in milliseconds
    return { loadTime: loadEventEnd - navigationStart };
  });

  // and log the load time of the webpage
  console.log(perf.loadTime);

  // we're done; close the browser
  await browser.close();
})();
