// src/lib/googleSheet.js

// 공통 Google Sheet 불러오기 함수
export async function fetchSheetData(sheetName = "현장목록") {
  try {
    const author = typeof window !== "undefined" ? localStorage.getItem("authorName") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

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


// // ✅ 로그인 검증 함수
// export async function checkUserLogin(username, password) {
//   // ✅ 관리자 계정 별도 처리
//   console.log("Checking login for:", username);
//   if (username == process.env.ADMIN_NAME && password == process.env.ADMIN_PASSWORD) {
//     return true;
//   }

//   // ✅ 일반 사용자 시트 확인
//   const users = await fetchSheetData("사용자");
//   return users.some(
//     (u) => u.username ==username && u.password == password
//   );
// }
