"use client";
import React from "react";

export default function InputForm({ entries, setEntries, siteData }) {
  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환하는 함수
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleFieldChange = (key, newField) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, field: newField } : e))
    );
  };

  const handleValueChange = (key, newValue) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, value: newValue } : e))
    );
  };

  const fieldInputStyle = {
    width: "8ch",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginRight: "4px",
    color: "#000",
    fontWeight: "bold",
  };

  const valueInputStyle = {
    width: "16ch",
    padding: "2px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    flexShrink: 0,
    color: "#000",
    fontWeight: "bold",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
      {entries.map((entry) => (
        <div
          key={entry.key}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 4,
            backgroundColor: "#fff",
          }}
        >
          <input
            style={fieldInputStyle}
            value={entry.field}
            readOnly // 필드명 변경 불가
          />

          {siteData.some(d => d.hasOwnProperty(entry.field)) ? (
            <select
              style={valueInputStyle}
              value={entry.value}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            >
              <option value="">선택</option>
              {[...new Set(siteData.map(d => d[entry.field]).filter(Boolean))].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          ) : entry.field === "일자" ? (
            <input
              type="date"
              style={valueInputStyle}
              value={entry.value || getToday()} // 오늘 날짜 기본값
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            />
          ) : (
            <input
              style={valueInputStyle}
              value={entry.value}
              placeholder={entry.field}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
