"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("authorName", username);
      localStorage.setItem("userRole", data.role);
      router.push("/upload");
    } else {
      setError(data.message || "로그인 실패");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        fontFamily: "Pretendard, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#222",
          }}
        >
          로그인
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#555",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: "24px",
          }}
        >
          시스템 사용을 위해 로그인 후
          <br />
          사진 업로드페이지로 이동하세요.
        </p>

        <input
          type="text"
          placeholder="사용자명"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "15px",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "15px",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        {error && (
          <p style={{ color: "#e63946", fontSize: "14px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #007bff, #3399ff)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)")
          }
        >
          로그인
        </button>
      </div>
    </div>
  );
}
