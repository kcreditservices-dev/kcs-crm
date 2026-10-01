import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Image,
  RefreshCw,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POSTIZ_API = "https://api.postiz.com/public/v1";
const POSTIZ_KEY = import.meta.env.VITE_POSTIZ_API_KEY ?? "";

interface PostizPost {
  id: string;
  group: string;
  content: string;
  publishDate: string;
  state: string;
  integration: {
    id: string;
    name: string;
    providerIdentifier: string;
    picture?: string;
  };
  image?: string;
  video?: string;
  releaseURL?: string;
}

type Tab = "scheduled" | "published";

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400",
  instagram: "bg-purple-500/20 text-purple-400",
  youtube: "bg-red-500/20 text-red-400",
  facebook: "bg-blue-500/20 text-blue-400",
  linkedin: "bg-sky-500/20 text-sky-400",
  threads: "bg-zinc-500/20 text-zinc-400",
  skool: "bg-yellow-500/20 text-yellow-400",
};

function getPlatformStyle(provider: string): string {
  const key = provider.toLowerCase().replace(/-.*/, "");
  return PLATFORM_COLORS[key] ?? "bg-muted text-muted-foreground";
}

export const SocialMediaPage = () => {
  const [posts, setPosts] = useState<PostizPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("scheduled");

  const fetchPosts = useCallback(async () => {
    if (!POSTIZ_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      const res = await fetch(
        `${POSTIZ_API}/posts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { Authorization: POSTIZ_KEY },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data?.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const scheduled = posts.filter(
    (p) => p.state === "QUEUE" || p.state === "DRAFT",
  );
  const published = posts.filter((p) => p.state === "PUBLISHED");
  const displayPosts = tab === "scheduled" ? scheduled : published;

  // Group by date
  const grouped = new Map<string, PostizPost[]>();
  for (const post of displayPosts) {
    const dateKey = new Date(post.publishDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const existing = grouped.get(dateKey) ?? [];
    existing.push(post);
    grouped.set(dateKey, existing);
  }

  return (
    <div className="space-y-6 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold glow-text">Social Media</h1>
          <p className="text-sm text-muted-foreground">
            Scheduled and published posts across all platforms.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchPosts}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw
            className={cn("w-4 h-4", loading && "animate-spin")}
          />
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Scheduled" value={scheduled.length} />
        <StatCard label="Published (30d)" value={published.length} />
        <StatCard
          label="Platforms"
          value={new Set(posts.map((p) => p.integration?.providerIdentifier)).size}
        />
        <StatCard
          label="This Week"
          value={
            published.filter((p) => {
              const d = new Date(p.publishDate);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return d >= weekAgo;
            }).length
          }
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <TabButton
          active={tab === "scheduled"}
          onClick={() => setTab("scheduled")}
          label="Scheduled"
          count={scheduled.length}
        />
        <TabButton
          active={tab === "published"}
          onClick={() => setTab("published")}
          label="Published"
          count={published.length}
        />
      </div>

      {/* Posts */}
      {loading && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Loading posts from Postiz...
        </div>
      )}

      {!loading && !POSTIZ_KEY && (
        <div className="text-center text-muted-foreground text-sm py-12">
          <p>Postiz API key not configured.</p>
          <p className="text-xs mt-1">
            Set VITE_POSTIZ_API_KEY in your environment variables.
          </p>
        </div>
      )}

      {!loading && POSTIZ_KEY && displayPosts.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-12">
          No {tab} posts found.
        </div>
      )}

      {!loading &&
        Array.from(grouped.entries()).map(([dateLabel, datePosts]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {dateLabel}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {datePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

SocialMediaPage.path = "/social";

const PostCard = ({ post }: { post: PostizPost }) => {
  const platform = post.integration?.providerIdentifier ?? "unknown";
  const channelName = post.integration?.name ?? platform;
  const time = new Date(post.publishDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const hasMedia = !!(post.image || post.video);

  return (
    <div className="glow-card glow-border p-4 flex flex-col gap-3">
      {/* Platform + Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
              getPlatformStyle(platform),
            )}
          >
            {platform}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {channelName}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm line-clamp-3 leading-relaxed">
        {post.content || "No caption"}
      </p>

      {/* Media indicator + link */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          {hasMedia && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {post.video ? (
                <Video className="w-3 h-3" />
              ) : (
                <Image className="w-3 h-3" />
              )}
              {post.video ? "Video" : "Image"}
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded",
              post.state === "PUBLISHED"
                ? "bg-emerald-500/20 text-emerald-400"
                : post.state === "QUEUE"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-zinc-500/20 text-zinc-400",
            )}
          >
            {post.state === "QUEUE"
              ? "Queued"
              : post.state === "DRAFT"
                ? "Draft"
                : "Published"}
          </span>
        </div>

        {post.releaseURL && (
          <a
            href={post.releaseURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="glow-card glow-border p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const TabButton = ({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
      active
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground",
    )}
  >
    {label}
    <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
  </button>
);
