import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, TicketPercent, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import { formatPrice, SHIPPING_FEE, usePageTitle } from "../lib/utils";
import { buildOrderMessage, openWhatsApp, type CustomerInfo } from "../lib/whatsapp";
import { WhatsAppIcon } from "../components/icons";

const PROMO_CODE = "STEP10";

export default function CartPage() {
  const { cart, products, updateQty, removeFromCart, cartTotal, settings, toast, clearCart } =
    useStore();
  const { locale, t } = useI18n();
  usePageTitle(t("cp.title"));

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  /* Informations client (persistées localement) */
  const [client, setClient] = useState<CustomerInfo>(() => {
    try {
      const raw = localStorage.getItem("stepstore_client");
      if (raw) return { name: "", phone: "", address: "", ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return { name: "", phone: "", address: "" };
  });

  useEffect(() => {
    try {
      localStorage.setItem("stepstore_client", JSON.stringify(client));
    } catch {
      /* ignore */
    }
  }, [client]);

  const byId = new Map(products.map((p) => [p.id, p]));
  const items = cart
    .map((i) => ({ item: i, product: byId.get(i.productId) }))
    .filter(
      (x): x is { item: (typeof cart)[number]; product: NonNullable<typeof x.product> } =>
        !!x.product
    );

  const shipping = cartTotal >= settings.freeShippingFrom ? 0 : SHIPPING_FEE;
  const discount = promoApplied ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount + shipping;

  const applyPromo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (promo.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      toast(t("cp.promoOk"));
    } else {
      toast(t("cp.promoErr"), "error");
    }
  };

  /* Commande → redirection WhatsApp */
  const checkout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings.whatsappNumber) {
      toast(t("cp.whatsappNone"), "error");
      return;
    }
    if (client.name.trim().length < 2) {
      toast(t("cp.requiredName"), "error");
      return;
    }
    const message = buildOrderMessage(cart, products, settings, locale, t, {
      customer: client,
      discount,
      promoCode: promoApplied ? PROMO_CODE : undefined,
    });
    openWhatsApp(settings.whatsappNumber, message);
    toast(t("cp.whatsappOk"));
  };

  if (items.length === 0) {
    return (
      <main className="container-x grid place-items-center py-28 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-black/5 text-5xl" aria-hidden="true">
          🛒
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">{t("c.empty")}</h1>
        <p className="mt-2 max-w-md text-sm text-black/55">{t("cp.emptySub")}</p>
        <Link to="/populaire" className="btn btn-primary btn-lg mt-7">
          <ShoppingBag size={18} aria-hidden="true" />
          {t("c.discover")}
          <ArrowRight size={17} aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
      </main>
    );
  }

  return (
    <main className="container-x py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {t("cp.title")}{" "}
        <span className="text-lg font-semibold text-black/40">
          {t(items.length > 1 ? "cp.countN" : "cp.count1", { n: items.length })}
        </span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Liste */}
        <ul className="space-y-4">
          {items.map(({ item, product }) => (
            <li
              key={item.id}
              className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5"
            >
              <Link
                to={`/produit/${product.id}`}
                className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-black/5 sm:w-28"
              >
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </Link>

              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/40">
                  {product.brand}
                </p>
                <Link
                  to={`/produit/${product.id}`}
                  className="font-display text-base font-bold hover:text-[var(--c-primary)]"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-black/50">
                  {t("cp.size")} <strong>{item.size}</strong> · {t("cp.color")}{" "}
                  <strong>{item.color}</strong>
                </p>
                <p className="text-xs text-black/40">
                  {formatPrice(product.price, locale)} {t("cp.unit")}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center gap-1 rounded-full border border-black/10 p-1">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5"
                    aria-label={t("c.dec")}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5"
                    aria-label={t("c.inc")}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span className="font-display text-lg font-bold">
                  {formatPrice(product.price * item.qty, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:underline"
                >
                  <Trash2 size={14} aria-hidden="true" /> {t("cp.remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Résumé + commande WhatsApp */}
        <aside className="card h-fit p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-lg font-bold">{t("cp.recap")}</h2>

          <form onSubmit={applyPromo} className="mt-4 flex gap-2">
            <label htmlFor="promo" className="sr-only">
              {t("cp.promoPh")}
            </label>
            <div className="relative flex-1">
              <TicketPercent
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35 rtl:left-auto rtl:right-3"
                aria-hidden="true"
              />
              <input
                id="promo"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder={t("cp.promoPh")}
                className="input pl-9! rtl:pl-3! rtl:pr-9!"
                disabled={promoApplied}
              />
            </div>
            <button type="submit" className="btn btn-dark btn-md" disabled={promoApplied}>
              OK
            </button>
          </form>
          {promoApplied && (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
              {t("cp.promoApplied", { code: PROMO_CODE })}
            </p>
          )}

          <dl className="mt-5 space-y-2.5 border-t border-black/8 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/55">{t("c.subtotal")}</dt>
              <dd className="font-semibold">{formatPrice(cartTotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/55">{t("cp.delivery")}</dt>
              <dd className="font-semibold">
                {shipping === 0 ? (
                  <span className="text-emerald-600">{t("c.offer")}</span>
                ) : (
                  formatPrice(shipping, locale)
                )}
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>{t("cp.discount", { code: PROMO_CODE })}</dt>
                <dd className="font-semibold">-{formatPrice(discount, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-black/8 pt-3 text-base">
              <dt className="font-bold">{t("cp.total")}</dt>
              <dd className="text-primary font-display text-2xl font-bold">
                {formatPrice(total, locale)}
              </dd>
            </div>
          </dl>

          {shipping > 0 && (
            <div className="mt-4">
              <p className="text-xs text-black/50">
                {t("cp.progress", {
                  amount: formatPrice(settings.freeShippingFrom - cartTotal, locale),
                })}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/8">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (cartTotal / settings.freeShippingFrom) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Informations client + commande WhatsApp */}
          <form onSubmit={checkout} className="mt-5 space-y-3 border-t border-black/8 pt-5">
            <h3 className="font-display text-sm font-bold">{t("cp.yourInfo")}</h3>
            <div>
              <label htmlFor="c-name" className="label">
                {t("cp.name")}
              </label>
              <input
                id="c-name"
                className="input"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                placeholder={t("cp.namePh")}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="c-phone" className="label">
                {t("cp.phone")}
              </label>
              <input
                id="c-phone"
                className="input"
                dir="ltr"
                inputMode="tel"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                placeholder={t("cp.phonePh")}
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="c-address" className="label">
                {t("cp.address")}
              </label>
              <input
                id="c-address"
                className="input"
                value={client.address}
                onChange={(e) => setClient({ ...client, address: e.target.value })}
                placeholder={t("cp.addressPh")}
                autoComplete="street-address"
              />
            </div>
            <p className="text-[11px] leading-relaxed text-black/45">{t("cp.infoHint")}</p>

            <button
              type="submit"
              disabled={!settings.whatsappNumber}
              className="btn btn-primary btn-lg w-full"
            >
              <WhatsAppIcon size={18} />
              {t("cp.checkout")}
            </button>
            {!settings.whatsappNumber && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
                {t("cp.whatsappNone")}
              </p>
            )}
          </form>

          <button
            type="button"
            onClick={() => {
              clearCart();
              toast(t("cp.cleared"), "info");
            }}
            className="mt-3 w-full text-center text-xs font-semibold text-black/40 hover:text-red-500"
          >
            {t("cp.clear")}
          </button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-black/40">
            {t("cp.secure")}
          </p>
        </aside>
      </div>
    </main>
  );
}
