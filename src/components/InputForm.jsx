"use client";
import React from "react";

export default function InputForm({ entries, setEntries, siteData }) {
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

  const removeEntry = (key) => setEntries((prev) => prev.filter((e) => e.key !== key));

  const smallButton = {
    background: "#ddd",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "2px 4px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "4px",
  };

  // ✅ 항목명, 내용 필드 스타일 조정
  const fieldInputStyle = {
    width: "10ch", // 약 5글자 크기
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginRight: "4px",
  };

  const valueInputStyle = {
    width: "20ch", // 약 10글자 크기
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
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
              value={entry.value}
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
