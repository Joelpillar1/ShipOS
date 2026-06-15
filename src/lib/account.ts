import { supabase } from "./supabase";

/**
 * Permanently delete the signed-in user's account and all associated data.
 *
 * Real mode: calls the delete-account edge function, which deletes the Supabase auth user with
 * the service role. ON DELETE CASCADE foreign keys then remove the profile, posts, notifications,
 * scheduled content, workspaces and memberships. Throws on failure so the caller can show a toast.
 *
 * Mock/demo mode (no Supabase configured): there is no real account, so this is a no-op and the
 * caller can simply sign the user out locally.
 */
export async function deleteAccount(): Promise<void> {
  if (!supabase) return;

  const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
  if (error) {
    throw new Error(error.message || "Could not delete your account.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
}
