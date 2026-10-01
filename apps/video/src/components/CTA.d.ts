import React from "react";
export interface CTAProps {
    expansionProgress?: number;
    isCopyHovered?: boolean;
    isCopyClicked?: boolean;
    isCopied?: boolean;
    style?: React.CSSProperties;
}
export declare const CTA: React.FC<CTAProps>;
