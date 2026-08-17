import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppProps = {
  onHide: () => void;
};

export default ({ onHide }: AppProps) => {


  const play = () => {
    browser.runtime.sendMessage({ command: "Play" });
  };

  const pause = () => {
    browser.runtime.sendMessage({ command: "Pause" });
  };

  return (
    <div className="flex items-center gap-2 bg-amber-200 p-2">
      <Button variant="ghost" onClick={play}>
        Play
      </Button>
      <Button variant="ghost" onClick={pause}>
        Pause
      </Button>
      <Button
        className="ml-auto"
        variant="ghost"
        size="icon"
        aria-label="Hide player"
        title="Hide player"
        onClick={onHide}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
};
