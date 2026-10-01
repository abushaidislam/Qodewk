import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate } from "remotion";
export const Cursor = ({ x, y, isClicking = false, clickProgress = 0, showRipple = false, style, }) => {
    // Click scale effect: scale drops to 0.85 when clicking
    const scale = isClicking
        ? interpolate(clickProgress, [0, 0.4, 1], [1, 0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
        : 1;
    // Ripple effect: ring expanding from cursor tip
    const rippleScale = interpolate(clickProgress, [0, 1], [0.2, 2.8], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const rippleOpacity = interpolate(clickProgress, [0, 0.2, 1], [0.9, 0.6, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    return (_jsxs("div", { style: {
            position: "absolute",
            left: x,
            top: y,
            pointerEvents: "none",
            zIndex: 1000,
            transform: `translate(-2px, -2px) scale(${scale})`,
            transformOrigin: "top left",
            ...style,
        }, children: [(showRipple || isClicking) && (_jsx("div", { style: {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 44,
                    height: 44,
                    marginLeft: -22,
                    marginTop: -22,
                    borderRadius: "50%",
                    border: "2px solid #cc785c",
                    backgroundColor: "rgba(204, 120, 92, 0.25)",
                    transform: `scale(${rippleScale})`,
                    opacity: rippleOpacity,
                } })), _jsx("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
                    filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.35))",
                }, children: _jsx("path", { d: "M3 3L10.07 19.97L13.58 12.58L20.97 9.07L3 3Z", fill: "#181715", stroke: "#faf9f5", strokeWidth: "1.75", strokeLinejoin: "round" }) })] }));
};
//# sourceMappingURL=Cursor.js.map