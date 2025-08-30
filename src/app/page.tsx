"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CardGlowBackground from "@/components/CardGlowBackground";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ??
  "https://bushjones514.app.n8n.cloud/webhook/b9ec5bd5-506b-4f6b-b59f-e55361fe1d96";

export default function DashboardPage() {
  // Theme state
  const [theme, setTheme] = useState<string>(typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);
  const [startSecond, setStartSecond] = useState<string>("");
  const [endSecond, setEndSecond] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>("");
  const [payloadPreview, setPayloadPreview] = useState<Record<string, number> | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const parseIntStrict = (val: string) => {
    if (val.trim() === "") return NaN;
    const n = Number(val);
    return Number.isInteger(n) ? n : NaN;
  };

  const validate = (startVal: string, endVal: string) => {
    const s = parseIntStrict(startVal);
    const e = parseIntStrict(endVal);

    if (Number.isNaN(s) || Number.isNaN(e)) {
      return "Please enter whole numbers for both fields.";
    }
    if (s < 0 || e < 0) {
      return "Values must be non-negative.";
    }
    if (s > e) {
      return "Starting second must be less than or equal to ending second.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate(startSecond, endSecond);
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      startSecond: Number(startSecond),
      endSecond: Number(endSecond),
    };

    setIsSubmitting(true);
    setHttpStatus(null);
    setResponseBody("");
    setPayloadPreview(payload);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setHttpStatus(res.status);

      const text = await res.text();
      setResponseBody(text);

      if (res.ok) {
        toast.success(`Sent to n8n (Status ${res.status})`);
      } else {
        toast.error(`Request failed with status ${res.status}`);
      }
    } catch (err: unknown) {
      setHttpStatus(null);
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }
      setResponseBody(message);
      toast.error(`Network error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStartSecond("");
    setEndSecond("");
    setHttpStatus(null);
    setResponseBody("");
    setPayloadPreview(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
  <CardGlowBackground />
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
      <main className="flex flex-col items-center justify-center min-h-screen w-full px-2 py-6 md:px-10 z-10 relative">
        <div className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center">
          <header className="mb-8 text-center flex flex-col items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              n8n Overlay Dashboard
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-base md:text-lg">
              Enter the overlay starting and ending second, then send them to your n8n.<br />
            </p>
          </header>

          <Card className="shadow-lg rounded-2xl w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Submit Range</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="start">Starting Second</Label>
                  <Input
                    id="start"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 0"
                    min={0}
                    step={1}
                    value={startSecond}
                    onChange={(e) => setStartSecond(e.target.value)}
                    className="text-base md:text-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end">Ending Second</Label>
                  <Input
                    id="end"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 16"
                    min={0}
                    step={1}
                    value={endSecond}
                    onChange={(e) => setEndSecond(e.target.value)}
                    className="text-base md:text-lg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button type="submit" disabled={isSubmitting} className="rounded-2xl w-full sm:w-auto">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    className="rounded-2xl w-full sm:w-auto"
                  >
                    Reset
                  </Button>
                </div>
              </form>

              {/* Collapsible Technical Section */}
              <Collapsible
                open={showTechDetails}
                onOpenChange={setShowTechDetails}
                className="mt-6"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    {showTechDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showTechDetails ? "Hide Technical Details" : "Show Technical Details"}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 mt-4">
                  <Separator />

                  <section>
                    <h2 className="text-lg font-semibold">Webhook</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 break-all">
                      Using: <code>{WEBHOOK_URL}</code>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Set <code>NEXT_PUBLIC_N8N_WEBHOOK_URL</code> to override.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-medium">Payload Preview</h3>
                    <pre className="mt-2 rounded-2xl bg-slate-950 text-slate-50 p-4 overflow-auto text-sm min-h-[3rem]">
                      {JSON.stringify(payloadPreview ?? { startSecond: "", endSecond: "" }, null, 2)}
                    </pre>
                  </section>

                  <section>
                    <h3 className="text-base font-medium">Response</h3>
                    <div className="mt-2 grid gap-2">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        HTTP Status: {httpStatus ?? "—"}
                      </div>
                      <pre className="rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 overflow-auto text-sm min-h-[3rem] border border-slate-200 dark:border-slate-700">
                        {responseBody || "(no response yet)"}
                      </pre>
                    </div>
                  </section>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <footer className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Built with Next.js • Tailwind CSS • shadcn/ui
          </footer>
        </div>
      </main>
    </div>
  );
}
