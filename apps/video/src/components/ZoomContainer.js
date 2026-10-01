import { jsx as _jsx } from "react/jsx-runtime";
import { interpolate } from "remotion";
export const ZoomContainer = ({ children, scale = 1, targetScale = 1, translateX = 0, targetTranslateX = 0, translateY = 0, targetTranslateY = 0, progress = 0, style, }) => {
    const currentScale = interpolate(progress, [0, 1], [scale, targetScale], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const currentX = interpolate(progress, [0, 1], [translateX, targetTranslateX], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const currentY = interpolate(progress, [0, 1], [translateY, targetTranslateY], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    return (_jsx("div", { style: {
            width: "100%",
            height: "100%",
            transform: `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`,
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...style,
        }, children: children }));
};
//# sourceMappingURL=ZoomContainer.js.map