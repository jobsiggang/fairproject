export async function uploadPhoto(base64, filename, entryData) {
  try {
    const res = await fetch("/api/uploadPhoto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, filename, entryData } ),
    });

    const data = await res.json();
    return data; // { success: true, fileUrl: '...' }
  } catch (err) {
    return { success: false, error: err.message };
  }
}
