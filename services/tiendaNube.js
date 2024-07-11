import { get, post } from '../utils/api.js';
import slugify from '../utils/slugify.js';

class TiendaNubeService {
  baseUrl = process.env.TIENDANUBE_API;
  headers = {
    Authentication: `bearer ${process.env.TIENDANUBE_TOKEN}`,
  };

  getCategory = async (categoryName) => {
    console.log('Getting categories');
    const categories = await get(`${this.baseUrl}/categories`, this.headers);
    let category = categories.find(
      (cat) => cat.handle.es === slugify(categoryName)
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
    const costNumbered = Number(cost.split(',').join(''));
    const price = costNumbered * Number(process.env.COST_PRICE_INDEX);
    const priceRounded = Math.round(price / 100) * 100;

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
}

export default TiendaNubeService;
