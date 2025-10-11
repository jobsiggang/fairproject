"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputForm from "./InputForm";
import ImageCanvas from "./ImageCanvas";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto } from "@/lib/googleDrive";

export default function ImageEditor({ author }) {
  const router = useRouter();
  const canvasWidth = 1200;
  const canvasHeight = 1000;

  const [siteData, setSiteData] = useState([]);
  const [entries, setEntries] = useState([
    { key: 1, field: "현장명", value: "" },
    { key: 2, field: "일자", value: new Date().toISOString().slice(0, 10) },
  ]);
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [images, setImages] = useState([]); // { file, url } 구조
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 시트 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      const sites = await fetchSheetData("현장목록");
      const forms = await fetchSheetData("입력양식");
      setSiteData(sites);
      setFormList(forms.map((f) => f["양식명"]));
    };
    fetchData();
  }, []);

  const handleLoadForm = async () => {
    if (!selectedForm) return;
    const allForms = await fetchSheetData("입력양식");
    const form = allForms.find((f) => f["양식명"] === selectedForm);
    if (!form) return;
    const fields = form["항목명"].split(",");
    const preserved = entries.filter((e) => e.field === "현장명" || e.field === "일자");
    const newEntries = [...preserved];
    fields.forEach((f) => {
      if (!["현장명", "일자"].includes(f) && !newEntries.some((e) => e.field === f)) {
        newEntries.push({ key: Date.now() + Math.random(), field: f, value: "" });
      }
    });
    setEntries(newEntries);
  };

  // 모바일 카메라로 사진 찍기
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages((prev) => [...prev, { file, url }]);
    setPreviewIndex(images.length);
  };

  // 필수 입력 확인
  const allRequiredFilled = () => entries.every((e) => e.value && e.value.trim() !== "");

  // 업로드 처리 (기존 로직 그대로)
  const handleUpload = async () => {
    if (!allRequiredFilled()) return alert("모든 입력 필드는 필수입니다.");
    if (!images.length) return alert("이미지를 선택하세요.");

    setUploading(true);
    setUploadProgress(0);

    const entryData = {};
    entries.forEach((e) => (entryData[e.field] = e.value));
    entryData["작성자"] = author;

    let progress = 0;
    const total = images.length;

    for (let i = 0; i < total; i++) {
      const { file } = images[i];
      const imgObj = new Image();

      try {
        await new Promise((resolve, reject) => {
          imgObj.onload = async () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;
              const ctx = canvas.getContext("2d");

              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

              // 테이블 합성
              const tableWidth = canvas.width / 3;
              const tableHeight = canvas.height / 3;
              const tableX = 0,
                tableY = canvas.height - tableHeight;

              ctx.fillStyle = "#fff";
              ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
              ctx.strokeStyle = "rgba(0,0,0,0.3)";
              ctx.lineWidth = 1;
              ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

              const rowHeight = tableHeight / entries.length;
              const col1Width = tableWidth * 0.4;
              ctx.font = "bold 25px 'Malgun Gothic'";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#000";

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

              const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
              const filename =
                Object.values(entryData).filter(Boolean).join("_") + "_" + file.name;

              const res = await uploadPhoto(base64, filename, entryData);
              if (!res.success) reject(new Error(res.error || "업로드 실패"));
              else resolve();
            } catch (err) {
              reject(err);
            }
          };
          imgObj.src = URL.createObjectURL(file);
        });

        progress = Math.round(((i + 1) / total) * 100);
        setUploadProgress(progress);
      } catch (err) {
        console.error("업로드 중 오류:", err);
        alert(`❌ 업로드 실패 (${file.name}): ${err.message}`);
        setUploading(false);
        setUploadProgress(progress);
        return;
      }
    }

    images.forEach((img) => URL.revokeObjectURL(img.url));
    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      alert("✅ 모든 이미지 업로드 완료!");
    }, 500);
  };

  // 이미지 삭제
  const handleDelete = (index) => {
    const imgToDelete = images[index];
    URL.revokeObjectURL(imgToDelete.url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewIndex >= index) setPreviewIndex(Math.max(previewIndex - 1, 0));
  };

  return (
    <div style={{ padding: 20, fontFamily: "돋움", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 22px)", color: "#000", margin: 0 }}>
          🏗️ 공정한 Works 💞 {author}
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("authorName");
            router.push("/");
          }}
          style={{ marginBottom: 6, padding: "4px 8px", fontSize: 12, borderRadius: 4, background: "#ddd", cursor: "pointer", border: "1px solid #ccc", fontWeight: "bold" }}
        >
          로그아웃
        </button>
      </div>

      {/* 양식 선택 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          style={{ flex: "1 1 200px", height: 34, padding: "2px 6px", fontSize: 14, borderRadius: 4, border: "2px solid #222", color: "#000", fontWeight: "bold", background: "#ffcc00" }}
        >
          <option value="">--입력 양식 선택--</option>
          {formList.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <button
          onClick={handleLoadForm}
          style={{ height: 34, padding: "2px 6px", cursor: "pointer", borderRadius: 4, fontWeight: "bold", border: "2px solid #222", background: "#ffcc00" }}
        >
          가져오기
        </button>
      </div>

      {/* 입력폼 */}
      <InputForm entries={entries} setEntries={setEntries} siteData={siteData} />

      {/* 모바일 사진 찍기 버튼 */}
      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          style={{ display: "none" }}
          id="cameraInput"
        />
        <button
          onClick={() => document.getElementById("cameraInput").click()}
          style={{ padding: "12px 24px", fontSize: 18, borderRadius: 8, background: "#ffcc00", border: "2px solid #222", fontWeight: "bold" }}
        >
          📸 사진 찍기
        </button>
      </div>

      {/* 섬네일 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={img.url}
              alt={`thumbnail-${i}`}
              onClick={() => setPreviewIndex(i)}
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                border: previewIndex === i ? "3px solid #007bff" : "2px solid #222",
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

      {/* 합성 이미지 미리보기 */}
      {images[previewIndex] && (
        <ImageCanvas
          image={images[previewIndex].file}
          entries={entries}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      )}

      {/* 업로드 버튼 */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          fontSize: 18,
          borderRadius: 8,
          background: uploading ? "#ccc" : "#ffcc00",
          border: "2px solid #222",
          fontWeight: "bold",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "전송 중..." : "업로드"}
      </button>

      {/* 진행률 바 */}
      {uploading && (
        <div style={{ width: "100%", background: "#ddd", borderRadius: 4, height: 20, marginTop: 10, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              width: `${uploadProgress}%`,
              height: "100%",
              background: "#007bff",
              transition: "width 0.3s ease",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 12,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {uploadProgress}%
          </span>
        </div>
      )}
    </div>
  );
}
