import { useState, useEffect } from "react";
import { Trophy, Search, X } from "lucide-react";

const SB_URL = "https://excqqbuatvpmlhgioznh.supabase.co/rest/v1";
const SB_KEY = "sb_publishable_qpp-baebumLFpOZaq0vipQ_BwJp4VwR";
const SB_PUBLIC = "https://excqqbuatvpmlhgioznh.supabase.co/storage/v1/object/public/client-wins/";

interface WinRecord {
  id: string;
  display_name: string;
  round: string;
  kind: string;
  payload: string | { file?: string; link?: string };
  created_at: string;
}

interface ClientGroup {
  name: string;
  round: string;
  cards: { kind: string; file: string; link: string }[];
}

export const ClientWinsPage = () => {
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `${SB_URL}/des_wins?select=id,display_name,round,kind,payload,created_at&order=created_at.desc&limit=500`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
      .then((r) => r.json())
      .then((data) => {
        setWins(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped: ClientGroup[] = [];
  const byClient: Record<string, ClientGroup> = {};

  for (const w of wins) {
    const name = w.display_name || "Unknown";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) continue;
    if (!byClient[name]) {
      byClient[name] = { name, round: w.round, cards: [] };
      grouped.push(byClient[name]);
    }
    const p =
      typeof w.payload === "string"
        ? JSON.parse(w.payload || "{}")
        : w.payload || {};
    const file = p.file || "";
    if (file) {
      byClient[name].cards.push({
        kind: w.kind,
        file,
        link: p.link || SB_PUBLIC + file,
      });
    }
  }

  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Client Wins</h1>
        <p className="text-sm text-muted-foreground">
          Score gains, deletions, and round results for active clients.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm py-10 text-center">
          Loading wins...
        </p>
      ) : grouped.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">
          No wins found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {grouped.map((c) => {
            const roundResults = c.cards.filter(
              (x) => x.kind === "round_results"
            );
            const winCards = c.cards.filter((x) => x.kind === "win");
            const all = [...roundResults, ...winCards];
            return (
              <div key={c.name} className="glow-card glow-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{c.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {c.round} &middot; {all.length} card
                  {all.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {all.map((card) => (
                    <img
                      key={card.file}
                      src={card.link}
                      alt={card.kind}
                      loading="lazy"
                      onClick={() => setLightbox(card.link)}
                      className="w-28 rounded-md cursor-pointer border border-border hover:border-primary hover:scale-105 transition-all"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt="Win card"
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

ClientWinsPage.path = "/client-wins";
