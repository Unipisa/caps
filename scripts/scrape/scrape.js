/**
SETUP:
npm install

RUN:
node scrape.js 
**/

const puppeteer = require('puppeteer');
const URL = 'http://caps.dm.unipi.it/develop';
async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
		await page.type('#username', 'xleonardo');
		await page.type('#password', 'xleonardo');
		await page.click('[value="Login"]');
		// await page.waitForNavigation();
		await page.goto(URL + '/proposals/view/956');
    await page.pdf({path: 'out.pdf'});
    browser.close();
}
run();
