import React from "react";
export interface ZoomContainerProps {
    children: React.ReactNode;
    scale?: number;
    targetScale?: number;
    translateX?: number;
    targetTranslateX?: number;
    translateY?: number;
    targetTranslateY?: number;
    progress?: number;
    style?: React.CSSProperties;
}
export declare const ZoomContainer: React.FC<ZoomContainerProps>;
