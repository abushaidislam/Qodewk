// @ts-ignore
import QRCodeCore from "qrcode/lib/core/qrcode.js";
// @ts-ignore
import TerminalRenderer from "qrcode/lib/renderer/terminal.js";

/**
 * Renders a lightweight, 100% scannable 2D QR Code using Unicode half-blocks.
 * Directly uses core QR generation and terminal rendering without pulling in pngjs/canvas.
 */
export function renderTerminalQr(text: string): string[] {
  try {
    const data = QRCodeCore.create(text, { errorCorrectionLevel: "M" });
    const rendered = TerminalRenderer.render(data, { small: true }) as string;
    return rendered.split("\n").filter(r => r.length > 0);
  } catch {
    return [];
  }
}
