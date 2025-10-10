// src/lib/uploadPhoto.js
export async function uploadPhoto(base64, filename, entryData) {
  try {
    const res = await fetch("/api/uploadPhoto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, filename, entryData }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.error || "업로드 실패" };
    }

    // ✅ 업로드 성공 후 다운로드 확인
    const shouldDownload = window.confirm(
      "업로드가 완료! 사진을 다운로드하시겠습니까?사진은 파일함에 저장됩니다."
    );

    if (shouldDownload && data.base64) {
      // Base64로 다운로드
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${data.base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return data; // { success: true, base64: '...', filename: '...' }
  } catch (err) {
    return { success: false, error: err.message };
  }
}
