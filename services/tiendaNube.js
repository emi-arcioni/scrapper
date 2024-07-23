import { get, post, put } from '../utils/api.js';
import slugify from '../utils/slugify.js';

class TiendaNubeService {
  baseUrl = process.env.TIENDANUBE_API;
  headers = {
    Authentication: `bearer ${process.env.TIENDANUBE_TOKEN}`,
  };

  getCostAndPrice = (cost) => {
    const costNumbered = Number(cost.split(',').join(''));
    const price = costNumbered * Number(process.env.COST_PRICE_INDEX);
    const priceRounded = Math.round(price / 100) * 100;

    return { costNumbered, priceRounded };
  };

  getProducts = async () => {
    const products = await get(`${this.baseUrl}/products`, this.headers);
    return products;
  };

  getCategory = async (categoryName) => {
    console.log('Getting categories');
    const categories = await get(`${this.baseUrl}/categories`, this.headers);
    let category = categories.find(
      (cat) =>
        cat.handle.es.toLowerCase() === slugify(categoryName).toLowerCase()
    );
    if (!category) {
      console.log('Adding new category');
      category = await post(
        `${this.baseUrl}/categories`,
        {
          name: {
            es: categoryName,
          },
        },
        this.headers
      );
    }

    return category;
  };

  addProduct = async ({
    handle,
    name,
    description,
    categoryId,
    cost,
    sku,
    barcode,
    base64Images,
  }) => {
    console.log(`Adding product ${handle}`);
    const { costNumbered, priceRounded } = this.getCostAndPrice(cost);

    const images = base64Images.map((base64Image, index) => ({
      filename: `${index + 1}.jpg`,
      position: index + 1,
      attachment: base64Image,
    }));

    const product = await post(
      `${this.baseUrl}/products`,
      {
        handle,
        name,
        description,
        categories: [categoryId],
        variants: [
          {
            cost: costNumbered,
            price: priceRounded,
            sku,
            barcode,
          },
        ],
        images,
      },
      this.headers
    );

    return product;
  };

  updateVariant = async ({ cost }, product_id, variant_id) => {
    let update = {};
    if (cost) {
      const { costNumbered, priceRounded } = this.getCostAndPrice(cost);
      update = {
        cost: costNumbered,
        price: priceRounded,
      };
    }

    const variant = await put(
      `${this.baseUrl}/products/${product_id}/variants/${variant_id}`,
      update,
      this.headers
    );

    return variant;
  };

  inStock = async (product_id) => {
    await post(
      `${this.baseUrl}/products/${product_id}/variants/stock`,
      {
        action: 'replace',
        value: null,
      },
      this.headers
    );
  };

  outOfStock = async (product_id) => {
    await post(
      `${this.baseUrl}/products/${product_id}/variants/stock`,
      {
        action: 'replace',
        value: 0,
      },
      this.headers
    );
  };
}

export default TiendaNubeService;
