// src/lib/googleSheet.js
// 공통 Google Sheet 불러오기 함수
export async function fetchSheetData(sheetName = "현장목록") {
  try {
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
    if (!SCRIPT_URL) throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

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

    return json.data;
  } catch (err) {
    console.error("❌ Google Sheet fetch 오류:", err);
    return [];
  }
}

// ✅ “입력양식” 시트에서 양식 목록을 불러오는 함수
// 시트 예시:
// 양식명 | 항목명
// DL연간단가 | 현장명,일자,위치,공종코드,물량,공사단계
// 테스트 | 현장명,일자,장소,공종명,물량,내용
export async function fetchFormTemplates() {
  try {
    const data = await fetchSheetData("입력양식");
    if (!Array.isArray(data) || data.length === 0) return [];

    // 각 행을 { name: "양식명", fields: ["현장명","일자",...]} 형태로 변환
    return data.map((row) => ({
      name: row["양식명"] || "이름없음",
      fields: (row["항목명"] || "")
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
    }));
  } catch (err) {
    console.error("❌ 입력양식 불러오기 오류:", err);
    return [];
  }
}

// ✅ 로그인 검증용 함수 (변경 없음)
export async function checkUserLogin(username, password) {
  const users = await fetchSheetData("사용자");
  console.log("Fetched users:", users);
  return users.some((u) => u.username == username && u.password == password);
}
