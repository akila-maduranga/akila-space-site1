"use client";

import { isSupabaseConfigured } from "../supabase";
import type { DataStore } from "../types";
import { LocalStore } from "./local-store";
import { SupabaseStore } from "./supabase-store";

let store: DataStore | null = null;

/**
 * Returns the active data store.
 * - Supabase mode when NEXT_PUBLIC_SUPABASE_URL + anon key are configured.
 * - Local demo mode (localStorage) otherwise — perfect for previewing and
 *   local development without credentials.
 */
export function getStore(): DataStore {
  if (!store) {
    store = isSupabaseConfigured() ? new SupabaseStore() : new LocalStore();
  }
  return store;
}

export type { DataStore };
