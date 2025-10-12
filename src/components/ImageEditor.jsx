"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputForm from "./InputForm";
import ImageCanvas from "./ImageCanvas";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto } from "@/lib/googleDrive";
import toast from "react-hot-toast";
import { createCompositeImage } from "@/lib/createComposite";

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
  const [images, setImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 🎨 공통 버튼 스타일
  const buttonStyle = {
    color: "#000",
    height: 36,
    padding: "4px 10px",
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: "bold",
    border: "2px solid #222",
    background: "#ffcc00",
    transition: "0.2s",
  };

  // 📋 시트 데이터 로드
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

  // 📸 파일 선택/촬영 공통 함수
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      alert(`한 번에 최대 10장까지 선택 가능합니다. 현재 ${images.length}장 선택됨`);
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setPreviewIndex(images.length);
  };

  const allRequiredFilled = () => entries.every((e) => e.value && e.value.trim() !== "");

  
  
  // 🚀 업로드
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
      try {
        const canvas = await createCompositeImage(file, entries);
        const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
        const filename = Object.values(entryData).filter(Boolean).join("_") + "_" + file.name;

        const res = await uploadPhoto(base64, filename, entryData);
        if (!res.success) throw new Error(res.error || "업로드 실패");

        progress = Math.round(((i + 1) / total) * 100);
        setUploadProgress(progress);
      } catch (err) {
        alert(`❌ 업로드 실패: ${err.message}`);
        setUploading(false);
        return;
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      toast.success("✅ 모든 이미지 업로드 완료!");
    }, 500);
  };

  // 💾 저장 (여러 장 순차 저장 + confirm)
  const handleSaveComposite = async () => {
    if (!allRequiredFilled()) return alert("모든 입력 필드는 필수입니다.");
    if (!images.length) return alert("이미지를 선택하세요.");

    const confirmSave = confirm("📸 선택한 모든 이미지를 합성하여 저장할까요?");
    if (!confirmSave) return;

    setSaving(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const canvas = await createCompositeImage(images[i].file, entries);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = `합성_${Date.now()}_${i + 1}.jpg`;
        link.click();
        await new Promise((r) => setTimeout(r, 300)); // 지연
      }
      toast.success("✅ 모든 합성 이미지가 저장되었습니다!");
    } catch (err) {
      console.error("합성 이미지 저장 오류:", err);
      alert("❌ 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (index) => {
    const imgToDelete = images[index];
    URL.revokeObjectURL(imgToDelete.url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewIndex >= index) setPreviewIndex(Math.max(previewIndex - 1, 0));
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#f7f7f7", minHeight: "100vh", fontFamily: "돋움" }}>
      {/* 제목 + 사용자 + 로그아웃 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>🏗️ 공정한 Works 💞 {author}</h2>
        <button
          onClick={() => {
            localStorage.removeItem("authorName");
            router.push("/");
          }}
          style={{ ...buttonStyle, background: "#ddd" }}
        >
          로그아웃
        </button>
      </div>

      {/* 양식 선택 + 가져오기 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          style={{ flex: "1 1 200px", height: 36, borderRadius: 6, border: "2px solid #222", background: "#ffcc00", fontWeight: "bold" }}
        >
          <option value="">--입력 양식 선택--</option>
          {formList.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button onClick={handleLoadForm} style={buttonStyle}>양식 가져오기</button>
      </div>

      {/* 입력 폼 */}
      <InputForm entries={entries} setEntries={setEntries} siteData={siteData} />

        {/* 진행률 바 */}
        {uploading && (
          <div style={{ width: "100%", background: "#ddd", height: 20, marginTop: 10, borderRadius: 4 }}>
            <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#007bff", transition: "width 0.3s" }} />
          </div>
        )}
      {/* 📸 사진 버튼 */}
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input id="cameraInput" type="file" accept="image/*" capture="environment" multiple onChange={handleFileSelect} style={{ display: "none" }} />
        <button disabled={uploading || saving} onClick={() => document.getElementById("cameraInput").click()} style={buttonStyle}>📸 사진 찍기</button>

        <input id="galleryInput" type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />
        <button disabled={uploading || saving} onClick={() => document.getElementById("galleryInput").click()} style={buttonStyle}>🖼️ 사진 선택</button>

        <button disabled={uploading || saving} onClick={handleUpload} style={buttonStyle}>
          {uploading ? "전송 중..." : "🚀 사진 전송"}
        </button>

        <button disabled={uploading || saving} onClick={handleSaveComposite} style={buttonStyle}>
          {saving ? "저장 중..." : "💾 휴대폰 저장"}
        </button>
      </div>

      {/* 섬네일 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={img.url}
              alt={`thumb-${i}`}
              onClick={() => setPreviewIndex(i)}
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                border: previewIndex === i ? "3px solid #007bff" : "2px solid #222",
                borderRadius: 6,
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => handleDelete(i)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "#ff4d4f",
                border: "none",
                color: "#fff",
                width: 20,
                height: 20,
                borderRadius: "50%",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 미리보기 */}
      {images[previewIndex] && (
        <ImageCanvas image={images[previewIndex].file} entries={entries} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
      )}

    </div>
  );
}
