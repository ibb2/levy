import { useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);
  const [pageContent, setPageContent] = useState<Array<string>>([""]);

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    setPageContent(message);
  });

  return (
    <main className="min-h-screen space-y-4 bg-background p-4 text-foreground">
      <section className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <p>
          {pageContent.map((item) => (
            <div>{item}</div>
          ))}
        </p>
      </section>
    </main>
  );
}

export default App;
