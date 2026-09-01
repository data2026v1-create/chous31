import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import { formatPrice, SHIPPING_FEE } from "../lib/utils";
import { buildOrderMessage, openWhatsApp } from "../lib/whatsapp";
import { WhatsAppIcon } from "./icons";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    products,
    updateQty,
    removeFromCart,
    cartTotal,
    settings,
    toast,
  } = useStore();
  const { locale, t } = useI18n();

  const byId = new Map(products.map((p) => [p.id, p]));
  const shippingFree = cartTotal >= settings.freeShippingFrom;

  const checkout = () => {
    if (cart.length === 0) return;
    if (!settings.whatsappNumber) {
      toast(t("cp.whatsappNone"), "error");
      return;
    }
    const message = buildOrderMessage(cart, products, settings, locale, t);
    setCartOpen(false);
    openWhatsApp(settings.whatsappNumber, message);
    toast(t("cp.whatsappOk"));
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${cartOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!cartOpen}
    >
      {/* Fond assombri */}
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Panneau */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("c.title")}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-black/8 px-5 py-4">
          <h2 className="font-display flex items-center gap-2 text-lg font-bold">
            <ShoppingBag size={19} aria-hidden="true" />
            {t("c.title")}
            <span className="bg-primary rounded-full px-2 py-0.5 text-xs font-bold text-white">
              {cart.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
            aria-label={t("c.close")}
          >
            <X size={19} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-black/5 text-4xl">
              🛒
            </span>
            <div>
              <p className="font-display text-lg font-bold">{t("c.empty")}</p>
              <p className="mt-1 text-sm text-black/50">{t("c.emptySub")}</p>
            </div>
            <Link to="/populaire" onClick={() => setCartOpen(false)} className="btn btn-primary btn-md">
              {t("c.discover")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.map((item) => {
                const p = byId.get(item.productId);
                if (!p) return null;
                return (
                  <li key={item.id} className="flex gap-3.5">
                    <Link
                      to={`/produit/${p.id}`}
                      onClick={() => setCartOpen(false)}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/produit/${p.id}`}
                            onClick={() => setCartOpen(false)}
                            className="font-display text-sm font-bold leading-tight hover:text-[var(--c-primary)]"
                          >
                            {p.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-black/50">
                            {t("c.sizeColor", { size: item.size, color: item.color })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-black/40 hover:bg-red-50 hover:text-red-500"
                          aria-label={t("c.removeAria", { name: p.name })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-black/10 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="grid h-6 w-6 place-items-center rounded-full hover:bg-black/5"
                            aria-label={t("c.dec")}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="grid h-6 w-6 place-items-center rounded-full hover:bg-black/5"
                            aria-label={t("c.inc")}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-display text-sm font-bold">
                          {formatPrice(p.price * item.qty, locale)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-3 border-t border-black/8 p-5">
              {!shippingFree && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  {t("c.freeHint", {
                    amount: formatPrice(settings.freeShippingFrom - cartTotal, locale),
                  })}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/55">{t("c.subtotal")}</span>
                <span className="font-display text-xl font-bold">
                  {formatPrice(cartTotal, locale)}
                </span>
              </div>
              <p className="text-xs text-black/45">
                {t("c.deliveryNote", {
                  note: shippingFree
                    ? t("c.offer")
                    : t("c.fee", { fee: formatPrice(SHIPPING_FEE, locale) }),
                  taxes: t("c.taxes"),
                })}
              </p>
              <button type="button" onClick={checkout} className="btn btn-primary btn-lg w-full">
                <WhatsAppIcon size={18} />
                {t("c.order")}
              </button>
              <Link
                to="/panier"
                onClick={() => setCartOpen(false)}
                className="btn btn-outline btn-md w-full"
              >
                {t("c.viewCart")}
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
