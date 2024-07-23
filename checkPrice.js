import ScrapperService from './services/scrapper.js';
import TiendaNubeService from './services/tiendaNube.js';

(async () => {
  const scrapper = new ScrapperService();
  const tiendaNube = new TiendaNubeService();

  const products = await tiendaNube.getProducts();

  await scrapper.init();
  await scrapper.login();

  for (const product of products) {
    const sku = product.variants[0].sku;

    if (sku[0] === 'm') {
      console.log('\n');

      console.log(product.name.es);
      const url = await scrapper.search(sku.slice(1));

      if (!url) {
        await tiendaNube.outOfStock(product.id);
        console.log('Out of stock');
        continue;
      } else if (product.variants[0].stock === 0) {
        await tiendaNube.inStock(product.id);
        console.log(`Back in stock`);
      }
      const { cost } = await scrapper.scrape(url);

      const old_cost = product.variants[0].cost;
      const new_cost = cost.split(',').join('');
      if (old_cost !== new_cost) {
        await tiendaNube.updateVariant(
          { cost: new_cost },
          product.id,
          product.variants[0].id
        );
        console.log(`Updated cost: From ${old_cost} to ${new_cost}`);
      } else {
        console.log(`Equal costs: ${old_cost}`);
      }
    }
  }

  await scrapper.close();
})();
