import { NextResponse } from "next/server";

// ⚡ Google Apps Script에 사진 업로드
export async function POST(req) {
  try {
    const { base64, filename, entryData } = await req.json();
    console.log("📸 Received upload:", { filename, entryData });

    if (!entryData || !entryData["작성자"] || !entryData["현장명"]) {
      throw new Error("작성자 또는 현장명 정보가 누락되었습니다.");
    }

    const authorName = entryData["작성자"];

    // ⚡ 관리자/사용자 Apps Script URL 선택
    const SCRIPT_URL =
      authorName === process.env.ADMIN_NAME
        ? process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL_ADMIN
        : process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

    if (!SCRIPT_URL)
      throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

    // ⚡ Google Apps Script POST 요청
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, filename, entryData }),
    });

    if (!res.ok) {
      throw new Error(`Apps Script 요청 실패: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
