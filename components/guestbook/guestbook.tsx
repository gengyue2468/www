/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, FormEvent } from "react";
import { homeStyles } from "@/app/home.config";
import classNames from "classnames";
import {
  getGuestbookEntries,
  type GuestbookEntry,
} from "@/actions/getGuestbook";
import { createGuestbookEntry } from "@/actions/createGuestbookEntry";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export default function Guestbook() {
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({ message: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInvertDataColor = () => {
    if (!mounted || hash !== "guestbook") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getGuestbookEntries()
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error fetching guestbook entries:", err);
        setError(
          "Failed to load guestbook entries: " + (err?.message || String(err))
        );
        setLoading(false);
      });
  }, []);

  const refreshEntries = async (retries = 3, delay = 1000) => {
    setRefreshing(true);
    setError(null);

    for (let i = 0; i < retries; i++) {
      try {
        const newEntries = await getGuestbookEntries();
        setEntries(newEntries);
        setRefreshing(false);
        return;
      } catch (err: any) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error("Error refreshing guestbook entries:", err);
          setError(
            "Failed to refresh entries: " + (err?.message || String(err))
          );
          setRefreshing(false);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const accessToken = (session as any)?.accessToken;
    if (!session || !accessToken) {
      setSubmitError("Please sign in with GitHub first");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await createGuestbookEntry({
        message: formData.message,
        accessToken: accessToken,
      });
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({ message: "" });
        setTimeout(() => {
          refreshEntries(5, 1500);
        }, 500);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.error || "Submission failed");
      }
    } catch (err: any) {
      setSubmitError("Submission failed: " + (err?.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="guestbook"
      data-color={getInvertDataColor()}
      className={classNames(
        homeStyles.gridItem,
        "col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2 flex flex-row gap-0 flex-wrap",
        mounted && hash === "guestbook" ? "bg-foreground text-background" : ""
      )}
    >
      <div
        className={classNames(
          homeStyles.listContainer,
          "w-full md:w-1/2 lg:w-full xl:w-1/2 pr-0 md:pr-4 xl:pr-4"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className={homeStyles.title}>Guestbook</h1>
          {!loading && (
            <button
              onClick={() => refreshEntries()}
              disabled={refreshing}
              className="opacity-60 hover:opacity-100 disabled:opacity-50"
              title="Refresh entries"
            >
              {refreshing ? "Refreshing..." : "↻"}
            </button>
          )}
        </div>
        {loading && <div>Loading entries...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && entries.length === 0 && (
          <div className="opacity-60">No entries yet</div>
        )}
        {!loading && !error && entries.length > 0 && (
          <div className={homeStyles.listContainer}>
            {entries.map((entry, index) => (
              <div key={entry.id} className={homeStyles.rowContainer}>
                <div
                  className={classNames(
                    homeStyles.subtitle,
                    "flex items-center gap-2"
                  )}
                >
                  {entries.length - index}.
                  <span className="font-medium">{entry.user.login}</span>
                  <span className="opacity-80">
                    {dayjs(entry.created_at).fromNow()}
                  </span>
                </div>
                <div className={homeStyles.rowText}>
                  {entry.body.split("**Message:**")[1]?.trim() || entry.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={classNames(
          homeStyles.listContainer,
          "w-full md:w-1/2 lg:w-full xl:w-1/2 pl-0 md:pl-4 xl:pl-4"
        )}
      >
        <div className={homeStyles.rowContainer}>
          {status === "loading" ? (
            <div className="text-base">Loading...</div>
          ) : session ? (
            <div className={homeStyles.rowContainer}>
              <span className="text-base font-medium mt-4 md:mt-0 xl:mt-0">
                Signed in as {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-base opacity-80 hover:opacity-50 text-left"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="w-full">
              <button
                onClick={() => signIn("github")}
                className={classNames(
                  "w-full py-1.5 rounded-xs hover:opacity-80",
                  mounted && hash === "guestbook"
                    ? "bg-background text-foreground"
                    : "bg-foreground text-background"
                )}
              >
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>
        {session ? (
          <form onSubmit={handleSubmit} className="mt-2 space-y-1">
            <div>
              <textarea
                placeholder="Leave your message..."
                value={formData.message}
                onChange={(e) => setFormData({ message: e.target.value })}
                className={classNames(
                  "w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xs bg-background text-foreground min-h-8 resize-y",
                  mounted && hash === "guestbook"
                    ? "bg-foreground text-background! placeholder:text-background border-foreground"
                    : ""
                )}
                required
                maxLength={1000}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || formData.message.trim() === ""}
              className={classNames(
                "w-full py-1.5 rounded-xs hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
                mounted && hash === "guestbook"
                  ? "bg-background text-foreground"
                  : "bg-foreground text-background"
              )}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {submitError && <div className="text-red-500">{submitError}</div>}
            {submitSuccess && (
              <div className="text-green-500">Submission successful!</div>
            )}
          </form>
        ) : (
          <div className="mt-2 opacity-80">
            Please sign in with GitHub to leave a message.
          </div>
        )}
      </div>
    </div>
  );
}
