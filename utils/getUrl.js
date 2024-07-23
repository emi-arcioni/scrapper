const getUrl = async (page, selector) =>
  await page.evaluate(
    (selector) => document.querySelector(selector)?.getAttribute('href'),
    selector
  );

export default getUrl;
