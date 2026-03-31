"use client";

import React, { useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { getAccessToken } from "@/lib/auth";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  onEnded,
}) => {
  const player = useRef<MediaPlayerInstance>(null);

  // Configure HLS.js with Authorization header
  const onProviderChange = (provider: any) => {
    if (provider?.type === "hls") {
      const hls = provider.instance;
      hls.config.xhrSetup = (xhr: XMLHttpRequest, url: string) => {
        const token = getAccessToken();
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
      };
    }
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden group">
      <MediaPlayer
        ref={player}
        title={title}
        src={src}
        onProviderChange={onProviderChange}
        onEnded={onEnded}
        playsInline
        className="w-full h-full"
        crossOrigin
      >
        <MediaProvider>
          {poster && <Poster src={poster} className="vds-poster" alt={title} />}
        </MediaProvider>

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
    </div>
  );
};
