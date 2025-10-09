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
    const valid = await checkUserLogin(username, password);
    if (valid) {
      localStorage.setItem("authorName", username);
      router.push("/upload");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
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
    width: "100%",
  };

  const containerStyle = {
    padding: "20px",
    fontFamily: "돋움",
    maxWidth: "400px",
    margin: "50px auto",
    backgroundColor: "#f0f0f0",
    borderRadius: "12px",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "16px",
  };

  const errorStyle = {
    color: "red",
    marginBottom: "12px",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>로그인</h1>

      <input
        placeholder="사용자명"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      {error && <p style={errorStyle}>{error}</p>}

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
