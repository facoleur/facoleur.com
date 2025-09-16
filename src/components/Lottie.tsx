"use client";

import { useEffect, useState } from "react";
import Lottie from "react-lottie-player";

interface LottiePlayerProps {
  src: string; // path to JSON file in /public
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  className,
}: LottiePlayerProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch((err) => console.error("Failed to load Lottie JSON:", err));
  }, [src]);

  if (!animationData) return null; // or a spinner

  return (
    <Lottie
      loop={loop}
      play={autoplay}
      animationData={animationData}
      className={className || "h-full w-full"}
    />
  );
}
