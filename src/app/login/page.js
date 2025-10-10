"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkUserLogin } from "@/lib/googleSheet";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const valid = await checkUserLogin(username, password);
    if (valid) {
      localStorage.setItem("authorName", username);
      router.push("/upload");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "돋움",
    backgroundColor: "#f0f0f0",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
    padding: "30px 20px",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "24px",
    marginBottom: "16px",
    color: "#333",
  };

  const descStyle = {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
    lineHeight: 1.5,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    color: "#000",
    outline: "none",
  };

  const buttonStyle = {
    background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "25px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
    width: "100%",
    transition: "0.2s",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>로그인</h1>
        <p style={descStyle}>
          시스템을 사용하려면 로그인 후, 사진 업로드 및 편집 페이지로 이동하세요.
        </p>

        <input
          type="text"
          placeholder="사용자명"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          style={buttonStyle}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow = "4px 4px 10px rgba(0,0,0,0.3)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)")
          }
        >
          로그인
        </button>
      </div>
    </div>
  );
}
