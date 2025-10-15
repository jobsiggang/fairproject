import { canvasConfig } from "./compositeConfig";

const overlayCache = new Map();

function makeOverlayCanvas(entries) {
  const key = entries.map((e) => `${e.field}:${e.value}`).join("|");
  if (overlayCache.has(key)) return overlayCache.get(key);

  const width = canvasConfig.width;
  const height = canvasConfig.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const tableWidth = width * canvasConfig.table.widthRatio;
  const tableHeight = height * canvasConfig.table.heightRatio;
  const tableX = 0;
  const tableY = height - tableHeight;

  ctx.fillStyle = canvasConfig.table.backgroundColor;
  ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
  ctx.strokeStyle = canvasConfig.table.borderColor;
  ctx.lineWidth = canvasConfig.table.borderWidth;
  ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

  const rowHeight = tableHeight / (entries.length || 1);
  const col1Width = tableWidth * canvasConfig.table.col1Ratio;

  ctx.font = canvasConfig.table.font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = canvasConfig.table.textColor;

  entries.forEach((entry, i) => {
    const y = tableY + i * rowHeight;

    ctx.beginPath();
    ctx.moveTo(tableX, y);
    ctx.lineTo(tableX + tableWidth, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tableX + col1Width, y);
    ctx.lineTo(tableX + col1Width, y + rowHeight);
    ctx.stroke();

    const displayValue =
      entry.field === "일자" ? entry.value.replace(/-/g, ".") : entry.value;
    ctx.fillText(entry.field, tableX + 6, y + rowHeight / 2);
    ctx.fillText(displayValue, tableX + col1Width + 6, y + rowHeight / 2);
  });

  overlayCache.set(key, canvas);
  return canvas;
}

/**
 * 유지할 조건:
 * - 이미지 비율 유지하지 않음 (stretch)
 * - 캔버스 크기에 꽉 채움 (회전 시 가로/세로 교환 처리)
 */
export const createCompositeImage = async (file, entries, rotation = 0) => {
  // 이미지 디코딩 (빠른 브라우저 API 우선)
  let imgBitmap = null;
  let objectUrl = null;
  try {
    if (typeof createImageBitmap === "function") {
      imgBitmap = await createImageBitmap(file);
    } else {
      // 폴백: HTMLImageElement 사용
      await new Promise((resolve, reject) => {
        const img = new Image();
        objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          try {
            // draw to temp canvas and convert to ImageBitmap if available
            const tmp = document.createElement("canvas");
            tmp.width = img.naturalWidth;
            tmp.height = img.naturalHeight;
            tmp.getContext("2d").drawImage(img, 0, 0);
            if (typeof createImageBitmap === "function") {
              createImageBitmap(tmp)
                .then((bmp) => {
                  imgBitmap = bmp;
                  resolve();
                })
                .catch(() => {
                  imgBitmap = img;
                  resolve();
                });
            } else {
              imgBitmap = img;
              resolve();
            }
          } catch (err) {
            reject(err);
          } finally {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
          reject(e);
        };
        img.src = objectUrl;
      });
    }
  } catch (err) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    throw err;
  }

  // 결과 캔버스
  const width = canvasConfig.width;
  const height = canvasConfig.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 성능 우선 옵션 (필요 시 조정)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";

  // 회전에 따른 대상 그리기 크기 결정 (비율 유지하지 않음 -> 단순 치환)
  let drawW = width;
  let drawH = height;
  if (rotation % 180 !== 0) {
    // 90 or 270: 가로/세로 교체
    drawW = height;
    drawH = width;
  }

  // 중앙 회전 후 스트레치로 캔버스에 꽉 채우기 (비율 유지 X)
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // imgBitmap may be ImageBitmap or Image; draw stretched to drawW x drawH centered
  ctx.drawImage(imgBitmap, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // 테이블(오버레이) 합성 (캐시된 오버레이 사용)
  const overlay = makeOverlayCanvas(entries);
  ctx.drawImage(overlay, 0, 0, width, height);

  // ImageBitmap 메모리 정리 가능하면 수행
  if (imgBitmap && typeof imgBitmap.close === "function") {
    try {
      imgBitmap.close();
    } catch (e) {
      /* ignore */
    }
  }

  return canvas;
};
