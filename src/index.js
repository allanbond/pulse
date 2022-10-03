const puppeteer = require('puppeteer');
const { DateTime, Duration } = require('luxon');

const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

async function loadSite (site) {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(site, {timeout: 60000});

  // evaluate will run the function in the page context
  const perf = await page.evaluate(_ => {
    const perfEntries = performance.getEntriesByType('navigation');
    const [p] = perfEntries;
    const pageLoadTime = p.loadEventEnd - p.loadEventStart;
    const domLoadTime = p.domContentLoadedEventEnd - p.domContentLoadedEventStart;
    const domComplete = p.domComplete;
    const interactive = p.domInteractive;
    // const { loadEventEnd, navigationStart } = performance.timing;
    return {pageLoadTime, domLoadTime, domComplete, interactive };

    // let's get the latency-related performance information
    // calculate the load time in milliseconds
    // return { startTime: navigationStart, loadTime: loadEventEnd - navigationStart };
  });

  // we're done; close the browser
  await browser.close();

  return perf;
};

async function go(site) {
  let perf;
  try {
    perf = await loadSite(site);

    // convert to seconds and round to 2 decimals
    const roundedDomComplete = Number.parseFloat((Math.round((perf.domComplete/1000) * 100) / 100));
    const roundedInteractive = Number.parseFloat((Math.round((perf.interactive/1000) * 100) / 100));
    const total = roundedDomComplete + roundedInteractive;
    console.log(`${DateTime.now().toFormat(DATE_FORMAT)} ${roundedDomComplete.toFixed(2)} ${roundedInteractive.toFixed(2)} ${total.toFixed(2)}`);
    
    // performance.getEntriesByName('loadDuration').forEach(entry => {
    // const start = DateTime.fromMillis(perf.startTime).toFormat('yyyy-MM-dd HH:mm:ss');
    // const duration = Math.round(Duration.fromMillis(perf.loadTime).as('seconds') * 100) / 100;

    // console.log(`${start} - ${duration}`)
  } catch(err) {
    console.log(`${DateTime.now().toFormat(DATE_FORMAT)}|${err?.message}`);
  }

  // performance.getEntries(entry => console.log(entry.duration));

  // });
  
  const min = 30000;
  const max = 90000;
  
  const waitMillis = Math.floor(Math.random() * (max - min + 1) + min);
  setTimeout(() => go(site), waitMillis);
}


const site = 'https://www.finra.org';
go(site);