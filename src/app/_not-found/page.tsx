// src/app/_not-found/page.tsx
"use client";

import React from "react";

interface NotFoundProps {
  missingItems?: string[];
}

const NotFoundPage: React.FC<NotFoundProps> = ({ missingItems = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "Pretendard, 돋움, sans-serif",
        textAlign: "center",
        padding: 20,
        backgroundColor: "#f0f0f0",
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: "bold", marginBottom: 16 }}>
        ❌ 페이지를 찾을 수 없습니다
      </h1>
      <p style={{ fontSize: 16, color: "#555", marginBottom: 20 }}>
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>

      {missingItems.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            누락된 항목:
          </h2>
          <ul style={{ listStyle: "disc", paddingLeft: 20, textAlign: "left" }}>
            {missingItems.map((item, index) => (
              <li key={index}>{item?.toString() || "알 수 없는 항목"}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default NotFoundPage;
