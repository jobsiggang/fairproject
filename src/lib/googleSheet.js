// src/lib/googleSheet.js

// 공통 Google Sheet 불러오기 함수
export async function fetchSheetData(sheetName = "현장목록") {
  try {
    const author = typeof window !== "undefined" ? localStorage.getItem("authorName") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    console.log("role:", role);
    // ✅ 관리자면 관리자용 URL 사용
    const SCRIPT_URL =
      role === "admin"
        ? process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL_ADMIN
        : process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

    if (!SCRIPT_URL) throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

    const res = await fetch(`${SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("❌ fetchSheetData 오류:", err);
    return [];
  }
}

