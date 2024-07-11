const getContent = async (page, selector) =>
  await page.evaluate(
    (selector) => document.querySelector(selector)?.innerText,
    selector
  );

export default getContent;
