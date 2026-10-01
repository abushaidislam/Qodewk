import React from "react";
export interface TerminalCardProps {
    commandText?: string;
    typeProgress?: number;
    isExecuted?: boolean;
    showExecuteButton?: boolean;
    executeButtonHovered?: boolean;
    executeButtonClicked?: boolean;
    outputLines?: string[];
    style?: React.CSSProperties;
}
export declare const TerminalCard: React.FC<TerminalCardProps>;
