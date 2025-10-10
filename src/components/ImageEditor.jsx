"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // ← 추가
import InputForm from "./InputForm";
import { fetchSheetData } from "@/lib/googleSheet";
import { uploadPhoto } from "@/lib/googleDrive";

export default function ImageEditor({ author }) {
  const router = useRouter(); // ← 추가
  const [siteData, setSiteData] = useState([]);
  const [entries, setEntries] = useState([
    { key: 1, field: "현장명", value: "" },
    { key: 2, 
    field: "일자", 
    value: new Date().toISOString().slice(0,10)},

  ]);
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);

  // 시트 불러오기
  useEffect(() => { fetchSheetData("현장목록").then(setSiteData); }, []);
  useEffect(() => { fetchSheetData("입력양식").then(data => setFormList(data.map(f=>f["양식명"]))); }, []);

  const handleImageChange = (e) => { if(e.target.files[0]) setImageFile(e.target.files[0]); };

  const handleLoadForm = async () => {
    if (!selectedForm) return;
    const allForms = await fetchSheetData("입력양식");
    const form = allForms.find(f => f["양식명"] === selectedForm);
    if (!form) return;
    const fields = form["항목명"].split(",");
    const newEntries = [...entries];
fields.forEach(field => {
  if (!newEntries.some(e => e.field === field)) {
    newEntries.push({
      key: Date.now() + Math.random(),
      field,
      value: field === "일자" ? new Date().toISOString().slice(0,10) : ""
    });
  }
});
    setEntries(newEntries);
  };

  const allRequiredFilled = () => entries.every(e => e.value && e.value.trim()!=="");

 useEffect(() => {
  if (!canvasRef.current || !imageFile) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 🔹 표 위치 및 크기 (이미지 전체 9등분, 왼쪽 아래 한 칸)
    const padding = 0; // 이미지 가장자리에서 여백
    const tableWidth = canvas.width / 3 - padding * 2;
    const tableHeight = canvas.height / 3 - padding * 2;
    const tableX = padding;
    const tableY = canvas.height - canvas.height / 3 + padding;

    // 🔹 표 배경
    ctx.fillStyle = "#fff";
    ctx.fillRect(tableX, tableY, tableWidth, tableHeight);

    // 🔹 표 테두리
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

    const rowHeight = tableHeight / entries.length;
    const col1Width = tableWidth * 0.4; // 1열 폭 넓힘
    const col2Width = tableWidth - col1Width;

    entries.forEach((entry, i) => {
      const y = tableY + i * rowHeight;

      // 🔹 가로선
      ctx.beginPath();
      ctx.moveTo(tableX, y);
      ctx.lineTo(tableX + tableWidth, y);
      ctx.stroke();

      // 🔹 세로선
      ctx.beginPath();
      ctx.moveTo(tableX + col1Width, y);
      ctx.lineTo(tableX + col1Width, y + rowHeight);
      ctx.stroke();

      // 🔹 글자
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px 돋움";
      ctx.textBaseline = "middle";
      ctx.fillText(entry.field, tableX + 4, y + rowHeight / 2); // 글자 좌측 여백
      ctx.fillText(entry.value, tableX + col1Width + 4, y + rowHeight / 2);
    });

    // 마지막 가로선
    ctx.beginPath();
    ctx.moveTo(tableX, tableY + tableHeight);
    ctx.lineTo(tableX + tableWidth, tableY + tableHeight);
    ctx.stroke();
  };

  img.src = URL.createObjectURL(imageFile);
}, [entries, imageFile]);

  const handleUpload = async () => {
  if (!allRequiredFilled()) { alert("모든 입력 필드는 필수입니다."); return; }
  if (!canvasRef.current) { alert("캔버스가 없습니다."); return; }
  setUploading(true);

  const canvas = canvasRef.current;
  const base64 = canvas.toDataURL("image/jpeg").split(",")[1];

  // 🔹 엔트리 데이터를 JSON 형태로 준비
  const entryData = {};
  entries.forEach(e => { entryData[e.field] = e.value; });

  // 🔹 작성자 정보 추가
  
  // 🔹 파일 이름: 현장명 + 작성자 + 위치 등
  const filename = Object.values(entryData).filter(Boolean).join("_") + ".jpg";
  
  entryData["작성자"] = author;
  try {
    // 이미지 업로드 + 엔트리 데이터를 함께 전달
    // Apps Script에서 entryData를 파싱하여 시트 업데이트
    const res = await uploadPhoto(base64, filename, entryData);

    if (res.success) {
      alert("업로드 및 시트 저장 성공!");
    } else {
      alert("업로드 실패: " + res.error);
    }
  } catch (err) {
    alert("업로드 오류: " + err.message);
  }

  setUploading(false);
};


  const buttonStyle = {
    background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)",
    color:"#333", border:"1px solid #ccc", borderRadius:"10px",
    padding:"8px 12px", cursor:"pointer", fontSize:14,
    boxShadow:"2px 2px 5px rgba(0,0,0,0.2)", marginRight:10, marginBottom:10
  };

  const smallButtonStyle = { ...buttonStyle, padding:"6px 12px", fontSize:12, borderRadius:6 };

  return (
    <div style={{padding:20,fontFamily:"돋움",backgroundColor:"#f0f0f0"}}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
  <h2 style={{ fontSize: "clamp(20px, 5vw, 28px)", color: "#222", margin: 0 }}>
    현장사진 편집 ({author})
  </h2>
  <button
    onClick={() => {
      localStorage.removeItem("authorName");
      router.push("/");
    }}
    style={{
      padding: "6px 12px",
      fontSize: "12px",
      borderRadius: "10px",
      backgroundColor: "#ecebf7ff",
      color: "#222", // 버튼 글자도 짙은색
      border: "none",
      cursor: "pointer",
      boxShadow: "1px 1px 4px rgba(0,0,0,0.3)"
    }}
  >
    로그아웃
  </button>
</div>


      {/* 양식 불러오기 + 항목 추가 */}
      <div style={{display:"flex",alignItems:"center", marginBottom:10}}>
        <select value={selectedForm} onChange={e=>setSelectedForm(e.target.value)}
          style={{flex:1,padding:8,fontSize:16,borderRadius:6,border:"1px solid #ccc", marginRight:4}}>
          <option value="">양식 선택</option>
          {formList.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={handleLoadForm} style={smallButtonStyle}>불러오기</button>
      </div>

      {/* 입력폼 */}
      <InputForm entries={entries} setEntries={setEntries} siteData={siteData}/>

        <div style={{display:"flex",alignItems:"center", marginBottom:10}}>
      {/* 사진선택 */}
      <input type="file" accept="image/*" onChange={handleImageChange} style={{...buttonStyle, display:"block"}}/>

      {/* 업로드 버튼 */}
      <button onClick={handleUpload} disabled={uploading} style={{...buttonStyle, opacity:uploading?0.5:1}}>
        {uploading ? "전송 중..." : "업로드"}
      </button>
        </div>

      {/* 미리보기 */}
      <canvas ref={canvasRef} width={600} height={500} style={{border:"1px solid #ccc",marginTop:10, width:"100%"}}/>
    </div>
  );
}
