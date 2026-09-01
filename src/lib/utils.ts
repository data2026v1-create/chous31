import { useEffect } from "react";
import type { Product } from "./types";

/** Frais de livraison standard (DZD) */
export const SHIPPING_FEE = 800;

/** Formatte un prix en dinars algériens (DZD) selon la locale */
export function formatPrice(value: number, locale: "fr" | "ar" = "fr"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Génère un identifiant unique lisible */
export function uid(prefix = "item"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Convertit "a, b ; c\n d" en tableau propre */
export function parseList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

/** Pourcentage de remise */
export function discountPercent(product: Product): number | null {
  if (!product.oldPrice || product.oldPrice <= product.price) return null;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

/** Met à jour le titre de la page */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — StepStore`
      : "StepStore — Sneakers & Chaussures";
    return () => {
      document.title = "StepStore — Sneakers & Chaussures";
    };
  }, [title]);
}

/** Lire un fichier local en data-URL */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

/** Télécharger un contenu texte sous forme de fichier */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
