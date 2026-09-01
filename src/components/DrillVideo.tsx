"use client";

import { useState } from "react";

/**
 * Shows a drill demo video.
 * - If `explicitUrl` is a YouTube link, renders a "Watch the drill" link.
 * - Otherwise tries `/drills/<drillKey>.mp4` (drop files in public/drills/) and
 *   quietly hides itself if there's no file there.
 */
export function DrillVideo({
  drillKey,
  explicitUrl,
}: {
  drillKey: string;
  explicitUrl?: string;
}) {
  const [hidden, setHidden] = useState(false);

  if (explicitUrl) {
    const isYouTube = /youtu\.?be/.test(explicitUrl);
    if (isYouTube) {
      return (
        <a
          href={explicitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-primary underline"
        >
          ▶ Watch the drill
        </a>
      );
    }
    return (
      <video
        src={explicitUrl}
        controls
        preload="none"
        className="mt-2 w-full max-w-sm rounded-lg border border-border bg-black"
      />
    );
  }

  if (hidden) return null;

  return (
    <video
      src={`/drills/${drillKey}.mp4`}
      controls
      preload="none"
      onError={() => setHidden(true)}
      className="mt-2 w-full max-w-sm rounded-lg border border-border bg-black"
    />
  );
}
