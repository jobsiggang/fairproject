// ImageCanvas.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createCompositeImage } from "@/lib/createComposite";

export default function ImageCanvas({ image, entries, rotation = 0, canvasWidth = 1200, canvasHeight = 1000 }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!image) return;

    setLoading(true);
    let isMounted = true;

    const drawPreview = async () => {
      try {
        const canvas = await createCompositeImage(image, entries, rotation);
        if (!isMounted) return;

        const previewCanvas = canvasRef.current;
        const ctx = previewCanvas.getContext("2d");
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas, 0, 0);
      } catch (err) {
        console.error("미리보기 생성 오류:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    drawPreview();

    return () => { isMounted = false; };
  }, [image, entries, rotation]);

  return (
    <div style={{ marginTop: 10 }}>
      {loading && <div style={{ fontSize: 14, color: "#555" }}>미리보기 생성 중...</div>}
      <canvas ref={canvasRef} style={{ width: "100%", border: "2px solid #222", borderRadius: 8 }} />
    </div>
  );
}
