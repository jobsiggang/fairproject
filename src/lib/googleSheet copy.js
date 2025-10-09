// src/lib/googleSheet.js
export async function fetchSheetData(sheetName = "현장목록") {
  try {
    // Google Apps Script URL
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
    if (!SCRIPT_URL) throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

    // 시트명 전달
    const res = await fetch(`${SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`);
    if (!res.ok) {
      console.error("❌ Google Sheet API 응답 오류:", res.status);
      return [];
    }

    const json = await res.json();

    if (!json.success || !json.data) {
      console.error("❌ Google Sheet API 오류:", json.error || "데이터 없음");
      return [];
    }

    // 데이터는 [{현장명, 공종명}, ...] 또는 [{username, password}, ...] 형태
    return json.data;
  } catch (err) {
    console.error("❌ Google Sheet fetch 오류:", err);
    return [];
  }
}

// 로그인 검증용 함수
export async function checkUserLogin(username, password) {
  const users = await fetchSheetData("사용자"); // 사용자 시트 읽기
  console.log("Fetched users:", users);
  return users.some((u) => u.username == username && u.password == password);
}
