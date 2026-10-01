import React from "react";
export interface ThermalReceiptProps {
    slideProgress?: number;
    popoverExpanded?: boolean;
    isVerifiedHovered?: boolean;
    isVerifiedClicked?: boolean;
    style?: React.CSSProperties;
}
export declare const ThermalReceipt: React.FC<ThermalReceiptProps>;
