"use client";
import React from "react";

export default function InputForm({ entries, setEntries, siteData }) {
  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환하는 함수 (한국 시간 기준)
  const getToday = () => {
    const now = new Date();
    const kstOffset = 9 * 60; // UTC+9
    const localOffset = now.getTimezoneOffset();
    const kstTime = new Date(now.getTime() + (kstOffset + localOffset) * 60000);
    const yyyy = kstTime.getFullYear();
    const mm = String(kstTime.getMonth() + 1).padStart(2, "0");
    const dd = String(kstTime.getDate()).padStart(2, "0");
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

  // 엔트리를 떠날 때 실행: 위치 자동 변환
  const handleValueBlur = (key) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key === key && e.field === "위치") {
          return { ...e, value: e.value.replace(/(\d+)-(\d+)/g, "$1동$2호") };
        }
        return e;
      })
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
              onBlur={() => handleValueBlur(entry.key)} // 위치 자동 변환 적용
            />
          )}
        </div>
      ))}
    </div>
  );
}
