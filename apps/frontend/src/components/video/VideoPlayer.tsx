"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  isHLSProvider,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import HLS from "hls.js";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  token?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  token,
  onEnded,
}) => {
  const player = useRef<MediaPlayerInstance>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      provider.library = HLS;
      if (token) {
        provider.config = {
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
        };
      }
    }
  }

  if (!mounted) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center overflow-hidden rounded-xl border border-white/10" />
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden group">
      <MediaPlayer
        key={src}
        ref={player}
        title={title}
        src={src}
        onEnded={onEnded}
        onProviderChange={onProviderChange}
        logLevel="silent"
        playsInline
        streamType="on-demand"
        storage="devio-player"
        className="w-full h-full"
        crossOrigin
      >
        <MediaProvider className="w-full h-full overflow-hidden flex items-center justify-center">
          {poster && <Poster src={poster} className="vds-poster" alt={title} />}
        </MediaProvider>

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
        />
        
        <style dangerouslySetInnerHTML={{ __html: `
          video { object-fit: contain !important; }
        `}} />
      </MediaPlayer>
    </div>
  );
};
