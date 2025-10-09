"use client";
import React from "react";

export default function InputForm({ entries, setEntries, siteData, author }) {
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

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { key: Date.now(), field: "항목", value: "" },
    ]);
  };

  const removeEntry = (key) => {
    setEntries((prev) => prev.filter((e) => e.key !== key));
  };

  const buttonStyle = {
    background: "linear-gradient(145deg, #f5f5f5, #dcdcdc)",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "25px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "1px 1px 3px rgba(0,0,0,0.2)",
    margin: "0 4px",
  };

  const inputStyle = {
    flex: 1,
    padding: "8px",
    marginRight: "4px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
      {entries.map((entry, idx) => (
        <div
          key={entry.key}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 8,
            backgroundColor: "#fff",
          }}
        >
          <input
            style={inputStyle}
            value={entry.field}
            onChange={(e) => handleFieldChange(entry.key, e.target.value)}
          />
          {entry.field === "현장명" ? (
            <select
              style={inputStyle}
              value={entry.value}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            >
              <option value="">선택</option>
              {[...new Set(siteData.map((d) => d["현장명"]))].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          ) : entry.field === "공종명" ? (
            <select
              style={inputStyle}
              value={entry.value}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            >
              <option value="">선택</option>
              {siteData
                .filter((d) => d["현장명"] === entries.find((e) => e.field === "현장명")?.value)
                .map((d) => d["공종명"])
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          ) : entry.field === "일자" ? (
            <input
              type="date"
              style={inputStyle}
              value={entry.value}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            />
          ) : (
            <input
              style={inputStyle}
              value={entry.value}
              placeholder={entry.field}
              onChange={(e) => handleValueChange(entry.key, e.target.value)}
            />
          )}

          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
            <button style={buttonStyle} onClick={() => moveEntry(idx, -1)}>
              ▲
            </button>
            <button style={buttonStyle} onClick={() => moveEntry(idx, 1)}>
              ▼
            </button>
            {idx >= 3 && (
              <button style={buttonStyle} onClick={() => removeEntry(entry.key)}>
                삭제
              </button>
            )}
          </div>
        </div>
      ))}

      <button style={buttonStyle} onClick={addEntry}>
        항목 추가
      </button>
    </div>
  );
}
