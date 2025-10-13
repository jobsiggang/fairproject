import { canvasConfig } from "./compositeConfig";

export const createCompositeImage = async (file, entries, rotation = 0) => {
  return new Promise((resolve, reject) => {
    const imgObj = new Image();
    const objectUrl = URL.createObjectURL(file);

    imgObj.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvasConfig.width;
        canvas.height = canvasConfig.height;
        const ctx = canvas.getContext("2d");

        // 회전 중심 캔버스 중앙
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        // 이미지 비율 유지하며 캔버스에 맞춤
// 이미지 비율 유지 X, 캔버스 크기에 'cover' 방식으로 꽉 채우기
let drawWidth, drawHeight;

// 회전 각도에 따라 비율 계산
if (rotation % 180 === 0) {
  drawWidth = canvas.width;
  drawHeight = canvas.height;
} else {
  // 가로세로 뒤바뀜
  drawWidth = canvas.height;
  drawHeight = canvas.width;
}


        ctx.drawImage(imgObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        // 테이블 영역
        const tableWidth = canvas.width * canvasConfig.table.widthRatio;
        const tableHeight = canvas.height * canvasConfig.table.heightRatio;
        const tableX = 0;
        const tableY = canvas.height - tableHeight;

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

          // 가로줄
          ctx.beginPath();
          ctx.moveTo(tableX, y);
          ctx.lineTo(tableX + tableWidth, y);
          ctx.stroke();

          // 세로줄
          ctx.beginPath();
          ctx.moveTo(tableX + col1Width, y);
          ctx.lineTo(tableX + col1Width, y + rowHeight);
          ctx.stroke();

          const displayValue =
            entry.field === "일자" ? entry.value.replace(/-/g, ".") : entry.value;
          ctx.fillText(entry.field, tableX + 6, y + rowHeight / 2);
          ctx.fillText(displayValue, tableX + col1Width + 6, y + rowHeight / 2);
        });

        resolve(canvas);
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    imgObj.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };

    imgObj.src = objectUrl;
  });
};
