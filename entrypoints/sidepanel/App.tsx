import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Element } from "@/lib/types";
import { cn } from "@/lib/utils";

function App() {
  const [count, setCount] = useState(0);
  const [pageContent, setPageContent] = useState<Array<Element> | null>();

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    setPageContent(message);
  });

  return (
    <main className="min-h-screen space-y-4 bg-background p-4 text-foreground">
      <section className="flex flex-col items-start gap-3 rounded-lg bg-card p-4">
        {pageContent !== null && pageContent !== undefined && (
          <p>
            {pageContent.map((node: Element) => {
              const headingStyles: Record<number, string> = {
                1: "text-4xl font-bold leading-tight",
                2: "text-3xl font-semibold leading-tight",
                3: "text-2xl font-semibold leading-snug",
                4: "text-xl font-semibold leading-snug",
                5: "text-lg font-medium leading-snug",
                6: "text-base font-medium leading-normal",
              };

              const nodeHierarchyStyling =
                node.type === "paragraph"
                  ? "text-base font-normal leading-7"
                  : node.type === "heading"
                    ? (headingStyles[node.level] ?? headingStyles[6])
                    : "";

              return (
                <div className={cn("py-1", nodeHierarchyStyling)}>
                  {node.text}
                </div>
              );
            })}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
