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

  // 초기 데이터 가져오기
  const fetchLatestData = async () => {
    const sites = await fetchSheetData("현장목록");
    const forms = await fetchSheetData("입력양식");
    setSiteData(sites);
    setFormList(forms.map((f) => f["양식명"]));
  };

  useEffect(() => { fetchLatestData(); }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    if (files.length > 0) setImages(files);
    setPreviewIndex(0);
  };

  // 양식 불러오기
  const handleLoadForm = async () => {
    if (!selectedForm) return;
    await fetchLatestData();
    const allForms = await fetchSheetData("입력양식");
    const form = allForms.find((f) => f["양식명"] === selectedForm);
    if (!form) return;

    const fields = form["항목명"].split(",");
    const newEntries = [...entries];
    fields.forEach((field) => {
      if (!newEntries.some((e) => e.field === field)) {
        newEntries.push({
          key: Date.now() + Math.random(),
          field,
          value: field === "일자" ? new Date().toISOString().slice(0, 10) : "",
        });
      }
    });
    setEntries(newEntries);
  };

  const allRequiredFilled = () =>
    entries.every((e) => e.value && e.value.trim() !== "");

  const drawImageWithTable = (ctx, img, entries) => {
    const canvas = canvasRef.current;
    const width = 600;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // 표 그리기
    const tableWidth = width / 3;
    const tableHeight = height / 3;
    const tableX = 0;
    const tableY = height - tableHeight;

    ctx.fillStyle = "#fff";
    ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
    ctx.strokeStyle = "#888";
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
      ctx.font = "bold 12px 돋움";
      ctx.textBaseline = "middle";
      ctx.fillText(entry.field, tableX + 4, y + rowHeight / 2);
      ctx.fillText(entry.value, tableX + col1Width + 4, y + rowHeight / 2);
    });

    ctx.beginPath();
    ctx.moveTo(tableX, tableY + tableHeight);
    ctx.lineTo(tableX + tableWidth, tableY + tableHeight);
    ctx.stroke();
  };

  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const file = images[previewIndex];

    img.onload = () => drawImageWithTable(ctx, img, entries);
    img.src = URL.createObjectURL(file);
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
            Object.values(entryData).filter(Boolean).join("_") + "_" + file.name;
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

  const handleDownloadAll = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const entryData = {};
    entries.forEach((e) => (entryData[e.field] = e.value));

    images.forEach((file) => {
      const img = new Image();
      img.onload = () => {
        drawImageWithTable(ctx, img, entries);
        const base64 = canvas.toDataURL("image/jpeg");
        const link = document.createElement("a");
        link.download =
          Object.values(entryData).filter(Boolean).join("_") + "_" + file.name;
        link.href = base64;
        link.click();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDelete = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewIndex >= index) setPreviewIndex(Math.max(previewIndex - 1, 0));
  };

  return (
    <div style={{ padding: 20, fontFamily: "돋움", backgroundColor: "#f0f0f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#222", margin: 0 }}>
          현장사진 편집 ({author})
        </h2>
        <button onClick={() => { localStorage.removeItem("authorName"); router.push("/"); }}
          style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "10px", backgroundColor: "#ecebf7ff", color: "#222", border: "none", cursor: "pointer" }}>
          로그아웃
        </button>
      </div>

      {/* 양식 선택 + 불러오기 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <select value={selectedForm} onChange={(e) => setSelectedForm(e.target.value)}
          style={{ flex: 2, padding: 6, fontSize: 13, borderRadius: 6, border: "1px solid #ccc", marginRight: 4, color: "#000", fontWeight: "bold" }}>
          <option value="">양식 선택</option>
          {formList.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={handleLoadForm}
          style={{ flex: 1, height: 32, fontSize: 13, borderRadius: 6, cursor: "pointer", border: "1px solid #ccc", background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)", color: "#4b2ca8ff", fontWeight: "bold" }}>
          양식 가져오기
        </button>
      </div>

      <InputForm entries={entries} setEntries={setEntries} siteData={siteData} />

      {/* 섬네일 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={URL.createObjectURL(img)}
              alt={`thumbnail-${i}`}
              onClick={() => setPreviewIndex(i)}
              style={{ width: 80, height: 80, objectFit: "cover", border: previewIndex === i ? "3px solid #007bff" : "1px solid #ccc", borderRadius: 8, cursor: "pointer" }}
            />
            <button onClick={() => handleDelete(i)}
              style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#ff4d4f", color: "#fff", border: "none", fontSize: 12, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </div>

      {/* 버튼 한줄: 파일 선택, 업로드, 휴대폰 저장 */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 10, gap: 8 }}>
        <input type="file" accept="image/*" multiple onChange={handleImageChange}
          style={{ flex: 1, height: 32, fontSize: 13, borderRadius: 6, border: "1px solid #ccc", background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)", color: "#4b2ca8ff", fontWeight: "bold", cursor: "pointer", padding: 0 }} />
        <button onClick={handleUpload} disabled={uploading}
          style={{ flex: 1, height: 32, fontSize: 13, borderRadius: 6, cursor: "pointer", border: "1px solid #ccc", background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)", color: "#4b2ca8ff", fontWeight: "bold" }}>
          {uploading ? "전송 중..." : "업로드"}
        </button>
        <button onClick={handleDownloadAll}
          style={{ flex: 1, height: 32, fontSize: 13, borderRadius: 6, cursor: "pointer", border: "1px solid #ccc", background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)", color: "#4b2ca8ff", fontWeight: "bold" }}>
          휴대폰 저장
        </button>
      </div>

      {/* 대표 이미지 */}
      <canvas ref={canvasRef} width={600} height={500}
        style={{ border: "1px solid #ccc", marginTop: 10, width: 600, height: 500, borderRadius: 10, boxShadow: "2px 2px 8px rgba(0,0,0,0.2)" }} />
    </div>
  );
}
