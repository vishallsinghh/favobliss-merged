import React from "react";
import Plyr from "plyr-react";

interface PlyrVideoPlayerProps {
  videoUrl: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean | string[];
  onError?: (error: string) => void;
}

export const VideoPlayer = ({
  videoUrl,
  width = 560,
  height = 315,
  autoplay = false,
  muted = true,
  controls = true,
  onError,
}: PlyrVideoPlayerProps) => {
  const mp4Url = videoUrl;

  const playerOptions = {
    autoplay,
    muted,
    controls: [
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "settings",
      "fullscreen",
    ],
  };

  const handleError = (event: any) => {
    const errorMessage = event.detail || "Playback failed";
    console.error("Plyr Error:", errorMessage, { videoUrl });
    if (onError) onError(errorMessage);
  };

  return (
    <div style={{ width: "100%", height: "fit-content", border: "1px solid transparent" }}>
      <Plyr
        source={{
          type: "video",
          sources: [
            { src: mp4Url, type: "video/mp4" },
          ],
        }}
        options={playerOptions}
        onError={handleError}
      />
    </div>
  );
};
