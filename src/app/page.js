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
    background: "linear-gradient(145deg, #f0f0f0, #e0e0e0)",
    borderRadius: 16,
    boxShadow: "8px 8px 20px rgba(0,0,0,0.2), -8px -8px 20px rgba(255,255,255,0.7)",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "clamp(28px, 6vw, 40px)",
    marginBottom: 15,
    color: "#333",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(255,255,255,0.6)",
  };

  const descStyle = {
    fontSize: "18px",
    lineHeight: 1.5,
    marginBottom: 30,
    color: "#555",
    fontWeight: "600",
  };
    const userStyle = {
    fontSize: "18px",
    lineHeight: 1.5,
    marginBottom: 30,
    color: "#212884ff",
    fontWeight: "bold",
  };

  const mainButtonStyle = {
    width: "70%",
    padding: "10px 0",
    borderRadius: 10,
    background: "linear-gradient(145deg, #d4d4d4, #ffffff)",
    color: "#000",
    border: "1px solid #bbb",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 12,
    boxShadow: "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.6)",
    transition: "all 0.15s ease-in-out",
    fontSize: 14,
  };

  const smallButtonStyle = {
    padding: "5px 10px",
    borderRadius: 10,
    background: "#aaa",
    color: "#000",
    border: "none",
    cursor: "pointer",
    marginTop: 8,
    fontWeight: "bold",
    transition: "all 0.15s ease-in-out",
    fontSize: 12,
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
        🏘️ 현장 사진 업로드와 기록 관리를 쉽고 빠르게❗<br />        
      </p>

      {author ? (
        <>
          <div style={{ marginBottom: 10 }}>
        <div style={userStyle}>
              {author}님, 안녕하세요!
        </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <button
              style={mainButtonStyle}
              onClick={handleUpload}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              사진 업로드 하러 가기
            </button>
          </div>
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
