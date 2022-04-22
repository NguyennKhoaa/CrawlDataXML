const puppeteer = require("puppeteer");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");
const { Builder, By, Key, until } = require("selenium-webdriver");
(async () => {
  const baseURL = "https://rangerrick.org/category/animals/birds/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(baseURL);
  const lastPage = await page.evaluate(() => {
    return document.querySelectorAll(".page-numbers")[3].innerHTML;
  });
  const dataJSON = [];
  for (let i = 0; i < +lastPage; i++) {
    const item = {};
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(baseURL + i);
    await page.evaluate(() => {
      return document.querySelectorAll(".page-numbers")[3].innerHTML;
    });
  }
  await browser.close();
})();
