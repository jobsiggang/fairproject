import { canvasConfig } from "./compositeConfig";

export const createCompositeImage = async (file, entries) => {
  return new Promise((resolve, reject) => {
    const imgObj = new Image();
    imgObj.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvasConfig.width;
        canvas.height = canvasConfig.height;
        const ctx = canvas.getContext("2d");

        // 배경에 원본 이미지 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

        // 표 영역
        const tableWidth = canvas.width * canvasConfig.table.widthRatio;
        const tableHeight = canvas.height * canvasConfig.table.heightRatio;
        const tableX = 0;
        const tableY = canvas.height - tableHeight;

        ctx.fillStyle = canvasConfig.table.backgroundColor;
        ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
        ctx.strokeStyle = canvasConfig.table.borderColor;
        ctx.lineWidth = canvasConfig.table.borderWidth;
        ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

        const rowHeight = tableHeight / entries.length;
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

          const displayValue = entry.field === "일자" ? entry.value.replace(/-/g, ".") : entry.value;
          ctx.fillText(entry.field, tableX + 6, y + rowHeight / 2);
          ctx.fillText(displayValue, tableX + col1Width + 6, y + rowHeight / 2);
        });

        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    };
    imgObj.onerror = reject;
    imgObj.src = URL.createObjectURL(file);
  });
};
