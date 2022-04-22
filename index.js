const puppeteer = require("puppeteer");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");
const X2JS = require('x2js');
const fs = require('fs');
const vkbeautify = require('vkbeautify');
var xml = require('xml');
var path = require('path');
const { Builder, By, Key, until } = require("selenium-webdriver");
let express = require('express');
let app = express();
let port = process.env.PORT || 3000;

app.get('/', async (request, response) => {

  console.log(`URL: ${request.url}`);
  response.send('Hello, Server!');
});
app.get('/crawlData', async (request, response) => {
  await done()
  convertJsonXML();
  return response.send({ message: "crawl data success" })
});
app.get("/downloadFile", (request, response) => {
  var filePath = path.join(__dirname, 'tmp.xml');
  var fileStream = fs.createReadStream(filePath);
  fileStream.on('open', () => {
    response.attachment('tmp.xml');
    fileStream.pipe(response);
  });
})
app.listen(port);

console.log('RESTful API server started on: ' + port);
function convertJsonXML() {
  fs.readFile('data.json', (err, data) => {
    if (err) throw err;
    let listData = JSON.parse(data);
    var x2js = new X2JS();
    var document = x2js.js2xml({ root: listData });
    var dep = vkbeautify.xml(document, 4);
    console.log(dep);
    // console.log(listData);
    fs.writeFileSync('tmp.xml', dep);
  });
}
async function getAllCategory() {
  const baseURL = "https://rangerrick.org/animals/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(baseURL, {
    waitUntil: 'networkidle2',
  });
  var results = [];
  var lastPageNumber = 2;
  for (let index = 0; index < lastPageNumber; index++) {
    await page.waitFor(1000);
    results = results.concat(await extractedEvaluateCallCategory(page));
    if (index != lastPageNumber - 1) {
      await page.click('a.page-numbers')[0];
    }
  }
  await browser.close();
  return results;
}
async function getAllAnimal() {
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
}

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

async function extractedEvaluateCallCategory(page) {
  return await page.evaluate(() => {
    const dataJSON = [];
    const listData = document.querySelectorAll(".button > a");
    for (let i = 0; i < listData.length; i++) {
      const item = {};
      item.categoryName = document.querySelectorAll(".button > a")[i].innerHTML
      dataJSON.push(item);
    }
    return dataJSON;
  });
}
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
async function done() {
  const listCategory = await getAllCategory();
  for (let i = 0; i < listCategory.length; i++) {
    listCategory[i].id = i < 10 ? "T00" + i : "A0" + i
  }
  const listAnimal = await getAllAnimal();
  for (let i = 0; i < listAnimal.length; i++) {
    const idRamdom = randomIntFromInterval(0, listCategory.length - 1);
    console.log(idRamdom);
    console.log(listCategory[idRamdom].id);
    listAnimal[i].id = i < 10 ? "T00" + i : "A0" + i;
    listAnimal[i].idCategory = listCategory[idRamdom].id;
  }
  fs.writeFileSync('data.json', JSON.stringify({ animals: { animal: listAnimal }, categories: { category: listCategory } }));

  console.log("done");
}

// done();