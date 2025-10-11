"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import InputForm from "./InputForm";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto } from "@/lib/googleDrive";

export default function ImageEditor({ author }) {
  const router = useRouter();
  const [siteData, setSiteData] = useState([]);
  const [entries, setEntries] = useState([
    { key: 1, field: "현장명", value: "" },
    { key: 2, field: "일자", value: new Date().toISOString().slice(0, 10) },
  ]);
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [images, setImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      const sites = await fetchSheetData("현장목록");
      const forms = await fetchSheetData("입력양식");
      setSiteData(sites);
      setFormList(forms.map((f) => f["양식명"]));
    };
    fetchData();
  }, []);

  // 반응형 캔버스 비율 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight / 2;
      let width = maxWidth;
      let height = (500 / 600) * width; // 600x500 비율 유지
      if (height > maxHeight) {
        height = maxHeight;
        width = (600 / 500) * height;
      }
      setCanvasSize({ width, height });
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    if (files.length > 0) setImages(files);
    setPreviewIndex(0);
  };

  const handleLoadForm = async () => {
  if (!selectedForm) return;

  const allForms = await fetchSheetData("입력양식");
  const form = allForms.find((f) => f["양식명"] === selectedForm);
  if (!form) return;

  const fields = form["항목명"].split(",");

  // 현장명과 일자만 유지
  const preservedEntries = entries.filter(
    (e) => e.field === "현장명" || e.field === "일자"
  );

  // 새 양식 항목 추가 (중복 제거)
  const newEntries = [...preservedEntries];
  fields.forEach((field) => {
    if (field !== "현장명" && field !== "일자") {
      if (!newEntries.some((e) => e.field === field)) {
        newEntries.push({
          key: Date.now() + Math.random(),
          field,
          value: "",
        });
      }
    }
  });

  setEntries(newEntries);
};

  const allRequiredFilled = () =>
    entries.every((e) => e.value && e.value.trim() !== "");

  const drawImageWithTable = (ctx, img, entries) => {
    const canvas = canvasRef.current;
    const width = canvasSize.width;
    const height = canvasSize.height;
    canvas.width = width;
    canvas.height = height;
    const drawWidth = width;
    const drawHeight = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

    const tableWidth = width / 3;
    const tableHeight = height / 3;
    const tableX = 0;
    const tableY = height - tableHeight;
    ctx.fillStyle = "#fff";
    ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

    const rowHeight = tableHeight / entries.length;
    const col1Width = tableWidth * 0.4;
    const col2Width = tableWidth - col1Width;
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
      ctx.font = "bold 11px 돋움";
      ctx.textBaseline = "middle";
      const displayValue =
        entry.field === "일자" ? entry.value.replace(/-/g, ".") : entry.value;
      ctx.fillText(entry.field, tableX + 2, y + rowHeight / 2);
      ctx.fillText(displayValue, tableX + col1Width + 2, y + rowHeight / 2);
    });
    ctx.beginPath();
    ctx.moveTo(tableX, tableY + tableHeight);
    ctx.lineTo(tableX + tableWidth, tableY + tableHeight);
    ctx.stroke();
  };

  // 이미지 및 데이터 변경 시 캔버스 갱신
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.onload = () => drawImageWithTable(ctx, img, entries);
    img.src = URL.createObjectURL(images[previewIndex]);
  }, [previewIndex, entries, images]);

  const handleUpload = async () => {
    if (!allRequiredFilled()) return alert("모든 입력 필드는 필수입니다.");
    if (images.length === 0) return alert("이미지를 선택하세요.");
    setUploading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const entryData = {};
    entries.forEach((e) => (entryData[e.field] = e.value));
    entryData["작성자"] = author;
    for (const file of images) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = async () => {
          drawImageWithTable(ctx, img, entries);
          const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
          const filename =
            Object.values(entryData).filter(Boolean).join("_") +
            "_" +
            file.name;
          const res = await uploadPhoto(base64, filename, entryData);
          if (!res.success) alert("업로드 실패: " + res.error);
          resolve();
        };
        img.src = URL.createObjectURL(file);
      });
    }
    setUploading(false);
    alert("모든 이미지 업로드 완료!");
  };

  const handleDelete = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewIndex >= index) setPreviewIndex(Math.max(previewIndex - 1, 0));
  };

  // 버튼 스타일
  const baseButton = {
    flex: 1,
    height: 36,
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: "bold",
    border: "2px solid #222",
    transition: "all 0.1s ease-in-out",
    transform: "translateY(0px)",
  };

  const yellowButton = {
    ...baseButton,
    background: "#ffcc00",
    color: "#000",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
  };

  const grayButton = {
    marginBottom: 6,
    padding: "2px 6px",
    fontSize: 12,
    borderRadius: 4,
    background: "#ddd",
    cursor: "pointer",
    border: "1px solid #ccc",
    fontWeight: "bold",
    alignSelf: "flex-start",
  };

  const handleButtonActive = (e) => {
    e.currentTarget.style.background = "#df1f4fff";
    e.currentTarget.style.transform = "scale(0.80)";
    // e.currentTarget.style.transform = "translateY(2px)";
    e.currentTarget.style.boxShadow =
      "inset 2px 2px 5px rgba(0,0,0,0.3)";
  };

  const handleButtonInactive = (e) => {
    e.currentTarget.style.background = "#ffcc00";
    e.currentTarget.style.transform = "scale(1)";
    // e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "2px 2px 5px rgba(0,0,0,0.2)";
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "돋움",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 5vw, 20px)",
            color: "#000",
            margin: 0,
          }}
        >
         🏗️ 공정한 Works 💞 {author}
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("authorName");
            router.push("/");
          }}
          style={grayButton}
          onMouseDown={handleButtonActive}
          onMouseUp={handleButtonInactive}
          onMouseLeave={handleButtonInactive}
        >
          로그아웃
        </button>
      </div>

      {/* 양식 선택 + 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 10,
          gap: 6,
        }}
      >
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          style={{
            flex: 1,
            height: 36,
            padding: 8,
            fontSize: 14,
            borderRadius: 6,
            border: "2px solid #222",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          <option value="">양식 선택</option>
          {formList.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button
          onClick={handleLoadForm}
          style={yellowButton}
          onMouseDown={handleButtonActive}
          onMouseUp={handleButtonInactive}
          onMouseLeave={handleButtonInactive}
        >
          양식 가져오기
        </button>
      </div>

      {/* 입력 양식 */}
      <InputForm
        entries={entries}
        setEntries={setEntries}
        siteData={siteData}
      />

      {/* 이미지 미리보기 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 10,
        }}
      >
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={URL.createObjectURL(img)}
              alt={`thumbnail-${i}`}
              onClick={() => setPreviewIndex(i)}
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                border:
                  previewIndex === i
                    ? "3px solid #007bff"
                    : "2px solid #222",
                borderRadius: 8,
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => handleDelete(i)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#ff4d4f",
                color: "#fff",
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 파일 선택 + 업로드 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 10,
          gap: 6,
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{
            flex: 1,
            height: 36,
            fontSize: 14,
            borderRadius: 6,
            border: "2px solid #222",
            background: "#ffcc00",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={yellowButton}
          onMouseDown={handleButtonActive}
          onMouseUp={handleButtonInactive}
          onMouseLeave={handleButtonInactive}
        >
          {uploading ? "전송 중..." : "업로드"}
        </button>
      </div>

      {/* 미리보기 캔버스 */}
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          border: "2px solid #222",
          marginTop: 10,
          borderRadius: 10,
          boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
