import { NextResponse } from "next/server";
import { fetchSheetData } from "@/lib/googleSheet";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // ✅ 관리자 계정 (환경변수로 관리)
    if (
      username === process.env.ADMIN_NAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({
        success: true,
        role: "admin",
      });
    }

    // ✅ 일반 사용자 확인
    const users = await fetchSheetData("사용자");
    const found = users.some(
      (u) => u.username ==username && u.password == password
    );

    if (found) {
      return NextResponse.json({
        success: true,
        role: "user",
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
