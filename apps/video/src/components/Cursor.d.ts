import React from "react";
export interface CursorProps {
    x: number;
    y: number;
    isClicking?: boolean;
    clickProgress?: number;
    showRipple?: boolean;
    style?: React.CSSProperties;
}
export declare const Cursor: React.FC<CursorProps>;
