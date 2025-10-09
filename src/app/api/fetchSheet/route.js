// src/app/api/fetchSheet/route.js
export async function GET() {
  try {
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
    console.log("SCRIPT_URL:", SCRIPT_URL);

    if (!SCRIPT_URL) throw new Error("Google Apps Script URL이 설정되지 않았습니다.");

    const response = await fetch(SCRIPT_URL);
    console.log("response.status:", response.status);

    const text = await response.text();
    console.log("response.text():", text);

    const data = JSON.parse(text);
    console.log("parsed data:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Server fetchSheet Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
