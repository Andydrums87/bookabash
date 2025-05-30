"use client";

import { useRouter } from "next/navigation";

export default function NotFoundMessage() {
  const router = useRouter();

  return (
    <div className="text-center py-16 text-xl">
      Post not found.
      <div className="mt-6">
        <button
          onClick={() => router.push("/blog")}
          className="bg-[#FC6B57] text-white px-6 py-3 rounded-full hover:bg-[#e55c48] transition-colors"
        >
          Back to Blog
        </button>
      </div>
    </div>
  );
}