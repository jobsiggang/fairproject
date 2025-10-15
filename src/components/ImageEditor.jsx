"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import InputForm from "./InputForm";
import ImageCanvas from "./ImageCanvas";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto, uploadPhotosBatch } from "@/lib/googleDrive";
import toast from "react-hot-toast";
import { createCompositeImage } from "@/lib/createComposite";
import { canvasConfig } from "@/lib/compositeConfig";

export default function ImageEditor({ author }) {
  const router = useRouter();
  const canvasWidth = canvasConfig.width;
  const canvasHeight = canvasConfig.height;

  const [siteData, setSiteData] = useState([]);
  const [entries, setEntries] = useState([]);
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [images, setImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const kstTimeoutRef = useRef(null);
  const kstIntervalRef = useRef(null);

  // 🎨 공통 버튼 스타일
  const buttonStyle = {
    color: "#000",
    height: 30,
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: "bold",
    background: "#ffcc00",
    transition: "0.2s",
    flex: "1 1 auto",
    fontSize: 14,
    margin: 2,
  };

  const saveButtonStyle = {
    ...buttonStyle,
    background: "#00cc88",
    color: "#fff",
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

  // 📅 작성자 로컬스토리지 일주일 삭제
  useEffect(() => {
    const lastClear = localStorage.getItem("lastAuthorClear");
    const now = Date.now();
    if (!lastClear || now - Number(lastClear) > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem("authorName");
      localStorage.setItem("lastAuthorClear", now.toString());
    }
  }, []);

  // 한국시간(KST) 자정 자동 로그아웃
  useEffect(() => {
    const doLogout = () => {
      try {
        localStorage.removeItem("authorName");
      } catch (e) {}
      toast.success("자동 로그아웃: 한국시간 자정이 되어 로그아웃됩니다.");
      router.push("/");
    };

    const now = new Date();
    const nowUtcMs = now.getTime();
    const nextKstMidUtc = new Date();
    nextKstMidUtc.setUTCHours(15, 0, 0, 0);
    if (nextKstMidUtc.getTime() <= nowUtcMs) {
      nextKstMidUtc.setUTCDate(nextKstMidUtc.getUTCDate() + 1);
    }
    const delay = nextKstMidUtc.getTime() - nowUtcMs;

    kstTimeoutRef.current = setTimeout(() => {
      doLogout();
      // 이후 매일 실행
      kstIntervalRef.current = setInterval(doLogout, 24 * 60 * 60 * 1000);
    }, delay);

    return () => {
      if (kstTimeoutRef.current) clearTimeout(kstTimeoutRef.current);
      if (kstIntervalRef.current) clearInterval(kstIntervalRef.current);
    };
  }, []);

  const handleLoadForm = async () => {
    if (!selectedForm) return;
    const allForms = await fetchSheetData("입력양식");
    const form = allForms.find((f) => f["양식명"] === selectedForm);
    if (!form) return;
    const fields = form["항목명"].split(",");

    const now = new Date();
    const kstOffset = 9 * 60;
    const localOffset = now.getTimezoneOffset();
    const kstTime = new Date(now.getTime() + (kstOffset + localOffset) * 60000);
    const yyyy = kstTime.getFullYear();
    const mm = String(kstTime.getMonth() + 1).padStart(2, "0");
    const dd = String(kstTime.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const newEntries = fields.map((f) => ({
      key: Date.now() + Math.random(),
      field: f,
      value: f === "일자" ? todayStr : "",
    }));

    setEntries(newEntries);
  };

  // 📸 이미지 선택/촬영
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      toast.error(`한 번에 최대 10장까지 선택 가능합니다. 현재 ${images.length}장 선택됨`);
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      rotation: 0,
    }));

    // set preview index based on previous length to avoid stale state
    setImages((prev) => {
      const startIndex = prev.length;
      setPreviewIndex(startIndex);
      return [...prev, ...newImages];
    });
  };

  const allRequiredFilled = () => {
    if (!entries || entries.length === 0) {
      toast.error("❌ 항목이 없습니다. 양식을 불러오거나 항목을 추가하세요.");
      return false;
    }

    for (const e of entries) {
      const v = e.value;
      if (v === undefined || v === null || String(v).trim() === "") {
        toast.error("❌ 모든 항목을 입력해주세요.");
        return false;
      }
    }

    return true;
  };

  // 이미지 삭제
  const handleDelete = (index) => {
    const imgToDelete = images[index];
    URL.revokeObjectURL(imgToDelete.url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewIndex >= index) setPreviewIndex(Math.max(previewIndex - 1, 0));
  };

  // 이미지 회전
  const handleRotate = (index) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
  };

  // 🚀 업로드 — 사용자 체크 제거, 최적화 유지 (병렬 합성 + 다운스케일 + 배치 업로드)
  const handleUpload = async () => {
    if (!allRequiredFilled()) return;
    if (!images.length) return toast.error("❌ 이미지를 선택하세요.");

    setUploading(true);
    setUploadProgress(0);

    const entryData = {};
    entries.forEach((e) => (entryData[e.field] = e.value));
    entryData["작성자"] = author;

    // 이미지 합성 후 최소화된 base64 객체 만들기
    const processImage = async (file, rotation) => {
      const canvas = await createCompositeImage(file, entries, rotation);

      // 다운스케일(선택): 최대 길이 제한 (예: 1600px)
      const MAX_DIM = 1600;
      let outCanvas = canvas;
      if (canvas.width > MAX_DIM || canvas.height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / canvas.width, MAX_DIM / canvas.height);
        const tmp = document.createElement("canvas");
        tmp.width = Math.round(canvas.width * ratio);
        tmp.height = Math.round(canvas.height * ratio);
        tmp.getContext("2d").drawImage(canvas, 0, 0, tmp.width, tmp.height);
        outCanvas = tmp;
      }

      // 압축: JPEG 품질을 0.75 권장
      const base64 = outCanvas.toDataURL("image/jpeg", 0.75).split(",")[1];
      const filename = Object.values(entryData).filter(Boolean).join("_") + "_" + file.name;
      return { base64, filename, entryData };
    };

    // 동시성 제한자로 합성/압축을 병렬 수행 (메인 스레드 부담 고려)
    const concurrency = 2;
    const queue = images.map((img) => ({ file: img.file, rotation: img.rotation }));
    const processed = new Array(queue.length);
    let idx = 0;

    const worker = async () => {
      while (true) {
        const i = idx++;
        if (i >= queue.length) return;
        const it = queue[i];
        processed[i] = await processImage(it.file, it.rotation);
        setUploadProgress(Math.round(((i + 1) / queue.length) * 100));
      }
    };

    try {
      await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));

      // 서버로 한 번에 배치 전송 (서버가 배열을 지원함: src/app/api/uploadPhoto/route.js)
      const res = await uploadPhotosBatch(processed);
      if (!res.success) throw new Error(res.error || "업로드 실패");

      setUploadProgress(100);
      // UI 업데이트 시간 확보
      await new Promise((r) => setTimeout(r, 300));
      setUploading(false);

      const saveConfirm = confirm("✅ 업로드 완료!\n보드 사진을 휴대폰에 저장하시겠습니까?");
      if (saveConfirm) handleSaveComposite();
      setImages([]); // 업로드 후 초기화
      toast.success("✅ 모든 이미지 업로드 완료!");
    } catch (err) {
      toast.error(`❌ 업로드 실패: ${err?.message || err}`);
      setUploading(false);
      return;
    }
  };

  // 💾 휴대폰 저장 (회전값 적용)
  const handleSaveComposite = async () => {
    if (!allRequiredFilled()) return;
    if (!images.length) return toast.error("❌ 이미지를 선택하세요.");

    setSaving(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const { file, rotation } = images[i];
        const canvas = await createCompositeImage(file, entries, rotation);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = `합성_${Date.now()}_${i + 1}.jpg`;
        link.click();
        await new Promise((r) => setTimeout(r, 200));
      }
      toast.success("✅ 합성 이미지가 저장되었습니다!");
    } catch (err) {
      console.error(err);
      toast.error("❌ 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16, backgroundColor: "#f0f0f0", minHeight: "100vh", fontFamily: "돋움", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "90%", maxWidth: 900 }}>
        {/* 제목 + 로그아웃 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 20, margin: 0,fontWeight:"bold",color:"#007bff" }}>🏗️ 공정한 Works 💞 {author}</h2>
          <button
            onClick={() => {
              localStorage.removeItem("authorName");
              router.push("/");
            }}
            style={{ background: "#ddd", color: "#000" }}
          >
            로그아웃
          </button>
        </div>

        {/* 양식 선택 + 가져오기 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            style={{
              color: "#000",
              flex: "1 1 200px",
              height: 32,
              borderRadius: 8,
              background: "#ffcc00",
              fontWeight: "bold",
              fontSize: 13, // 글자 크기 조정
            }}
          >
            <option value="">--입력 양식 선택--</option>
            {formList.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button onClick={handleLoadForm} style={buttonStyle}>
            가져오기
          </button>
        </div>

        {/* 입력 폼 */}
        <InputForm entries={entries} setEntries={setEntries} siteData={siteData} />

        {/* 진행률 바 */}
        {uploading && (
          <div style={{ width: "100%", background: "#ddd", height: 20, marginTop: 10, borderRadius: 4, position: "relative" }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                background: "#007bff",
                transition: "width 0.3s",
                borderRadius: 4,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: "bold",
                color: "#fff",
                fontSize: 12,
              }}
            >
              {uploadProgress}%
            </span>
          </div>
        )}

        {/* 📸 사진 버튼 */}
        <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input id="cameraInput" type="file" accept="image/*" capture="environment" multiple onChange={handleFileSelect} style={{ display: "none" }} />
          <button disabled={uploading || saving} onClick={() => document.getElementById("cameraInput").click()} style={buttonStyle}>📸 사진 찍기</button>

          <input id="galleryInput" type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />
          <button disabled={uploading || saving} onClick={() => document.getElementById("galleryInput").click()} style={buttonStyle}>🖼️ 사진 선택</button>

          <button disabled={uploading || saving} onClick={handleUpload} style={buttonStyle}>{uploading ? "전송 중..." : "🚀 사진 전송"}</button>
        </div>

        {/* 썸네일 + 미리보기 */}
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
                  top: -4,
                  right: -4,
                  background: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* 미리보기 + 회전 버튼 */}
        {images[previewIndex] && (
          <div style={{ position: "relative", marginTop: 10 }}>
            <ImageCanvas
              image={images[previewIndex].file}
              rotation={images[previewIndex].rotation}
              entries={entries}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
            <button
              onClick={() => handleRotate(previewIndex)}
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: 4,
                fontWeight: "bold",
                cursor: "pointer",
                background: "#007bff",
                color: "#fff",
                border: "none",
              }}
            >↻</button>
          </div>
        )}
      </div>
    </div>
  );
}
