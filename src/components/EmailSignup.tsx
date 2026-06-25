"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json() as any;
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrMsg((err as Error).message);
    }
  }

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-[#E8608A]/10 border border-[#E8608A]/25 flex items-center justify-center">
          <Mail className="w-4.5 h-4.5 text-[#E8608A]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#F0F0F0] text-[15px]">Weekly Show Digest</h3>
          <p className="text-xs text-[#666666]">
            Every Monday — what&apos;s happening in Memphis this week
          </p>
        </div>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-[#E8608A]">
          <Check className="w-4 h-4" />
          You&apos;re in. See you Monday.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-[#111111] border border-[#2A2A2A] rounded-full px-4 py-2 text-sm text-[#F0F0F0] placeholder-[#444444] focus:outline-none focus:border-[#E8608A]/50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#E8608A] hover:bg-[#F07095] disabled:opacity-50 text-[#111111] text-sm font-semibold rounded-full transition-colors"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{errMsg}</p>
      )}
    </div>
  );
}
