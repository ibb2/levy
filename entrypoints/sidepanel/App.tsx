import { createElement, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import type { Element as ArticleElement } from "@/lib/types";

function ArticleComponent({ element }: { element: ArticleElement }) {
  if (element.text === null || element.text === undefined) return null;

  const html = DOMPurify.sanitize(element.text, {
    ADD_TAGS: ["video", "source", "track"],
    ADD_ATTR: ["controls", "poster", "preload", "playsinline", "kind", "srclang", "label", "default"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });

  if (element.nodeName === "UL" || element.nodeName === "OL") {
    const List = element.nodeName === "UL" ? "ul" : "ol";
    return <List className="article-list" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (element.nodeName === "TABLE") {
    return (
      <div className="article-table-wrap">
        <table dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  if (
    element.nodeName === "FIGURE" ||
    element.nodeName === "PICTURE" ||
    element.nodeName === "VIDEO"
  ) {
    return <div className="article-media" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (element.type === "heading") {
    const level = Math.min(6, Math.max(1, element.level || 6));
    return createElement(`h${level}`, {
      className: `article-heading article-heading-${level}`,
      dangerouslySetInnerHTML: { __html: html },
    });
  }

  return (
    <div
      className={element.nodeName === "DIV" ? "article-block" : "article-paragraph"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function App() {
  const [pageContent, setPageContent] = useState<Array<ArticleElement> | null>();

  useEffect(() => {
    const receiveArticle = (message: Array<ArticleElement> | null) => setPageContent(message);
    browser.runtime.onMessage.addListener(receiveArticle);
    return () => browser.runtime.onMessage.removeListener(receiveArticle);
  }, []);

  return (
    <main className="reader-shell">
      {pageContent !== null && pageContent !== undefined && pageContent.length > 0 ? (
        <article className="reader-article">
          {pageContent.map((element, index) => (
            <ArticleComponent key={`${element.nodeName}-${index}`} element={element} />
          ))}
        </article>
      ) : (
        <div className="reader-empty">
          <p>Sorry, I couldn't find any articles 😔</p>
        </div>
      )}
    </main>
  );
}

export default App;
