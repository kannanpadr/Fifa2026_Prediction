const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url()));

  await page.goto('http://localhost:8080/winner.html', {waitUntil: 'networkidle0'});
  
  try {
    const html = await page.$eval('#championsBody', el => el.innerHTML);
    console.log('championsBody HTML Length:', html.length);
  } catch (e) {
    console.log('Error getting championsBody:', e.message);
  }
  
  await browser.close();
})();
