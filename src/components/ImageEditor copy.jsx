"use client";
import { useState, useEffect, useRef } from "react";
import InputForm from "./InputForm";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto } from "@/lib/googleDrive";

export default function ImageEditor({ author }) {
  const [siteData, setSiteData] = useState([]);
  const [entries, setEntries] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lastEntries");
      return saved
        ? JSON.parse(saved)
        : [
            { key: 1, field: "현장명", value: "" },
            { key: 2, field: "공종명", value: "" },
            { key: 3, field: "일자", value: "" },
          ];
    }
    return [
      { key: 1, field: "현장명", value: "" },
      { key: 2, field: "공종명", value: "" },
      { key: 3, field: "일자", value: "" },
    ];
  });

  const [imageFile, setImageFile] = useState(null);
  const canvasRef = useRef(null);

  // 🔹 시트 데이터 불러오기
  useEffect(() => {
    fetchSheetData().then((data) => setSiteData(data));
  }, []);

  // 🔹 최근 입력 저장
  useEffect(() => {
    localStorage.setItem("lastEntries", JSON.stringify(entries));
  }, [entries]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // 🔹 캔버스 그리기
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!imageFile) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 테이블
      const tableWidth = canvas.width / 3;
      const tableHeight = canvas.height / 3;
      const tableX = 0;
      const tableY = canvas.height - tableHeight;

      ctx.fillStyle = "#fff";
      ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

      const rowHeight = tableHeight / entries.length;

      // 행 그리기
      entries.forEach((entry, i) => {
        const y = tableY + i * rowHeight;

        // 가로선
        ctx.beginPath();
        ctx.moveTo(tableX, y);
        ctx.lineTo(tableX + tableWidth, y);
        ctx.stroke();

        // 세로선 (2열)
        ctx.beginPath();
        ctx.moveTo(tableX + tableWidth * 0.3, y);
        ctx.lineTo(tableX + tableWidth * 0.3, y + rowHeight);
        ctx.stroke();

        // 텍스트
        ctx.fillStyle = "#000";
        ctx.font = "16px 돋움";
        ctx.fillText(entry.field, tableX + 5, y + rowHeight * 0.7);
        ctx.fillText(entry.value, tableX + tableWidth * 0.3 + 5, y + rowHeight * 0.7);
      });

      // 마지막 가로선
      ctx.beginPath();
      ctx.moveTo(tableX, tableY + tableHeight);
      ctx.lineTo(tableX + tableWidth, tableY + tableHeight);
      ctx.stroke();
    };
    img.src = URL.createObjectURL(imageFile);
  }, [entries, imageFile]);

  // 🔹 업로드 처리
  const handleUpload = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];

    // filename: value가 있는 항목만 순서대로 연결
    const validValues = entries.map((e) => e.value).filter((v) => v && v.trim() !== "");
    const filename = validValues.join("_") + ".jpg";

    const date = entries.find((e) => e.field === "일자")?.value || "";
    const siteName = entries.find((e) => e.field === "현장명")?.value || "";

    const res = await uploadPhoto(base64, filename, date, siteName, author);
    alert(res.success ? `✅ 업로드 성공!\n${res.fileUrl}` : `❌ 업로드 실패: ${res.error}`);
  };

  // 🔹 버튼 스타일
  const buttonStyle = {
    background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "25px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    marginRight: 10,
  };

  return (
    <div style={{ padding: 20, fontFamily: "돋움", backgroundColor: "#f0f0f0" }}>
      <h2>현장사진 편집 ({author})</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ ...buttonStyle, display: "block", marginBottom: 10 }}
      />

      <InputForm entries={entries} setEntries={setEntries} siteData={siteData} author={author} />

      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        style={{ border: "1px solid #ccc", marginBottom: 10 }}
      />

      <button onClick={handleUpload} style={buttonStyle}>
        업로드
      </button>
    </div>
  );
}
