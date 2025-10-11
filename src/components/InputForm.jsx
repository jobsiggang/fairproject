"use client";
import React, { useEffect } from "react";

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

  const moveEntry = (index, direction) => {
    setEntries((prev) => {
      const newEntries = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newEntries.length) return prev;
      [newEntries[index], newEntries[targetIndex]] = [
        newEntries[targetIndex],
        newEntries[index],
      ];
      return newEntries;
    });
  };

  const removeEntry = (key) =>
    setEntries((prev) => prev.filter((e) => e.key !== key));

  const addEntry = () => {
    const newKey = Date.now() + Math.random();
    setEntries((prev) => [
      ...prev,
      { key: newKey, field: "새 항목", value: "" },
    ]);
  };

  const smallButton = {
    background: "#ddd",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "2px 4px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "4px",
    fontWeight: "bold",
  };

  const fieldInputStyle = {
    width: "10ch",
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginRight: "4px",
    color: "#000",
    fontWeight: "bold",
  };

  const valueInputStyle = {
    width: "20ch",
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    flexShrink: 0,
    color: "#000",
    fontWeight: "bold",
  };

  const addButtonStyle = {
    marginBottom: 6,
    padding: "2px 6px",
    fontSize: 12,
    borderRadius: 4,
    background: "#ddd",
    cursor: "pointer",
    border: "1px solid #ccc",
    fontWeight: "bold",
    alignSelf: "flex-start",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
      {/* + 항목 추가 버튼 맨 위로 */}
      <button style={addButtonStyle} onClick={addEntry}>+ 항목 추가</button>

      {entries.map((entry, idx) => (
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
            onChange={(e) => handleFieldChange(entry.key, e.target.value)}
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

          <div style={{ display: "flex", marginLeft: "auto", marginTop: 2 }}>
            <button style={smallButton} onClick={() => moveEntry(idx, -1)}>▲</button>
            <button style={smallButton} onClick={() => moveEntry(idx, 1)}>▼</button>
            {idx >= 3 && <button style={smallButton} onClick={() => removeEntry(entry.key)}>삭제</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
