"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageEditor from "@/components/ImageEditor";

export default function UploadPage() {
  const [author, setAuthor] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("authorName");
    if (!saved) {
      console.warn("⚠️ 로그인 정보 없음 → 로그인 페이지로 이동");
      router.push("/login");
    } else {
      setAuthor(saved);
    }
  }, [router]);

  if (!author) return <p>로그인 정보를 불러오는 중...</p>;

  return (
    <div>
      <ImageEditor author={author} />
    </div>
  );
}
