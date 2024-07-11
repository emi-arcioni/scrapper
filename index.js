import ScrapperService from './services/scrapper.js';
import TiendaNubeService from './services/tiendaNube.js';

(async () => {
  const tiendaNube = new TiendaNubeService();
  const scrapper = new ScrapperService();
  await scrapper.init();

  await scrapper.login();

  const urls = [];

  try {
    for (let url of urls) {
      const {
        name,
        handle,
        description,
        categoryName,
        cost,
        sku,
        barcode,
        base64Images,
      } = await scrapper.scrape(url);

      const category = await tiendaNube.getCategory(categoryName);

      await tiendaNube.addProduct({
        handle,
        name,
        description,
        categoryId: category.id,
        cost,
        sku,
        barcode,
        base64Images,
      });
    }
  } catch (err) {
    console.log(err);
  }

  await scrapper.close();
})();
