"use client";
import React from "react";

export default function InputForm({ entries, setEntries, siteData }) {
  // 오늘 날짜를 yyyy-MM-dd 형식으로 반환 (한국 시간 기준)
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

  const handleValueChange = (key, newValue) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, value: newValue } : e))
    );
  };

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

  // 기본 입력 스타일 (필드용 / 값용)
  const baseInputStyle = {
    padding: "2px 4px",
    border: "none",
    borderBottom: "1px solid #ccc",
    fontSize: "13px",
    color: "#000",
    background: "transparent",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2, // 행 간격 최소화
        marginBottom: 6,
      }}
    >
      {entries.map((entry) => {
        const options = siteData.map((d) => d[entry.field]).filter(Boolean);
        const hasOptions = options.length > 0;

        return (
          <div
            key={entry.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* 필드명 */}
            <input
              style={{
                ...baseInputStyle,
                width: "10ch",
                textAlign: "right",
                flexShrink: 0,
              }}
              value={entry.field}
              readOnly
            />

            {/* 값 입력 */}
            {entry.field === "일자" ? (
              <input
                type="date"
                style={{
                  ...baseInputStyle,
                  width: "20ch",
                  fontWeight: "normal",
                }}
                value={entry.value}
                onChange={(e) => handleValueChange(entry.key, e.target.value)}
              />
            ) : entry.field === "위치" ? (
              <input
                style={{
                  ...baseInputStyle,
                  width: "20ch",
                  fontWeight: "normal",
                }}
                value={entry.value}
                placeholder="123-345"
                onChange={(e) => handleValueChange(entry.key, e.target.value)}
                onBlur={() => handleValueBlur(entry.key)}
              />
            ) : hasOptions ? (
              <>
                <input
                  list={`datalist-${entry.key}`}
                  style={{
                    ...baseInputStyle,
                    width: "20ch",
                    fontWeight: "normal",
                  }}
                  value={entry.value}
                  onChange={(e) => handleValueChange(entry.key, e.target.value)}
                  onBlur={() => handleValueBlur(entry.key)}
                />
                <datalist id={`datalist-${entry.key}`}>
                  {[...new Set(options)].map((val) => (
                    <option key={val} value={val} />
                  ))}
                </datalist>
              </>
            ) : (
              <input
                style={{
                  ...baseInputStyle,
                  width: "20ch",
                  fontWeight: "normal",
                }}
                value={entry.value}
                placeholder={entry.field}
                onChange={(e) => handleValueChange(entry.key, e.target.value)}
                onBlur={() => handleValueBlur(entry.key)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
