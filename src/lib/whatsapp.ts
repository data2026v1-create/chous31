import type { CartItem, Product, Settings } from "./types";
import type { Locale } from "./i18n";
import { tr } from "./i18n";
import { formatPrice, SHIPPING_FEE } from "./utils";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

/**
 * Construit le message WhatsApp d'une commande (localisé FR / AR).
 */
export function buildOrderMessage(
  items: CartItem[],
  products: Product[],
  settings: Settings,
  locale: Locale,
  t: (key: string, vars?: Record<string, string | number>) => string,
  opts: { customer?: CustomerInfo | null; discount?: number; promoCode?: string } = {}
): string {
  const byId = new Map(products.map((p) => [p.id, p]));
  const storeName = tr(locale, settings.storeName, settings.storeNameAr);
  const lines: string[] = [];

  lines.push(`🛒 *${t("wa.newOrder")} — ${storeName}*`);
  lines.push(t("wa.intro"));
  lines.push("");

  let subtotal = 0;
  let n = 0;
  items.forEach((item) => {
    const p = byId.get(item.productId);
    if (!p) return;
    n += 1;
    const lineTotal = p.price * item.qty;
    subtotal += lineTotal;
    lines.push(`${n}. ${p.name}`);
    lines.push(`   ${t("wa.size")} ${item.size} · ${item.color} · × ${item.qty}`);
    lines.push(`   ${formatPrice(lineTotal, locale)}`);
    lines.push("");
  });

  const shipping = subtotal >= settings.freeShippingFrom ? 0 : SHIPPING_FEE;
  const discount = opts.discount ?? 0;
  const total = subtotal - discount + shipping;

  lines.push("──────────────");
  lines.push(`${t("wa.subtotal")} : ${formatPrice(subtotal, locale)}`);
  lines.push(
    `${t("wa.delivery")} : ${shipping === 0 ? t("wa.free") : formatPrice(shipping, locale)}`
  );
  if (discount > 0) {
    lines.push(`${t("wa.promo", { code: opts.promoCode ?? "" })} : -${formatPrice(discount, locale)}`);
  }
  lines.push(`*${t("wa.total")} : ${formatPrice(total, locale)}*`);
  lines.push("");

  const c = opts.customer;
  lines.push(`👤 ${t("wa.name")} : ${c?.name || t("wa.toComplete")}`);
  lines.push(`📞 ${t("wa.phone")} : ${c?.phone || t("wa.toComplete")}`);
  lines.push(`📍 ${t("wa.address")} : ${c?.address || t("wa.toComplete")}`);

  return lines.join("\n");
}

/** Ouvre WhatsApp (wa.me) avec le message pré-rempli */
export function openWhatsApp(number: string, message: string): boolean {
  const clean = number.replace(/[^0-9]/g, "");
  if (!clean) return false;
  window.open(
    `https://wa.me/${clean}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
  return true;
}
