/**
SETUP:
npm install

RUN:
node scrape.js
**/

const puppeteer = require('puppeteer');
const readline = require('readline');

function prompt(rl, question) {
  return new Promise(function(resolve, reject) {
    var ask = function() {
      rl.question(question, function(answer) {
          resolve(answer, reject);
      });
    };
		ask();
  });
};

const URL = 'https://www.dm.unipi.it/caps';
async function run () {
		const rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
		var username = await prompt(rl, 'Username [' + URL + ']: ');
		var password = await prompt(rl, 'Password: ');
		await page.type('#UserUsername', username);
		await page.type('#UserPassword', password);
		await page.click('[value="Login"]');
		const element = await page.$("#flashMessage");
		if (element) {
			const text = await page.evaluate(element => element.textContent, element);
			console.log("error: " + text);
			browser.close();
			return
		}
		await page.screenshot({path: 'screenshot.png'});
		console.log("writing screenshot");
		// await page.waitForNavigation();
		var id = await prompt(rl, 'Proposal id (try 723): ');
		rl.close();
		await page.goto(URL + '/proposals/view/' + id);
		console.log("writing pdf");
    await page.pdf({path: 'proposal_' + id + '.pdf'});
		browser.close();
}
run();
