"use client";
import React, { useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from "react";

const baseInputStyle = {
  padding: "2px 4px",
  border: "none",
  borderBottom: "1px solid #ccc",
  fontSize: "13px",
  color: "#000",
  background: "transparent",
  fontWeight: "bold",
};

function EntryRow({ entry, options, onChangeDebounced, onBlur }) {
  const hasOptions = options && options.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
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

      {entry.field === "일자" ? (
        <input
          type="date"
          style={{
            ...baseInputStyle,
            width: "20ch",
            fontWeight: "normal",
          }}
          value={entry.value}
          onChange={(e) => onChangeDebounced(entry.key, e.target.value)}
          onBlur={() => onBlur(entry.key)}
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
          onChange={(e) => onChangeDebounced(entry.key, e.target.value)}
          onBlur={() => onBlur(entry.key)}
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
            onChange={(e) => onChangeDebounced(entry.key, e.target.value)}
            onBlur={() => onBlur(entry.key)}
          />
          <datalist id={`datalist-${entry.key}`}>
            {options.map((val) => (
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
          onChange={(e) => onChangeDebounced(entry.key, e.target.value)}
          onBlur={() => onBlur(entry.key)}
        />
      )}
    </div>
  );
}

const MemoEntryRow = React.memo(EntryRow);

const InputFormImpl = function InputForm({ entries, setEntries, siteData }, ref) {
  // field -> unique options map (캐시)
  const optionsMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(siteData)) return map;
    for (const row of siteData) {
      for (const key of Object.keys(row)) {
        const val = row[key];
        if (!val) continue;
        if (!map[key]) map[key] = new Set();
        map[key].add(val);
      }
    }
    // convert Sets -> Arrays
    Object.keys(map).forEach((k) => {
      map[k] = Array.from(map[k]);
    });
    return map;
  }, [siteData]);

  // 키별 디바운스 타이머 및 최신 값 저장
  // timersRef.current[key] = { timer: TimeoutId, value: latestValue }
  const timersRef = useRef({});

  const onChangeDebounced = useCallback((key, newValue, delay = 300) => {
    // clear existing timer
    if (timersRef.current[key]?.timer) clearTimeout(timersRef.current[key].timer);
    const timer = setTimeout(() => {
      setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, value: newValue } : e)));
      delete timersRef.current[key];
    }, delay);
    timersRef.current[key] = { timer, value: newValue };
  }, [setEntries]);

  const handleBlur = useCallback((key) => {
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key].timer);
      const pendingValue = timersRef.current[key].value;
      delete timersRef.current[key];
      setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, value: pendingValue } : e)));
      return;
    }
    // 기존 동작 (예: 포맷 변경)
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key === key && e.field === "위치") {
          return { ...e, value: (e.value || "").replace(/(\d+)-(\d+)/g, "$1동$2호") };
        }
        return e;
      })
    );
  }, [setEntries]);

  // 외부에서 pending 디바운스값을 즉시 적용하도록 노출
  useImperativeHandle(ref, () => ({
    flushPending: () => {
      const pending = { ...timersRef.current };
      Object.keys(pending).forEach((k) => {
        try {
          if (pending[k].timer) clearTimeout(pending[k].timer);
        } catch (e) {}
      });
      // 한번에 적용
      setEntries((prev) =>
        prev.map((e) => {
          if (pending[e.key]) return { ...e, value: pending[e.key].value };
          return e;
        })
      );
      timersRef.current = {};
    },
  }), []); // stable handle

  // 컴포넌트 렌더링은 동일
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginBottom: 6,
      }}
    >
      {entries.map((entry) => (
        <MemoEntryRow
          key={entry.key}
          entry={entry}
          options={optionsMap[entry.field] || []}
          onChangeDebounced={onChangeDebounced}
          onBlur={handleBlur}
        />
      ))}
    </div>
  );
};

export default React.memo(forwardRef(InputFormImpl));
