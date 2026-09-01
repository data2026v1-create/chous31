import type { SheetsAllData, SheetsResponse } from "./types";

/**
 * Client d'API Google Apps Script (Google Sheets).
 * Compatible avec l'API déployée via le code de appsScript.ts.
 * Content-Type "text/plain" = requête CORS simple (pas de préflight),
 * nécessaire pour que ContentService réponde depuis GitHub Pages.
 */
export async function sheetsRequest<T = unknown>(
  scriptUrl: string,
  action: string,
  payload?: Record<string, unknown>
): Promise<SheetsResponse<T>> {
  const url = scriptUrl.replace(/\/$/, "");

  let res: Response;
  if (payload) {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
    });
  } else {
    res = await fetch(`${url}?action=${encodeURIComponent(action)}`);
  }

  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`);
  }
  const json = (await res.json()) as SheetsResponse<T>;
  if (!json.success) {
    throw new Error(json.error || "Erreur inconnue de l'API");
  }
  return json;
}

export const sheetsPing = (scriptUrl: string) =>
  sheetsRequest<{ message: string; version: string }>(scriptUrl, "ping");

export const sheetsGetAll = (scriptUrl: string) =>
  sheetsRequest<SheetsAllData>(scriptUrl, "all");

export const sheetsPushAll = (
  scriptUrl: string,
  data: SheetsAllData
) =>
  sheetsRequest(scriptUrl, "syncAll", {
    products: data.products,
    categories: data.categories,
    settings: data.settings,
  });

/** Normalise + valide des données brutes issues de Sheets */
export function sanitizeSheetsData(raw: Partial<SheetsAllData>): SheetsAllData {
  const products = Array.isArray(raw.products)
    ? raw.products.filter(
        (p): p is SheetsAllData["products"][number] =>
          !!p && typeof p.id === "string" && typeof p.name === "string"
      )
    : [];
  const categories = Array.isArray(raw.categories)
    ? raw.categories.filter(
        (c): c is SheetsAllData["categories"][number] =>
          !!c && typeof c.id === "string" && typeof c.name === "string"
      )
    : [];
  const settings =
    raw.settings && typeof raw.settings === "object"
      ? (raw.settings as SheetsAllData["settings"])
      : ({} as SheetsAllData["settings"]);
  return { products, categories, settings };
}
