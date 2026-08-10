import { Element } from "@/lib/types";

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
    //
    //

    console.log("Hello 👋")

    // browser.tabs.onUpdated.addListener(() => {
    //   alert("Highlighted")
    // })
    //
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === "TAB_CHANGED" || message.type === "TAB_UPDATED") {
        const content = document.body.querySelector("article");

        if (content == null) {
          browser.runtime.sendMessage(content);
          return;
        }

        const rawArticle = findArticle(content);
        const article = parseHtml(content, rawArticle);

        if (article.length > 1) {
          browser.runtime.sendMessage(article);
        }
      }
    });

    // console.log("highlighted", browser.tabs.getSelected())
    // console.log("bye 👋")

    // const content = document.body.querySelector("article");

    // if (content == null) {
    //   browser.runtime.sendMessage(content);
    //   return;
    // }

    // const rawArticle = findArticle(content);
    // const article = parseHtml(content, rawArticle);

    // browser.runtime.sendMessage(article);
  },
});

const findArticle = (html: HTMLElement) => {
  // Best effort for finding the main article
  // Assumes that the div with the most text (<p>) is the article
  // Return the document if this fails

  const simpleArticle = html
    .querySelectorAll("div")
    .values()
    .filter(
      (d) =>
        d.childElementCount > 1 &&
        d.childNodes
          .values()
          .filter((child: ChildNode) => child.nodeName == "p"),
    )
    .toArray()
    .sort((a, b) => b.childElementCount - a.childElementCount)
    .at(0);

  if (simpleArticle === undefined) return html;
  return simpleArticle;
};

const parseHtml = (html: HTMLElement, content: HTMLElement) => {
  const h1 = html.querySelector("h1");


  const header: Element = {
    type: "heading",
    level: 1,
    nodeName: h1?.nodeName,
    text: h1?.innerText,
  };

  console.log("h1", h1);
  const cleanedContent = clean(content);

  const body: Element[] = [header];

  // console.log("Simple Article, ", simpleArticle);
  cleanedContent.childNodes.forEach((node: ChildNode) => {
    switch (node.nodeName) {
      case "P":
        body.push({
          type: "paragraph",
          level: 0,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H1":
        body.push({
          type: "heading",
          level: 1,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H2":
        body.push({
          type: "heading",
          level: 2,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H3":
        body.push({
          type: "heading",
          level: 3,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H4":
        body.push({
          type: "heading",
          level: 4,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H5":
        body.push({
          type: "heading",
          level: 5,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
      case "H6":
        body.push({
          type: "heading",
          level: 6,
          nodeName: node.nodeName,
          text: node.textContent,
        });
        break;
    }
  });

  return body;
};

const clean = (html: HTMLElement) => {
  const footerRemoved = html.querySelector("footer")?.remove();

  return html;
  return footerRemoved as unknown as HTMLElement;
};

const p = (html: HTMLElement) => {
  const paragraphs: string[] = [];

  const simpleArticle = html
    .querySelectorAll("div")
    .values()
    .filter(
      (d) =>
        d.childElementCount > 1 &&
        d.childNodes
          .values()
          .filter((child: ChildNode) => child.nodeName == "p"),
    )
    .toArray()
    .sort((a, b) => b.childElementCount - a.childElementCount)
    .at(0);

  // console.log("Simple Article, ", simpleArticle);
  const simpleArticleArray = simpleArticle;
  console.log("Trimmed Article,", simpleArticleArray);
  const ps = simpleArticleArray?.querySelectorAll("p");

  console.log("pargraphs", ps);

  ps.forEach((p) => {
    paragraphs.push(p.innerText);
  });

  return paragraphs;
};
