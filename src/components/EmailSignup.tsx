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
        const data = await res.json();
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
    <div className="bg-[#141420] border border-[#2A2A40] rounded-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#C9A84C]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#EDE9E0]">Weekly Show Digest</h3>
          <p className="text-xs text-[#6B6880]">
            Every Monday — what&apos;s coming up in Memphis this week
          </p>
        </div>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-[#C9A84C]">
          <Check className="w-4 h-4" />
          You&apos;re in. See you Monday.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-[#0D0D18] border border-[#2A2A40] rounded px-3 py-2 text-sm text-[#EDE9E0] placeholder-[#4A4858] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] hover:bg-[#DDB85C] disabled:opacity-50 text-[#0D0D18] text-sm font-semibold rounded transition-colors"
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
