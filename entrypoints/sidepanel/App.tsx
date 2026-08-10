import { createElement, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import type { Element } from "@/lib/types";

function ArticleComponent({ element }: { element: Element }) {
  if (element.text === null || element.text === undefined) return null;

  const html = DOMPurify.sanitize(element.text);

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

  if (element.nodeName === "FIGURE" || element.nodeName === "PICTURE") {
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
  const [pageContent, setPageContent] = useState<Array<Element> | null>();

  useEffect(() => {
    const receiveArticle = (message: Array<Element> | null) => setPageContent(message);
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
