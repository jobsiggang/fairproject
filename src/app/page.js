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
    padding: 20,
    fontFamily: "돋움",
    maxWidth: 600,
    margin: "20px auto",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
  };

  const titleStyle = {
    fontSize: 24,
    marginBottom: 10,
  };

  const descStyle = {
    fontSize: 16,
    lineHeight: 1.5,
    marginBottom: 20,
    color: "#333",
  };

  const mainButtonStyle = {
    padding: "12px 24px",
    borderRadius: 25,
    backgroundColor: "#dcdcdc", // 연한 회색
    color: "#333",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 10,
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
  };

  const smallButtonStyle = {
    padding: "8px 16px",
    borderRadius: 20,
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginLeft: 10,
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>현장 사진 관리 시스템</h1>
      <p style={descStyle}>
        이 시스템은 현장 사진 업로드와 기록 관리를 위해 사용됩니다.
        <br />
        로그인 후 사진 업로드 및 편집 페이지로 이동할 수 있습니다.
      </p>

      {author ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <button style={mainButtonStyle} onClick={handleUpload}>
            {author}님 안녕하세요
          </button>
          <button style={smallButtonStyle} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <button style={mainButtonStyle} onClick={handleLogin}>
          로그인
        </button>
      )}
    </div>
  );
}
