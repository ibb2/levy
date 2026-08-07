import { useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);
  const [pageContent, setPageContent] = useState("");

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    setPageContent(message);
  });

  return (
    <main className="min-h-screen space-y-4 bg-background p-4 text-foreground">
      <div>
        <h1 className="text-xl font-semibold">Levy</h1>
        <p className="text-sm text-muted-foreground">
          Your React and shadcn/ui side panel is ready.
        </p>
      </div>

      <section className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <Button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </Button>
        <p className="text-sm text-muted-foreground">
          Edit <code>entrypoints/sidepanel/App.tsx</code> to get started.
        </p>
        <p>{pageContent}</p>
      </section>
    </main>
  );
}

export default App;
