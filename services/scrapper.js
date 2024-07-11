import puppeteer from 'puppeteer';
import getContent from '../utils/getContent.js';
import titleCase from '../utils/titleCase.js';
import slugify from '../utils/slugify.js';

class ScrapperService {
  credentials = {
    url: process.env.SCRAPPER_URL_LOGIN,
    username: process.env.SCRAPPER_USERNAME,
    password: process.env.SCRAPPER_PASSWORD,
  };
  browser;
  page;

  init = async () => {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();
  };

  close = async () => {
    await this.browser.close();
  };

  login = async (page) => {
    console.log('Login');
    await this.page.goto(this.credentials.url);

    await this.page.type('.login-form .input.username', this.credentials.username);
    await this.page.type('.login-form .input.password', this.credentials.password);

    await Promise.all([
      this.page.click('.login-form .enviar-login'),
      this.page.waitForNavigation(),
    ]);
  };

  scrape = async (url) => {
    console.log('Scrapping');
    await this.page.goto(url);

    const title = await getContent(this.page, 'h1');
    const name = titleCase(title);
    const handle = slugify(title);
    const description = await getContent(this.page, '.info');
    const categoryName = titleCase(await getContent(this.page, '.arbol a'));
    const cost = (await getContent(this.page, '.box-precio .actual'))?.slice(1);
    const cod = (await getContent(this.page, '.cod')).split('\n');
    const sku = 'm' + cod[1].split('Cod: ').join('');
    const barcode = cod[2].split('C. Barras:').join('');

    const descriptionHtml = this.descriptionToHtml(description);

    const imageUrls = await this.page.evaluate(() => {
      const images = Array.from(
        document.querySelectorAll('#slider-flex .slide img')
      );
      return images.map((img) => img.src);
    });

    const base64Images = [];
    for (let imageUrl of imageUrls) {
      const viewSource = await this.page.goto(imageUrl);
      const buffer = await viewSource.buffer();
      const base64Image = buffer.toString('base64');
      base64Images.push(base64Image);
    }

    return {
      name,
      handle,
      description: descriptionHtml,
      categoryName,
      cost,
      sku,
      barcode,
      base64Images,
    };
  };

  descriptionToHtml = (description) => {
    const lines = description.replace(/\n+/g, '\n').split('\n');
    const html = lines.reduce((acc, value, i) => {
      const nextLine = lines[i + 1];
      const currentIsListItem = this.isListItem(value);
      const nextIsListItem = nextLine ? this.isListItem(nextLine) : false;

      let html = acc;

      if (currentIsListItem) {
        html += `<li>${value.slice(2).trim()}</li>`;
        if (!nextIsListItem) html += '</ul>';
      } else {
        html += `<p>${value.trim()}</p>`;
        if (nextIsListItem) html += '<ul>';
      }

      return html;
    }, '');

    return html;
  };

  isListItem = (line) => line.startsWith('. ');
}

export default ScrapperService;
