import { NextResponse } from "next/server";

/**
 * ⚡ 여러 장의 이미지를 Google Apps Script로 업로드
 * 요청 형식:
 * [
 *   { base64: "data...", filename: "photo1.jpg", entryData: {...} },
 *   { base64: "data...", filename: "photo2.jpg", entryData: {...} },
 *   ...
 * ]
 */
export async function POST(req) {
  try {
    const uploads = await req.json();

    // 단일 업로드일 경우도 배열로 통일
    const uploadList = Array.isArray(uploads) ? uploads : [uploads];

    if (uploadList.length === 0) throw new Error("업로드할 데이터가 없습니다.");

    const firstEntry = uploadList[0].entryData;
    if (!firstEntry || !firstEntry["작성자"] || !firstEntry["현장명"]) {
      throw new Error("작성자 또는 현장명 정보가 누락되었습니다.");
    }

    const authorName = firstEntry["작성자"];

    // ⚡ 관리자/사용자 Apps Script URL 선택
    const SCRIPT_URL =
      authorName === process.env.ADMIN_NAME
        ? process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL_ADMIN
        : process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

    if (!SCRIPT_URL)
      throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

    // ⚡ 여러 장의 이미지를 순차적으로 업로드
    const results = [];
    for (const { base64, filename, entryData } of uploadList) {
      if (!entryData || !entryData["작성자"] || !entryData["현장명"]) {
        results.push({
          filename,
          success: false,
          error: "작성자 또는 현장명 누락",
        });
        continue;
      }

      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, filename, entryData }),
      });

      if (!res.ok) {
        results.push({
          filename,
          success: false,
          error: `Apps Script 요청 실패: ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      results.push({ filename, ...data });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
