import { Element } from "@/lib/types";
import DOMPurify from "dompurify";

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
        } else {
          browser.runtime.sendMessage([])
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
  for (let i = 0; i < cleanedContent.children.length; i++) {
    const node = cleanedContent.children.item(i);

    if (node === null) return;

    const element = {
      type: "paragraph",
      level: 0,
      nodeName: node.nodeName,
      text: node.textContent,
    };

    switch (node.nodeName) {
      case "P":
        body.push(element);
        break;
      case "H1":
        element.type = "heading";
        element.level = 1;
        body.push(element);
        break;
      case "H2":
        element.type = "heading";
        element.level = 2;
        body.push(element);
        break;
      case "H3":
        element.type = "heading";
        element.level = 3;
        body.push(element);
        break;
      case "H4":
        element.type = "heading";
        element.level = 4;
        body.push(element);
        break;
      case "H5":
        element.type = "heading";
        element.level = 5;
        body.push(element);
        break;
      case "H6":
        element.type = "heading";
        element.level = 6;
        body.push(element);
        break;
      case "UL":
        element.type = "list";
        element.level = 0;
        element.text = DOMPurify.sanitize(node.innerHTML);
        body.push(element);
        break;
      case "OL":
        element.type = "list";
        element.level = 1;
        element.text = DOMPurify.sanitize(node.innerHTML);
        body.push(element);
        break;
      case "TABLE":
        element.type = "table";
        element.level = 0;
        element.text = DOMPurify.sanitize(node.innerHTML);
        body.push(element);
        break;
    }
  }

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
