export default defineContentScript({
  // // Set manifest options
  matches: ["*://*/*"],
  // excludeMatches: undefined | [],
  // includeGlobs: undefined | [],
  // excludeGlobs: undefined | [],
  // allFrames: undefined | true | false,
  // runAt: undefined | 'document_start' | 'document_end' | 'document_idle',
  // matchAboutBlank: undefined | true | false,
  // matchOriginAsFallback: undefined | true | false,
  // world: undefined | 'ISOLATED' | 'MAIN',

  // // Set include/exclude if the background should be removed from some builds
  // include: undefined | string[],
  // exclude: undefined | string[],

  // // Configure how CSS is injected onto the page
  // cssInjectionMode: undefined | "manifest" | "manual" | "ui",

  // // Configure how/when content script will be registered
  // registration: undefined | "manifest" | "runtime",

  main(ctx: ContentScriptContext) {
    // Executed when content script is loaded, can be async

    const content = document.body.innerHTML;
    const rawArticle = document.body.querySelector("article");
    console.log("Article html", document.body.querySelector("article"));
    const article = parseHtml(rawArticle!);
    // const article = document.body.querySelector("article")?.innerText

    browser.runtime.sendMessage(article);
  },
});

const parseHtml = (html: HTMLElement) => {
  const h1 = html.querySelector("h1");

  console.log("h1", h1);
  const paragraphs = p(html);
  console.log("paragraphs", paragraphs);

  const body = [h1?.innerText, ...paragraphs];

  return body;
};

const p = (html: HTMLElement) => {
  const paragraphs: string[] = [];

  const ps = html.querySelectorAll("p");

  console.log("pargraphs", ps);

  ps.forEach((p) => {
    paragraphs.push(p.innerText);
  });

  return paragraphs;
};
