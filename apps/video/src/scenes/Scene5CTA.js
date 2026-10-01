import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CTA } from "../components/CTA";
import { Cursor } from "../components/Cursor";
export const Scene5CTA = () => {
    const frame = useCurrentFrame(); // local frame 0..300
    const { fps } = useVideoConfig();
    // Full Bleed Coral Expansion Spring
    const expansionSpring = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
    // Cursor Move to Copy Command button at x: 1210, y: 590
    const cursorMoveStart = 90;
    const cursorClickStart = 160;
    const cursorX = interpolate(frame, [cursorMoveStart, cursorClickStart], [600, 1210], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const cursorY = interpolate(frame, [cursorMoveStart, cursorClickStart], [850, 590], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const isClicking = frame >= cursorClickStart && frame <= cursorClickStart + 25;
    const clickProgress = interpolate(frame, [cursorClickStart, cursorClickStart + 25], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const isCopied = frame >= cursorClickStart + 12;
    return (_jsxs("div", { style: {
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
        }, children: [_jsx(CTA, { expansionProgress: expansionSpring, isCopyHovered: frame >= cursorClickStart - 20 && frame < cursorClickStart, isCopyClicked: isClicking, isCopied: isCopied }), frame >= cursorMoveStart && (_jsx(Cursor, { x: cursorX, y: cursorY, isClicking: isClicking, clickProgress: clickProgress, showRipple: isClicking }))] }));
};
//# sourceMappingURL=Scene5CTA.js.map