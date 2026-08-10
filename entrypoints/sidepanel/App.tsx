import { useState } from "react";
import { Element } from "@/lib/types";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

function ArticleComponent(element: Element) {
  if (element.text === null || element.text === undefined) return;

  if (element.nodeName === "UL") {
    return (
      <ul
        className="list-disc space-y-2 pl-6 py-1"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element.text) }}
      />
    );
  }

  if (element.nodeName === "OL") {
    return (
      <ol
        className="list-decimal space-y-2 pl-6 py-1"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element.text) }}
      />
    );
  }

  {
    const headingStyles: Record<number, string> = {
      1: "text-4xl font-bold leading-tight",
      2: "text-3xl font-semibold leading-tight",
      3: "text-2xl font-semibold leading-snug",
      4: "text-xl font-semibold leading-snug",
      5: "text-lg font-medium leading-snug",
      6: "text-base font-medium leading-normal",
    };

    const nodeHierarchyStyling =
      element.type === "paragraph"
        ? "text-base font-normal leading-7"
        : element.type === "heading"
          ? (headingStyles[element.level] ?? headingStyles[6])
          : "";

    return (
      <div className={cn("py-1", nodeHierarchyStyling)}>{element.text}</div>
    );
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [pageContent, setPageContent] = useState<Array<Element> | null>();

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message, ", message);
    setPageContent(message);
  });

  return (
    <main className="flex flex-col min-h-screen space-y-4 bg-background p-4 text-foreground">
      {pageContent !== null &&
      pageContent !== undefined &&
      pageContent.length > 0 ? (
        <div>{pageContent.map((node: Element) => ArticleComponent(node))}</div>
      ) : (
        <div className="m-auto">
          <p>Sorry, I couldn't find any articles 😔</p>
        </div>
      )}
    </main>
  );
}

export default App;
