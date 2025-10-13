"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const themeColor = "#f0f0f0"; // 🌈 PWA 테마 색상

  useEffect(() => {
    const saved = localStorage.getItem("authorName");
    if (saved) setAuthor(saved);
  }, []);

  const handleLogin = () => router.push("/login");
  const handleUpload = () => router.push("/upload");
  const handleLogout = () => {
    localStorage.removeItem("authorName");
    setAuthor("");
  };

  // 🎨 스타일 정의
  const containerStyle = {
    padding: 30,
    fontFamily: "Pretendard, 돋움, sans-serif",
    maxWidth: 700,
    margin: "60px auto",
    background: themeColor,
    borderRadius: 20,
    boxShadow:
      "10px 10px 25px rgba(0,0,0,0.15), -10px -10px 25px rgba(255,255,255,0.8)",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "clamp(28px, 5vw, 38px)",
    marginBottom: 10,
    color: "#333",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  };

  const descStyle = {
    fontSize: "16px",
    color: "#666",
    marginBottom: 35,
    fontWeight: 500,
    lineHeight: 1.6,
  };

  const userStyle = {
    fontSize: "18px",
    lineHeight: 1.5,
    marginBottom: 25,
    color: "#1c2874",
    fontWeight: "bold",
  };

  const mainButtonStyle = {
    width: "70%",
    padding: "10px 0",
    borderRadius: 12,
    background: "linear-gradient(145deg, #ffffff, #dcdcdc)",
    color: "#111",
    border: "1px solid #c0c0c0",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 14,
    boxShadow:
      "4px 4px 10px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,255,255,0.7)",
    transition: "all 0.15s ease-in-out",
    fontSize: 15,
  };

  const smallButtonStyle = {
    padding: "6px 12px",
    borderRadius: 8,
    background: "linear-gradient(145deg, #e4e4e4, #f8f8f8)",
    color: "#333",
    border: "1px solid #ccc",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    boxShadow:
      "2px 2px 5px rgba(0,0,0,0.1), -2px -2px 5px rgba(255,255,255,0.8)",
    transition: "all 0.15s ease-in-out",
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "scale(0.97)";
    e.currentTarget.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.25)";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow =
      "4px 4px 10px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,255,255,0.7)";
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🏗️ 공정한 Works</h1>
      <p style={descStyle}>
        🏘️ 현장 사진 업로드와 기록 관리를 쉽고 빠르게!
      </p>

      {author ? (
        <>
          <div style={userStyle}>{author}님, 안녕하세요!</div>

          <button
            style={mainButtonStyle}
            onClick={handleUpload}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            📸 사진 업로드 하러 가기
          </button>

          <div>
            <button
              style={smallButtonStyle}
              onClick={handleLogout}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              로그아웃
            </button>
          </div>
        </>
      ) : (
        <button
          style={mainButtonStyle}
          onClick={handleLogin}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          로그인
        </button>
      )}
    </div>
  );
}
