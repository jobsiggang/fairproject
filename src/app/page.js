"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [author, setAuthor] = useState("");

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

  const containerStyle = {
    padding: 30,
    fontFamily: "돋움",
    maxWidth: 700,
    margin: "40px auto",
    background: "linear-gradient(145deg, #f0f0f0, #e0e0e0)", // 밝은 메탈 느낌
    borderRadius: 16,
    boxShadow: "8px 8px 20px rgba(0,0,0,0.2), -8px -8px 20px rgba(255,255,255,0.7)",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "clamp(28px, 6vw, 40px)",
    marginBottom: 15,
    color: "#333",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(255,255,255,0.6)", // 메탈 반사 느낌
  };

  const descStyle = {
    fontSize: "18px",
    lineHeight: 1.5,
    marginBottom: 30,
    color: "#555",
    fontWeight: "600",
  };

  const mainButtonStyle = {
    padding: "16px 32px",
    borderRadius: 28,
    background: "linear-gradient(145deg, #d4d4d4, #ffffff)",
    color: "#222",
    border: "2px solid #bbb",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 12,
    boxShadow: "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.6)",
    transition: "all 0.15s ease-in-out",
  };

  const smallButtonStyle = {
    padding: "10px 20px",
    borderRadius: 20,
    background: "#aaa",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginLeft: 12,
    fontWeight: "bold",
    transition: "all 0.15s ease-in-out",
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(2px)";
    e.currentTarget.style.boxShadow = "inset 3px 3px 6px rgba(0,0,0,0.3)";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.6)";
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🏗️ 공정한 Works</h1>
      <p style={descStyle}>
      현장 사진 업로드와 기록 관리를 쉽고 빠르게!<br />
      관리자에게 받은 사용자명으로 로그인하세요.
      </p>

      {author ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button
            style={mainButtonStyle}
            onClick={handleUpload}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {author}님, 현장 사진 업로드
          </button>
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
