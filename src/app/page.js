"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const buttonStyle = {
    background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)", // 밝은 메탈 느낌
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "25px", // 타원형
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 600,
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    transition: "0.2s",
  };

  const containerStyle = {
    padding: "20px",
    fontFamily: "돋움",
    maxWidth: "600px",
    margin: "20px auto",
    backgroundColor: "#f0f0f0",
    borderRadius: "12px",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
  };

  const textStyle = {
    fontSize: "16px",
    lineHeight: "1.5",
    marginTop: "10px",
    color: "#333",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>현장 사진 관리 시스템</h1>
      <p style={textStyle}>
        이 시스템은 현장 사진 업로드와 기록 관리를 위해 사용됩니다.
        <br />
        먼저 로그인 후, 사진 업로드 및 편집 페이지로 이동하세요.
      </p>
      <button
        onClick={handleLogin}
        style={buttonStyle}
        onMouseOver={(e) => (e.currentTarget.style.boxShadow = "4px 4px 10px rgba(0,0,0,0.3)")}
        onMouseOut={(e) => (e.currentTarget.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)")}
      >
        로그인
      </button>
    </div>
  );
}
