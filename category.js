const puppeteer = require("puppeteer");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");
const X2JS = require('x2js');
const fs = require('fs');
const vkbeautify = require('vkbeautify');
const { Builder, By, Key, until } = require("selenium-webdriver");
function convertJsonXML() {
  fs.readFile('data.json', (err, data) => {
    if (err) throw err;
    let listData = JSON.parse(data);
    var x2js = new X2JS();
    var document = x2js.js2xml({ root: { animals: listData } });
    var dep = vkbeautify.xml(document, 4);
    console.log(dep);
    // console.log(listData);
    fs.writeFileSync('tmp.xml', dep);
    return;
  });
}
(async () => {
  const baseURL = "https://rangerrick.org/category/animals/birds/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(baseURL, {
    waitUntil: 'networkidle2',
  });
  var results = [];
  var lastPageNumber = 22;
  for (let index = 0; index < lastPageNumber; index++) {
    await page.waitFor(1000);
    results = results.concat(await extractedEvaluateCall(page));
    if (index != lastPageNumber - 1) {
      await page.click('a.page-numbers')[0];
    }
  }
  await browser.close();
  return results;
})().then((value) => {
  for (let i = 0; i < value.length; i++) {
    value[i].id = i < 10 ? "A00" + i : "A0" + i
  }
  fs.writeFileSync('data.json', JSON.stringify({ animal: value }));
  convertJsonXML();
});;

async function extractedEvaluateCall(page) {
  return await page.evaluate(() => {
    const dataJSON = [];
    const listData = document.querySelectorAll(".mh-posts-list-item");
    for (let i = 0; i < listData.length; i++) {
      const item = {};
      item.name = document.querySelectorAll(".mh-posts-list-item  .entry-title > a")[i].title
      item.image = document.querySelectorAll(".mh-thumb-icon > img")[i].src
      item.description = i < 8 ? document.querySelectorAll(".mh-excerpt > p")[i].innerText : "abc";
      dataJSON.push(item);
    }
    return dataJSON;
  });
}
