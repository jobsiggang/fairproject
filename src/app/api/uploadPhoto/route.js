// src/app/api/uploadPhoto/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { base64, filename, date, siteName,author  } = await req.json();
    const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, filename, date, siteName,author  }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
