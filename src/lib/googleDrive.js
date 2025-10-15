// ...existing code...
export async function uploadPhotosBatch(uploadList) {
  try {
    const res = await fetch("/api/uploadPhoto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploadList),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}
// ...existing code...
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

    // ✅ Base64 데이터가 있다면 바로 다운로드 (확인창 없이)
    if (data.base64) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${data.base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return data; // { success: true, base64: '...' }
  } catch (err) {
    return { success: false, error: err.message };
  }
}
