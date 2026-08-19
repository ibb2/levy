import { Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppProps = {
  onHide: () => void;
  onPlay: () => void;
  onPause: () => void;
};

export default ({ onHide, onPlay, onPause }: AppProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const play = () => {
    onPlay();
    setIsPlaying(true);
  };

  const pause = () => {
    onPause();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2 bg-amber-200 p-2">
      {!isPlaying && (
        <Button variant="ghost" onClick={play}>
          <Play />
        </Button>
      )}
      {isPlaying && (
        <Button variant="ghost" onClick={pause}>
          <Pause />
        </Button>
      )}
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
