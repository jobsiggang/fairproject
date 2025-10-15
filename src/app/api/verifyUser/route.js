import { NextResponse } from "next/server";
import { fetchSheetData } from "@/lib/googleSheet";

export async function POST(req) {
  try {
    const { author } = await req.json();
    const norm = (s) => String(s || "").trim().toLowerCase();
    const target = norm(author);

    // 서버 환경변수의 단일 관리자 확인 (안전)
    if (process.env.ADMIN_NAME && norm(process.env.ADMIN_NAME) === target) {
      return NextResponse.json({ success: true, role: "admin" });
    }

    // 사용자 시트에서 확인 (관리자 시트 없음)
    const users = await fetchSheetData("사용자").catch(() => null);
    if (!Array.isArray(users)) {
      return NextResponse.json({ success: false, message: "users_load_failed" });
    }

    const commonKeys = ["username", "이름", "작성자", "사용자", "name"];
    const found = users.some((row) => {
      if (!row) return false;
      if (Object.values(row).some((v) => norm(v) === target)) return true;
      for (const k of commonKeys) {
        if (row[k] && norm(row[k]) === target) return true;
      }
      return false;
    });

    if (found) return NextResponse.json({ success: true, role: "user" });

    return NextResponse.json({ success: false, message: "not_found" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || String(error) });
  }
}