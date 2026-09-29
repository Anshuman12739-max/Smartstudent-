const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost:5174/');
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
    console.log('Page loaded.');
  } catch (err) {
    console.error('Error loading page:', err);
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
