import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ContentFilter } from "@/components/ContentFilter";
import {
  getFailedPosts,
  deletePost,
  StoredPost,
  PostResult,
  isUserLoggedIn,
  postHasFailedResults,
  emitPostsChanged,
} from "@/lib/postStorage";
import { getPlatformIcon, getConnectedAccounts } from "@/lib/platforms";
import { ConnectAccountsBanner } from "@/components/ConnectAccountsBanner";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeam } from "@/context/TeamContext";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ProcessingStep {
  id: string;
  name: string;
  platform?: string;
  status: "pending" | "processing" | "success" | "failed";
}

const getPostTypeBadge = (postType?: "feed" | "reel" | "story" | "short") => {
  const type = postType || "feed";
  const styles = {
    feed: "bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
    reel: "bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30",
    story: "bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30",
    short: "bg-red-50/60 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
  };
  const labels = { feed: "Feed", reel: "Reel", story: "Story", short: "Short" };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold tracking-widest border rounded-none ml-1.5 ${styles[type] || styles.feed}`}
    >
      {labels[type] || "Feed"}
    </span>
  );
};

function getTypeIcon(type: string) {
  switch (type) {
    case "text":
      return <Type className="w-3 h-3" />;
    case "image":
      return <ImageIcon className="w-3 h-3" />;
    case "video":
      return <Video className="w-3 h-3" />;
    default:
      return null;
  }
}

function formatWhen(post: StoredPost): string {
  if (post.postedAt) {
    try {
      return new Date(post.postedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  }
  if (post.scheduledDate && post.scheduledTime) {
    return `${post.scheduledDate} · ${post.scheduledTime}`;
  }
  try {
    return new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

function getFailedResults(post: StoredPost): PostResult[] {
  return (post.results || []).filter((r) => r.status === "failed");
}

const sampleFailed: StoredPost[] = [
  {
    id: "sample-failed-1",
    type: "image",
    postType: "feed",
    content:
      "Launch day thread — why async publishing beats manual posting for SaaS teams. #ShipOS #SaaS",
    accounts: [
      {
        handle: "@johndoe",
        platform: "x",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
      {
        handle: "johndoe",
        platform: "linkedin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
    ],
    mediaPreviews: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60",
    ],
    status: "posted",
    postedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    stats: { likes: "0", shares: "0", reach: "0" },
    results: [
      { platform: "x", handle: "@johndoe", status: "success", url: "https://x.com" },
      {
        platform: "linkedin",
        handle: "johndoe",
        status: "failed",
        error: "Image aspect ratio not supported for this post type.",
      },
    ],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export default function FailedPosts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUserRole } = useTeam();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const activeWsId = activeWorkspace.id;

  const [failedPosts, setFailedPosts] = useState<StoredPost[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [processingStatus, setProcessingStatus] = useState("");
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedAccountId, setSelectedAccountId] = useState("all");

  const { data: cachedFailed, isLoading: queryLoading } = useQuery({
    queryKey: ["posts-failed", activeWsId],
    queryFn: async () => {
      const dbFailed = await getFailedPosts();
      const loggedIn = await isUserLoggedIn();
      if (dbFailed.length > 0 || loggedIn) {
        return dbFailed;
      }
      return sampleFailed;
    },
    staleTime: 30_000,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (cachedFailed) {
      setFailedPosts(cachedFailed);
    }
  }, [cachedFailed]);

  const loading = queryLoading && failedPosts.length === 0;
  const isConnected = getConnectedAccounts().length > 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPostType("all");
    setSelectedPlatform("all");
    setSelectedAccountId("all");
  };

  const filteredPosts = failedPosts.filter((post) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesContent = post.content?.toLowerCase().includes(query);
      const matchesError = getFailedResults(post).some((r) =>
        r.error?.toLowerCase().includes(query)
      );
      if (!matchesContent && !matchesError) return false;
    }
    if (selectedPostType !== "all" && post.type !== selectedPostType) return false;
    if (selectedPlatform !== "all") {
      const hasPlatform = getFailedResults(post).some((r) => r.platform === selectedPlatform);
      if (!hasPlatform) return false;
    }
    if (selectedAccountId !== "all") {
      const hasAccount = post.accounts?.some(
        (acc) => `${acc.platform}:${acc.handle}` === selectedAccountId
      );
      if (!hasAccount) return false;
    }
    return true;
  });

  const invalidatePostQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["posts-failed", activeWsId] });
    queryClient.invalidateQueries({ queryKey: ["posts-posted", activeWsId] });
    queryClient.invalidateQueries({ queryKey: ["posts-scheduled", activeWsId] });
    queryClient.invalidateQueries({ queryKey: ["calendar-posts", activeWsId] });
  };

  const handleDelete = async (id: string) => {
    if (currentUserRole === "viewer") return;
    const success = await deletePost(id);
    if (success) {
      toast({ title: "Post deleted", description: "The post record was removed." });
      setFailedPosts((prev) => prev.filter((p) => p.id !== id));
      invalidatePostQueries();
    } else {
      toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    }
  };

  const handleRetry = async (post: StoredPost) => {
    if (currentUserRole === "viewer") return;

    const failedAccounts = post.accounts.filter((acc) => {
      const result = post.results?.find(
        (r) => r.platform === acc.platform && r.handle === acc.handle
      );
      return result?.status === "failed";
    }).map((acc) => {
      const connected = getConnectedAccounts().find(
        (c) => c.platform === acc.platform && c.handle === acc.handle
      );
      return { ...acc, id: (acc as { id?: string }).id || connected?.id };
    });

    if (failedAccounts.length === 0) return;

    const steps: ProcessingStep[] = failedAccounts.map((acc, idx) => ({
      id: `${post.id}-${acc.platform}-${idx}`,
      name: `Retrying ${acc.handle || acc.platform}`,
      platform: acc.platform,
      status: "pending",
    }));

    setProcessingSteps(steps);
    setIsProcessing(true);
    setProcessingStatus("Retrying failed platforms…");

    if (!supabase) {
      const mockResults =
        post.results?.map((r) =>
          r.status === "failed" ? { ...r, status: "success" as const, error: undefined } : r
        ) || [];
      setFailedPosts((prev) =>
        prev
          .map((p) => (p.id === post.id ? { ...p, results: mockResults } : p))
          .filter(postHasFailedResults)
      );
      setIsProcessing(false);
      toast({ title: "Retry succeeded (demo)", description: "Failed platforms were republished." });
      return;
    }

    try {
      setProcessingSteps((prev) =>
        prev.map((step, idx) => (idx === 0 ? { ...step, status: "processing" } : step))
      );

      const { data, error } = await supabase.functions.invoke("post-for-me", {
        body: {
          post: {
            content: post.content,
            accounts: failedAccounts,
            media: post.media || [],
            type: post.type,
            postType: post.postType || "feed",
            tikTokPostMode: post.tikTokPostMode,
          },
          workspace_id: (post.workspaceId || activeWsId) === "personal" ? undefined : (post.workspaceId || activeWsId),
        },
      });

      if (error) throw error;

      const newResults = data.results || [];
      const mergedResults = (post.results || []).map((r) => {
        const matchingNew = newResults.find(
          (nr: PostResult) => nr.platform === r.platform && nr.handle === r.handle
        );
        if (matchingNew) {
          return {
            ...r,
            id: matchingNew.id || r.id,
            status: matchingNew.status,
            url: matchingNew.url || r.url,
            error: matchingNew.error || undefined,
          };
        }
        return r;
      });

      const { error: dbError } = await supabase
        .from("posts")
        .update({ results: mergedResults })
        .eq("id", post.id);

      if (dbError) throw dbError;

      emitPostsChanged(post.workspaceId || activeWsId);

      setFailedPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === post.id ? { ...p, results: mergedResults } : p
        );
        return updated.filter(postHasFailedResults);
      });

      setProcessingSteps((prev) =>
        prev.map((step) => {
          const match = newResults.find((nr: PostResult) => nr.platform === step.platform);
          return {
            ...step,
            status: match?.status === "success" ? "success" : "failed",
          };
        })
      );

      invalidatePostQueries();

      const stillFailed = newResults.filter((r: PostResult) => r.status === "failed").length;
      if (stillFailed === 0) {
        toast({
          title: "Retry successful",
          description: "All failed platforms published successfully.",
        });
      } else {
        toast({
          title: "Retry finished with errors",
          description: `${stillFailed} platform(s) still failed. See details below.`,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not retry publishing.";
      toast({ title: "Retry failed", description: message, variant: "destructive" });
      setProcessingSteps((prev) => prev.map((step) => ({ ...step, status: "failed" })));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      {!isConnected && <ConnectAccountsBanner className="mb-6" />}

      <ContentFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPostType={selectedPostType}
        onPostTypeChange={setSelectedPostType}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search content or error message…"
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-border bg-card p-4 rounded-none animate-pulse space-y-4"
            >
              <div className="h-4 w-1/3 bg-muted/60" />
              <div className="h-20 bg-muted/40" />
              <div className="h-3 w-full bg-muted/50" />
              <div className="h-3 w-2/3 bg-muted/50" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border p-8 text-center bg-card mt-6">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="text-sm font-bold text-foreground">No failed posts</h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm">
            When a scheduled or published post fails on any platform, it will appear here with the
            error reason so you can retry or edit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {filteredPosts.map((post) => {
            const failures = getFailedResults(post);
            const successCount =
              (post.results || []).filter((r) => r.status === "success").length;

            return (
              <Card
                key={post.id}
                className="border border-destructive/30 bg-card shadow-none rounded-none overflow-hidden flex flex-col"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-destructive/[0.04]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span className="text-[10px] font-bold tracking-wider text-destructive truncate">
                        {failures.length} failed · {successCount} succeeded
                      </span>
                      {getPostTypeBadge(post.postType)}
                      {post.status === "scheduled" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold tracking-widest border rounded-none bg-amber-500/10 text-amber-700 border-amber-500/20">
                          <Clock className="w-2.5 h-2.5" />
                          Scheduled
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {formatWhen(post)}
                    </span>
                  </div>

                  <div className="p-4 flex gap-4 border-b border-border/40">
                    {post.mediaPreviews?.[0] ? (
                      <div className="w-24 h-16 shrink-0 border border-border overflow-hidden bg-muted">
                        {post.type === "video" ? (
                          <video
                            src={post.mediaPreviews[0]}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={post.mediaPreviews[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-16 shrink-0 border border-border bg-muted/30 flex items-center justify-center">
                        {getTypeIcon(post.type)}
                      </div>
                    )}
                    <p className="text-[11px] font-medium text-foreground leading-relaxed line-clamp-4 flex-1">
                      {post.content}
                    </p>
                  </div>

                  <div className="p-4 space-y-3 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Failure details
                    </p>
                    {failures.map((result, idx) => {
                      const Icon = getPlatformIcon(result.platform);
                      const detailKey = `${post.id}-${result.platform}-${result.handle}-${idx}`;
                      const showDetails = expandedDetails[detailKey];

                      return (
                        <div
                          key={detailKey}
                          className="border border-destructive/25 bg-destructive/[0.03] p-3 rounded-none space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 border border-destructive/30 bg-background flex items-center justify-center shrink-0">
                                <Icon className="w-3 h-3" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-foreground capitalize truncate">
                                  {result.platform}
                                </p>
                                <p className="text-[9px] font-mono text-muted-foreground truncate">
                                  {result.handle}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-destructive font-medium leading-relaxed">
                            {result.error ||
                              "Publishing failed — no error message returned by the platform."}
                          </p>
                          {result.details && (
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDetails((prev) => ({
                                    ...prev,
                                    [detailKey]: !prev[detailKey],
                                  }))
                                }
                                className="text-[9px] font-bold tracking-wider text-muted-foreground hover:text-foreground underline"
                              >
                                {showDetails ? "Hide debug log" : "Show debug log"}
                              </button>
                              {showDetails && (
                                <pre className="mt-2 max-h-40 overflow-auto text-[9px] font-mono bg-muted/50 border border-border p-2 rounded-none whitespace-pre-wrap break-all">
                                  {result.details}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {currentUserRole !== "viewer" && (
                    <div className="flex items-center gap-2 p-4 border-t border-border/50 mt-auto">
                      <Button
                        onClick={() => handleRetry(post)}
                        disabled={isProcessing}
                        className="flex-1 h-8 text-xs font-bold rounded-none shadow-none"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Retry failed
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/create-post", { state: post })}
                        className="h-8 px-3 text-xs font-bold rounded-none shadow-none"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(post.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-none shrink-0"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the post record from your queue history. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId) void handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-foreground bg-card p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <h3 className="text-sm font-bold">{processingStatus}</h3>
            </div>
            <div className="space-y-2">
              {processingSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between text-[10px] font-bold border border-border px-2 py-1.5 rounded-none"
                >
                  <span>{step.name}</span>
                  <span
                    className={cn(
                      step.status === "success" && "text-green-600",
                      step.status === "failed" && "text-destructive",
                      step.status === "processing" && "text-primary"
                    )}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
