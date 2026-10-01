import React from "react";
import { Composition, registerRoot } from "remotion";
import { QodewkProductDemo } from "./QodewkProductDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QodewkProductDemo"
        component={QodewkProductDemo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
