"use client";
import React, { useRef, useEffect } from "react";

export default function ImageCanvas({ image, entries, canvasWidth, canvasHeight }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const ctx = canvasRef.current.getContext("2d");

    const drawImageWithTable = (img, entries) => {
      const canvas = canvasRef.current;
      canvas.width = canvasWidth;   // 업로드용 고정 크기
      canvas.height = canvasHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 테이블 그리기
      const tableWidth = canvas.width / 3;
      const tableHeight = canvas.height / 3;
      const tableX = 0;
      const tableY = canvas.height - tableHeight;

      ctx.fillStyle = "#fff";
      ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

      const rowHeight = tableHeight / entries.length;
      const col1Width = tableWidth * 0.4;

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

        ctx.fillStyle = "#000";
        ctx.font = "bold 25px 'Malgun Gothic'";
        ctx.textBaseline = "middle";
        const displayValue = entry.field === "일자" ? entry.value.replace(/-/g, ".") : entry.value;
        ctx.fillText(entry.field, tableX + 4, y + rowHeight / 2);
        ctx.fillText(displayValue, tableX + col1Width + 4, y + rowHeight / 2);
      });
    };

    const imgObj = new Image();
    imgObj.onload = () => drawImageWithTable(imgObj, entries);
    imgObj.src = URL.createObjectURL(image);
  }, [image, entries, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "auto",
        border: "2px solid #222",
        borderRadius: 10,
        boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
      }}
    />
  );
}
