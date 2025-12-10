interface PieceMeasures {
  name?: string;
  w: number;
  h: number;
}

export type GrainDirection = "H" | "V" | "VH";

interface OptimizerConfig {
  sheetW: number;
  sheetH: number;
  items: PieceMeasures[];
  margin: number;
  pieceSpacing: number;
  orientation: GrainDirection;
  wastePercentage: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type FreeRect = Rect;

interface PlacedRect extends Rect {
  name: string;
  rotated: boolean;
  origW: number;
  origH: number;
  drawnW: number;
  drawnH: number;
  oversize?: boolean;
}

interface Sheet {
  w: number;
  h: number;
  freeRects: FreeRect[];
  usedRects: PlacedRect[];
}

interface ResultsLite {
  utilizationPerSheet: number[];
  totalFractionalSheets: number;
  totalIntegerSheets: number;
}

interface ResultsFull extends ResultsLite {
  base64Images: string[];
}

export class CuttingPlan {
  private readonly sheets: Sheet[] = [];
  private readonly config: OptimizerConfig;

  constructor(config: OptimizerConfig) {
    this.config = config;

    const { sheetW, sheetH, items, margin, pieceSpacing, orientation } = config;

    this.sheets = this.#packMaxRects(
      sheetW,
      sheetH,
      items,
      orientation,
      margin,
      pieceSpacing,
    );
  }

  public calculate({ includeImages }: { includeImages: boolean }): ResultsFull {
    return this.#calculateResults({ includeImages }) as ResultsFull;
  }

  #calculateResults(options: {
    includeImages: boolean;
  }): ResultsLite | ResultsFull {
    const { sheetW, sheetH, wastePercentage } = this.config;
    const wasteThreshold = (wastePercentage || 0) / 100;
    const base64Images: string[] = [];
    const utilizationPerSheet: number[] = [];
    let totalFractionalSheets = 0;
    const sheetTotalArea = sheetW * sheetH;

    let count = 0;

    for (const s of this.sheets) {
      count++;

      let usedAreaOnThisSheet = s.usedRects.reduce(
        (sum, u) => sum + (u.oversize ? 0 : u.origW * u.origH),
        0,
      );

      let utilization = usedAreaOnThisSheet / sheetTotalArea;
      if (1 - utilization > 0 && 1 - utilization <= wasteThreshold) {
        utilization = 1.0;
      }

      utilizationPerSheet.push(utilization);
      totalFractionalSheets += utilization;

      if (options.includeImages) {
        base64Images.push(this.#generateBase64Image(s, sheetW, sheetH));
      }
    }

    const result: ResultsLite = {
      utilizationPerSheet,
      totalFractionalSheets,
      totalIntegerSheets: count,
    };

    if (options.includeImages) {
      return { ...result, base64Images };
    }

    return result;
  }

  #drawWoodTexture(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    direction: "H" | "V",
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const baseColor = "#e3c099";
    const veinColor = "rgba(139, 69, 19, 0.3)";

    ctx.fillStyle = baseColor;
    ctx.fill();

    ctx.strokeStyle = veinColor;
    ctx.lineWidth = 3;

    const step = 12;

    if (direction === "H") {
      for (let i = 0; i < h; i += step + Math.random() * 8) {
        ctx.beginPath();
        const startY = y + i;
        ctx.moveTo(x, startY);
        ctx.bezierCurveTo(
          x + w / 3,
          startY + (Math.random() * 8 - 4),
          x + (2 * w) / 3,
          startY + (Math.random() * 8 - 4),
          x + w,
          startY,
        );
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < w; i += step + Math.random() * 8) {
        ctx.beginPath();
        const startX = x + i;
        ctx.moveTo(startX, y);
        ctx.bezierCurveTo(
          startX + (Math.random() * 8 - 4),
          y + h / 3,
          startX + (Math.random() * 8 - 4),
          y + (2 * h) / 3,
          startX,
          y + h,
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  #drawTextFit(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    baseFontSize: number,
    isBold: boolean = false,
    maximize: boolean = true,
  ) {
    if (maxWidth <= 0) return;

    const UPSCALE_THRESHOLD = 1.1;
    const MAX_GROWTH_CAP = 1.85;

    let fontSize = baseFontSize;
    const fontStyle = isBold ? "bold " : "";

    ctx.font = `${fontStyle}${fontSize}px sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const ratio = maxWidth / textWidth;

    if (ratio < 1) {
      fontSize = Math.floor(baseFontSize * ratio);
      if (fontSize < 10) return;
    } else if (maximize && ratio > UPSCALE_THRESHOLD) {
      const growthFactor = Math.min(ratio, MAX_GROWTH_CAP);
      fontSize = Math.floor(baseFontSize * growthFactor);
    }

    ctx.font = `${fontStyle}${fontSize}px sans-serif`;
    ctx.fillText(text, x, y);
  }

  #generateBase64Image(sheet: Sheet, sheetW: number, sheetH: number): string {
    if (typeof document === "undefined") {
      console.warn("Trying to generate canvas on server. Skipping...");
      return "";
    }

    const unit = "cm";
    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");
    const padding = 25;

    if (!ctx) return "";

    exportCanvas.width = 2400;
    exportCanvas.height =
      Math.round(exportCanvas.width * (sheetH / sheetW)) + padding * 2;

    const sheetRatio = sheetH / sheetW;

    const enableOpticalCompensation = sheetRatio > 1.25;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeRect(
      padding,
      padding,
      exportCanvas.width - padding * 2,
      exportCanvas.height - padding * 2,
    );

    const scaleX = (exportCanvas.width - padding * 2) / sheetW;
    const scaleY = (exportCanvas.height - padding * 2) / sheetH;

    const fontNameSize = 45;
    const fontDimSize = 43;

    for (const u of sheet.usedRects) {
      const x = u.x * scaleX + padding;
      const y = u.y * scaleY + padding;
      const w = u.drawnW * scaleX;
      const h = u.drawnH * scaleY;

      if (u.oversize) {
        ctx.fillStyle = "#666666";
        ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
      } else {
        if (this.config.orientation === "H") {
          this.#drawWoodTexture(ctx, x + 0.5, y + 0.5, w - 1, h - 1, "H");
        } else if (this.config.orientation === "V") {
          this.#drawWoodTexture(ctx, x + 0.5, y + 0.5, w - 1, h - 1, "V");
        } else {
          ctx.fillStyle = "#CCCCCC";
          ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
        }
      }

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxNameWidth = (limit: number) => Math.max(0, limit - 20);

      ctx.font = `bold ${fontNameSize}px sans-serif`;
      const textMetrics = ctx.measureText(u.name);
      const textWidth = textMetrics.width;

      const availW = maxNameWidth(w);
      const availH = maxNameWidth(h);
      const fitRatioH = availW / textWidth;
      const fitRatioV = availH / textWidth;

      const shouldRotateText = fitRatioV > fitRatioH;

      if (shouldRotateText) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(-Math.PI / 2);
        this.#drawTextFit(
          ctx,
          u.name,
          0,
          0,
          availH,
          fontNameSize,
          true,
          enableOpticalCompensation,
        );
        ctx.restore();
      } else {
        this.#drawTextFit(
          ctx,
          u.name,
          x + w / 2,
          y + h / 2,
          availW,
          fontNameSize,
          true,
          enableOpticalCompensation,
        );
      }

      const widthLabel = `${u.rotated ? u.origH : u.origW} ${unit}`;
      const heightLabel = `${u.rotated ? u.origW : u.origH} ${unit}`;
      const marginText = 10;

      if (w > 60) {
        ctx.textBaseline = "bottom";
        ctx.textAlign = "center";
        this.#drawTextFit(
          ctx,
          widthLabel,
          x + w / 2,
          y + h - marginText,
          maxNameWidth(w),
          fontDimSize,
          false,
          enableOpticalCompensation,
        );
      }

      if (h > 60) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.translate(x + w - marginText, y + h / 2);
        ctx.rotate(-Math.PI / 2);

        this.#drawTextFit(
          ctx,
          heightLabel,
          0,
          0,
          maxNameWidth(h),
          fontDimSize,
          false,
          enableOpticalCompensation,
        );
        ctx.restore();
      }
    }

    return exportCanvas.toDataURL("image/png");
  }

  readonly #packMaxRects = (
    sheetW: number,
    sheetH: number,
    items: PieceMeasures[],
    orientation: GrainDirection,
    margin: number,
    pieceSpacing: number,
  ): Sheet[] => {
    const sheets: Sheet[] = [];
    const sortedItems = items.slice().sort((a, b) => b.w * b.h - a.w * a.h);
    const allowRotate = orientation === "VH";

    for (const item of sortedItems) {
      let placed = false;

      for (const sheet of sheets) {
        const pos = this.#findPositionForNewNode(
          sheet,
          item.w,
          item.h,
          allowRotate,
          pieceSpacing,
        );

        if (pos) {
          this.#placeRect(
            sheet,
            {
              ...pos,
              origW: item.w,
              origH: item.h,
              drawnW: pos.rotated ? item.h : item.w,
              drawnH: pos.rotated ? item.w : item.h,
              name: item.name || "Peça",
            },
            pieceSpacing,
          );
          placed = true;
          break;
        }
      }

      if (!placed) {
        const newSheet = this.#createSheet(sheetW, sheetH, margin);
        const pos = this.#findPositionForNewNode(
          newSheet,
          item.w,
          item.h,
          allowRotate,
          pieceSpacing,
        );

        if (pos) {
          this.#placeRect(
            newSheet,
            {
              ...pos,
              origW: item.w,
              origH: item.h,
              drawnW: pos.rotated ? item.h : item.w,
              drawnH: pos.rotated ? item.w : item.h,
              name: item.name || "Peça",
            },
            pieceSpacing,
          );
        } else {
          newSheet.usedRects.push({
            x: 0,
            y: 0,
            w: item.w,
            h: item.h,
            drawnW: item.w,
            drawnH: item.h,
            origW: item.w,
            origH: item.h,
            name: item.name || "Peça",
            oversize: true,
            rotated: false,
          });
        }

        sheets.push(newSheet);
      }
    }

    return sheets;
  };

  readonly #createSheet = (
    sheetW: number,
    sheetH: number,
    margin: number,
  ): Sheet => ({
    w: sheetW,
    h: sheetH,
    freeRects: [
      {
        x: margin,
        y: margin,
        w: sheetW - 2 * margin,
        h: sheetH - 2 * margin,
      },
    ],
    usedRects: [],
  });

  readonly #placeRect = (
    sheet: Sheet,
    rect: PlacedRect,
    pieceSpacing: number,
  ): void => {
    sheet.usedRects.push(rect);

    const spacedRect: Rect = {
      x: rect.x,
      y: rect.y,
      w: rect.drawnW + (rect.oversize ? 0 : pieceSpacing),
      h: rect.drawnH + (rect.oversize ? 0 : pieceSpacing),
    };

    let newFreeRects: FreeRect[] = [];

    for (const freeRect of sheet.freeRects) {
      newFreeRects.push(...this.#splitFreeRect(freeRect, spacedRect));
    }

    sheet.freeRects = newFreeRects;
    this.#pruneFreeRects(sheet.freeRects);
  };

  readonly #findPositionForNewNode = (
    sheet: Sheet,
    w: number,
    h: number,
    allowRotate: boolean,
    pieceSpacing: number,
  ) => {
    let bestNode = null;
    let bestY = Infinity;
    let bestX = Infinity;

    const spacedW = w + pieceSpacing;
    const spacedH = h + pieceSpacing;

    for (const freeRect of sheet.freeRects) {
      if (this.#rectFits(freeRect, spacedW, spacedH)) {
        if (
          freeRect.y < bestY ||
          (freeRect.y === bestY && freeRect.x < bestX)
        ) {
          bestNode = { x: freeRect.x, y: freeRect.y, w, h, rotated: false };
          bestY = freeRect.y;
          bestX = freeRect.x;
        }
      }

      if (allowRotate && this.#rectFits(freeRect, spacedH, spacedW)) {
        if (
          freeRect.y < bestY ||
          (freeRect.y === bestY && freeRect.x < bestX)
        ) {
          bestNode = { x: freeRect.x, y: freeRect.y, w, h, rotated: true };
          bestY = freeRect.y;
          bestX = freeRect.x;
        }
      }
    }

    return bestNode;
  };

  readonly #rectFits = (freeRect: Rect, w: number, h: number) =>
    w <= freeRect.w + 1e-9 && h <= freeRect.h + 1e-9;

  readonly #rectIntersect = (a: Rect, b: Rect) =>
    !(
      a.x + a.w <= b.x + 1e-9 ||
      b.x + b.w <= a.x + 1e-9 ||
      a.y + a.h <= b.y + 1e-9 ||
      b.y + b.h <= a.y + 1e-9
    );

  readonly #splitFreeRect = (freeRect: FreeRect, placedRect: Rect) => {
    if (!this.#rectIntersect(freeRect, placedRect)) return [freeRect];

    const splits: FreeRect[] = [];

    if (placedRect.y > freeRect.y + 1e-9)
      splits.push({
        x: freeRect.x,
        y: freeRect.y,
        w: freeRect.w,
        h: placedRect.y - freeRect.y,
      });

    if (placedRect.y + placedRect.h < freeRect.y + freeRect.h - 1e-9)
      splits.push({
        x: freeRect.x,
        y: placedRect.y + placedRect.h,
        w: freeRect.w,
        h: freeRect.y + freeRect.h - (placedRect.y + placedRect.h),
      });

    if (placedRect.x > freeRect.x + 1e-9)
      splits.push({
        x: freeRect.x,
        y: freeRect.y,
        w: placedRect.x - freeRect.x,
        h: freeRect.h,
      });

    if (placedRect.x + placedRect.w < freeRect.x + freeRect.w - 1e-9)
      splits.push({
        x: placedRect.x + placedRect.w,
        y: freeRect.y,
        w: freeRect.x + freeRect.w - (placedRect.x + placedRect.w),
        h: freeRect.h,
      });

    return splits.filter((r) => r.w > 1e-9 && r.h > 1e-9);
  };

  readonly #pruneFreeRects = (freeRects: FreeRect[]) => {
    for (let i = freeRects.length - 1; i >= 0; i--) {
      const a = freeRects[i];
      for (let j = 0; j < freeRects.length; j++) {
        const b = freeRects[j];
        if (
          i !== j &&
          a.x >= b.x - 1e-9 &&
          a.y >= b.y - 1e-9 &&
          a.x + a.w <= b.x + b.w + 1e-9 &&
          a.y + a.h <= b.y + b.h + 1e-9
        ) {
          freeRects.splice(i, 1);
          break;
        }
      }
    }
  };
}
