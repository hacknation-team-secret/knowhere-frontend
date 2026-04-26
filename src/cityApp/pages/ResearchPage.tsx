import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, DollarSign, Globe, Images, Link as LinkIcon } from "lucide-react";

import { useApp } from "@/cityApp/CityShell";
import { api } from "@/cityApp/lib/apiAdapter";
import { ResearchConversation, useResearchAgent } from "@/components/ResearchAgent";
import { useToast } from "@/hooks/use-toast";
import type { ApiResearchExtractResponse } from "@/lib/api";

export default function ResearchPage() {
  const { auth, requireAuth } = useApp();
  const { toast } = useToast();
  const { setOpen, clearThread } = useResearchAgent();
  const [extractUrl, setExtractUrl] = useState("");
  const [extractQuery, setExtractQuery] = useState(
    "Extract public profile details, links, and visible taste signals.",
  );
  const [extractResult, setExtractResult] = useState<ApiResearchExtractResponse | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const handleExtract = async () => {
    const url = extractUrl.trim();
    if (!url) return;

    setExtractError(null);
    setExtractResult(null);
    setExtracting(true);

    try {
      if (!auth.user) {
        const ok = await requireAuth("Sign in to extract a public profile URL.");
        if (!ok) {
          setExtracting(false);
          return;
        }
      }

      const result = await api.extractResearch(url, extractQuery.trim() || undefined, "advanced", true);
      setExtractResult(result);
      if (result.failed) {
        setExtractError(result.error || "Extraction returned no usable result.");
      }
    } catch (e) {
      const message = (e as Error).message;
      setExtractError(message);
      toast({ title: "Extract failed", description: message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <header className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-soft">City Guide</p>
              <h1 className="mt-1 font-serif text-3xl text-ink">City Guide</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:opacity-80"
              >
                <Bot className="h-3.5 w-3.5" />
                Open City Guide
              </button>
              <button
                type="button"
                onClick={clearThread}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
              >
                Reset
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            City Guide turns passports, budgets, and group location into a shared detour.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/app/groups"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
            >
              Manage groups
            </Link>
            <Link
              to="/app/wallets/shared"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:opacity-80"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Open shared wallet
            </Link>
          </div>
        </header>

        <ResearchConversation />
      </section>

      <aside className="space-y-4">
        <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <Globe className="h-5 w-5 text-stamp" strokeWidth={2} />
            <h2 className="font-serif text-xl">Public Profile Extract</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Paste a public Instagram profile URL and inspect what Tavily Extract can actually pull back.
          </p>

          <div className="mt-4 space-y-2">
            <input
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
              placeholder="https://www.instagram.com/yourhandle/"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <textarea
              value={extractQuery}
              onChange={(e) => setExtractQuery(e.target.value)}
              className="min-h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-stamp focus:outline-none"
              placeholder="Optional extraction hint"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || !extractUrl.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stamp px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {extracting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Globe className="h-4 w-4" />}
              Run Tavily Extract
            </button>
          </div>

          {extractError && (
            <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {extractError}
            </div>
          )}

          {extractResult && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-stamp/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stamp">
                    {extractResult.platform}
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {extractResult.extract_depth}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Metric label="Username" value={extractResult.profile?.username} />
                  <Metric label="Display name" value={extractResult.profile?.display_name} />
                  <Metric label="Followers" value={formatNumber(extractResult.profile?.follower_count)} />
                  <Metric label="Following" value={formatNumber(extractResult.profile?.following_count)} />
                </div>

                {extractResult.profile?.bio && (
                  <div className="mt-3 rounded-xl border border-line bg-paper p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Bio</p>
                    <p className="mt-1 text-sm text-ink">{extractResult.profile.bio}</p>
                  </div>
                )}

                {(extractResult.profile?.external_url || extractResult.url) && (
                  <div className="mt-3 space-y-2 text-xs text-ink-soft">
                    <div className="flex items-start gap-2">
                      <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" />
                      <a href={extractResult.url} target="_blank" rel="noreferrer" className="break-all text-ocean-deep hover:underline">
                        {extractResult.url}
                      </a>
                    </div>
                    {extractResult.profile?.external_url && (
                      <div className="flex items-start gap-2">
                        <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" />
                        <a href={extractResult.profile.external_url} target="_blank" rel="noreferrer" className="break-all text-ocean-deep hover:underline">
                          {extractResult.profile.external_url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {extractResult.images.length > 0 && (
                <div className="rounded-2xl border border-line bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Images className="h-4 w-4 text-ocean-deep" />
                    <p className="text-sm font-semibold text-ink">Returned Images</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {extractResult.images.slice(0, 6).map((imageUrl) => (
                      <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-line bg-paper">
                        <img src={imageUrl} alt="" className="h-24 w-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {extractResult.raw_content && (
                <div className="rounded-2xl border border-line bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Extracted Content Preview</p>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-soft">
                    {extractResult.raw_content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-3">
      <p className="uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value || "—"}</p>
    </div>
  );
}

function formatNumber(value?: number | null) {
  if (value == null) return undefined;
  return new Intl.NumberFormat("en-US").format(value);
}
