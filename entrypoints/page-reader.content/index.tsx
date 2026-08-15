import type {
  ArticleDocument,
  Element as ArticleElement,
} from "@/shared/types";
import DOMPurify from "dompurify";
import { isProbablyReaderable, Readability } from "@mozilla/readability";
import App from "./app";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";
import "@/shared/index.css";

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
  cssInjectionMode: "ui",

  // // Configure how/when content script will be registered
  // registration: undefined | "manifest" | "runtime",

  async main(ctx) {
    // Executed when content script is loaded, can be async

    if (
      !isProbablyReaderable(document) ||
      document.body.querySelector("article") === null
    ) {
      console.log("Not a readerable page");
      return;
    }

    const ui = await createShadowRootUi(ctx, {
      name: "floating-player-bar",
      position: "overlay",
      // Keep the host outside app-managed body children so SPA hydration
      // cannot remove the player after it mounts.
      anchor: "html",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = "floating-player-bar-root";
        container.appendChild(app);

        const root = ReactDOM.createRoot(app);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();

    // browser.tabs.onUpdated.addListener(() => {
    //   alert("Highlighted")
    // })
    //
    let videoObserver: MutationObserver | undefined;

    // Readability.parse() rewrites the document it receives. Keep that work
    // off the live page so a site's styles and application DOM stay intact.
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (article === null) {
      console.log("No article found on page.");
      return;
    }

    const articleDocument = toArticleDocument(article);
    console.log("article", articleDocument);

    // browser.runtime.onMessage.addListener((message) => {
    //   if (message.type === "TAB_CHANGED" || message.type === "TAB_UPDATED") {
    //     const content = document.body.querySelector("article");

    //     if (content == null) {
    //       browser.runtime.sendMessage(content);
    //       return;
    //     }

    //     const rawArticle = findArticle(content);
    //     const article = parseHtml(content, rawArticle);
    //     console.log("h1", article);

    //     if (article && article.length > 1) {
    //       browser.runtime.sendMessage(article);

    //       if (
    //         content.querySelector('[data-component-name="VideoEmbedPlayer"]') &&
    //         !content.querySelector("video")
    //       ) {
    //         videoObserver?.disconnect();
    //         videoObserver = new MutationObserver(() => {
    //           if (!content.querySelector("video")) return;

    //           videoObserver?.disconnect();
    //           const hydratedArticle = parseHtml(content, findArticle(content));
    //           if (hydratedArticle.length > 1) {
    //             browser.runtime.sendMessage(hydratedArticle);
    //           }
    //         });
    //         videoObserver.observe(content, { childList: true, subtree: true });
    //       }
    //     } else {
    //       browser.runtime.sendMessage([]);
    //     }
    //   }
    // });

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

const toArticleDocument = (article: {
  title?: string | null;
  content?: string | null;
  textContent?: string | null;
  length?: number | null;
  excerpt?: string | null;
  byline?: string | null;
  siteName?: string | null;
  lang?: string | null;
  dir?: string | null;
  publishedTime?: string | null;
}): ArticleDocument => {
  return {
    title: article.title ?? "",
    content: article.content ?? "",
    textContent: article.textContent ?? "",
    length: article.length ?? 0,
    excerpt: article.excerpt ?? "",
    byline: article.byline ?? "",
    dir: article.dir ?? "",
    siteName: article.siteName ?? "",
    lang: article.lang ?? "",
    publishedTime: article.publishedTime ?? "",
    html: DOMPurify.sanitize(document.documentElement.outerHTML),
    segments: [],
  };
};

const findArticle = (html: HTMLElement) => {
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

const parseHtml = (
  html: HTMLElement,
  content: HTMLElement,
): ArticleElement[] => {
  let h1 = html.querySelector("h1");

  if (h1 === undefined || h1 === null) {
    h1 = document.body.querySelectorAll("h1").values().toArray().at(0)!;
  }

  const header: ArticleElement = {
    type: "heading",
    level: 1,
    nodeName: h1?.nodeName,
    text: h1?.innerText,
  };

  const cleanedContent = clean(content);

  const body: ArticleElement[] = [header];

  body.push(author(body, cleanedContent));
  // console.log("Simple Article, ", simpleArticle);
  for (let i = 0; i < cleanedContent.children.length; i++) {
    const node = cleanedContent.children.item(i);

    console.log("node", node);

    if (node === null) continue;

    const element = {
      type: "paragraph",
      level: -1,
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
        element.text = DOMPurify.sanitize(node.innerHTML);
        body.push(element);
        break;
      case "FIGURE":
        element.type = "figure";
        element.text = sanitizeMedia(node);
        body.push(element);
        break;
      case "VIDEO":
        element.type = "video";
        element.text = sanitizeMedia(node, true);
        body.push(element);
        break;
      default:
        // if (node.querySelector("picture")) {
        //   const pic = node.querySelector("picture");
        //   element.type = "picture";
        //   element.nodeName = "PICTURE";
        //   element.text = DOMPurify.sanitize(pic?.innerHTML!);
        //   body.push(element);
        // }

        node.querySelectorAll("button").forEach((button) => button.remove());

        if (node.querySelector("video")) {
          element.type = "video";
          element.nodeName = "VIDEO";
          element.text = sanitizeMedia(node);
          body.push(element);
        } else if (node.matches('[data-component-name="VideoEmbedPlayer"]')) {
          // Some sites leave an empty player placeholder when the original
          // video is unavailable. Do not turn that placeholder into a blank
          // block in the reader.
          break;
        } else if (node.firstChild?.nodeName === "FIGURE") {
          const figure = node.querySelector("figure");
          figure
            ?.querySelectorAll("button")
            .forEach((button) => button.remove());
          element.type = "figure";
          element.nodeName = node.firstChild?.nodeName ?? "DIV";
          element.text = figure ? sanitizeMedia(figure) : "";
          body.push(element);
        } else if (node.querySelector("picture")) {
          const pic = node.querySelector("picture");
          pic?.querySelectorAll("button").forEach((button) => button.remove());
          element.type = "picture";
          element.nodeName = "PICTURE";
          element.text = pic ? sanitizeMedia(pic) : "";
          body.push(element);
        } else {
          element.type = node.nodeName;
          element.text = sanitizeMedia(node);
          body.push(element);
        }
        break;
    }
  }

  return body;
};

const sanitizeMedia = (node: Element, includeNode = false) => {
  const clone = node.cloneNode(true) as HTMLElement;

  const sourceVideos = [
    ...(node.matches("video") ? [node as HTMLVideoElement] : []),
    ...node.querySelectorAll<HTMLVideoElement>("video"),
  ];
  const clonedVideos = [
    ...(clone.matches("video") ? [clone as HTMLVideoElement] : []),
    ...clone.querySelectorAll<HTMLVideoElement>("video"),
  ];

  clonedVideos.forEach((video, index) => {
    const sourceVideo = sourceVideos[index];
    const playableSource =
      sourceVideo?.currentSrc ||
      sourceVideo?.src ||
      sourceVideo?.dataset.src ||
      sourceVideo?.dataset.videoSrc;

    if (playableSource) {
      video.src = playableSource;
    }
    video.controls = true;
    video.removeAttribute("autoplay");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "metadata");
  });

  const mediaNodes = [
    clone,
    ...clone.querySelectorAll<HTMLElement>("video, source, track"),
  ];
  mediaNodes.forEach((media) => {
    ["src", "poster"].forEach((attribute) => {
      const value =
        media.getAttribute(attribute) ||
        media.getAttribute(`data-${attribute}`);
      if (!value || value.startsWith("data:") || value.startsWith("blob:"))
        return;

      try {
        media.setAttribute(attribute, new URL(value, document.baseURI).href);
      } catch {
        // Keep malformed source values unchanged; DOMPurify still sanitizes them.
      }
    });
  });

  return DOMPurify.sanitize(includeNode ? clone.outerHTML : clone.innerHTML, {
    ADD_TAGS: ["video", "source", "track"],
    ADD_ATTR: [
      "controls",
      "poster",
      "preload",
      "playsinline",
      "kind",
      "srclang",
      "label",
      "default",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
};

const clean = (html: HTMLElement) => {
  const clone = html.cloneNode(true) as HTMLElement;
  clone.querySelector("footer")?.remove();
  return clone;
};

const author = (body: ArticleElement[], content: HTMLElement) => {
  const authorName = document.head
    .querySelector("meta[name=author]")
    ?.getAttribute("content");
  const publishedDate =
    document.body.querySelector("time")?.getAttribute("datetime") ||
    document.head
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content");
  const modifiedDate = document.head
    .querySelector('meta[property="article:modified_time"]')
    ?.getAttribute("content");
  const avatar = document.body
    .querySelector("img[alt*=avatar]")
    ?.getAttribute("src");

  const byline = document.createElement("div");
  byline.className = "article-byline-inner";

  if (avatar) {
    const image = document.createElement("img");
    image.className = "article-byline-avatar";
    image.src = avatar;
    image.alt = "";
    byline.append(image);
  }

  const details = document.createElement("div");
  details.className = "article-byline-details";

  if (authorName) {
    const name = document.createElement("p");
    name.className = "article-byline-name";
    name.textContent = authorName;
    details.append(name);
  }

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? date
      : new Intl.DateTimeFormat(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(parsedDate);
  };

  if (publishedDate) {
    const time = document.createElement("time");
    time.className = "article-byline-date";
    time.dateTime = publishedDate;
    time.textContent = formatDate(publishedDate);
    details.append(time);
  }

  const publishedTimestamp = publishedDate
    ? new Date(publishedDate).getTime()
    : Number.NaN;
  const modifiedTimestamp = modifiedDate
    ? new Date(modifiedDate).getTime()
    : Number.NaN;

  if (
    modifiedDate &&
    Number.isFinite(publishedTimestamp) &&
    Number.isFinite(modifiedTimestamp) &&
    modifiedTimestamp > publishedTimestamp
  ) {
    const time = document.createElement("time");
    time.className = "article-byline-date article-byline-updated";
    time.dateTime = modifiedDate;
    time.textContent = `Updated ${formatDate(modifiedDate)}`;
    details.append(time);
  }

  byline.append(details);

  const authorElement = {
    type: "P",
    level: -1,
    nodeName: "AUTHOR",
    text: byline.outerHTML,
  };

  return authorElement;
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

  ps?.forEach((p) => {
    paragraphs.push(p.innerText);
  });

  return paragraphs;
};
