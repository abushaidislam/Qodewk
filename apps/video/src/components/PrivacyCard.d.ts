import React from "react";
export interface PrivacyCardProps {
    focusedCard?: "both" | "left" | "right";
    shieldPulseProgress?: number;
    style?: React.CSSProperties;
}
export declare const PrivacyCard: React.FC<PrivacyCardProps>;
