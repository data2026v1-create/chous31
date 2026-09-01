import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useStore } from "../lib/store";
import { tr, useI18n } from "../lib/i18n";
import { cn } from "../utils/cn";

export default function Header() {
  const { settings, cartCount, setCartOpen } = useStore();
  const { locale, setLocale, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { to: "/", label: t("nav.home") },
    { to: "/populaire", label: t("nav.popular") },
    { to: "/panier", label: t("nav.cart") },
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Bandeau promo défilant */}
      <div className="bg-primary overflow-hidden py-2 text-white" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-12 text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>{tr(locale, settings.promoMessage, settings.promoMessageAr)}</span>
              <span className="text-white/60">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Barre principale */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "border-black/10 bg-white/85 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-white"
        )}
        style={{
          backgroundColor: scrolled
            ? "color-mix(in oklab, var(--c-bg) 88%, transparent)"
            : "var(--c-bg)",
          borderColor: "color-mix(in oklab, var(--c-text) 8%, transparent)",
        }}
      >
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={tr(locale, settings.storeName, settings.storeNameAr)}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={tr(locale, settings.storeName, settings.storeNameAr)}
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <>
                <span className="bg-primary grid h-9 w-9 place-items-center rounded-xl font-display text-lg font-bold text-white shadow-lg shadow-orange-500/30">
                  S
                </span>
                <span className="font-display hidden text-xl font-bold tracking-tight sm:block">
                  {tr(locale, settings.storeName, settings.storeNameAr)}
                </span>
              </>
            )}
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={t("nav.main")}
          >
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-black/60 hover:bg-black/5 hover:text-black"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-black/60 hover:bg-black/5 hover:text-black"
                )
              }
            >
              {t("nav.admin")}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {/* Sélecteur de langue */}
            <div
              className="flex items-center gap-0.5 rounded-full border border-black/12 p-0.5"
              role="group"
              aria-label={t("header.lang")}
            >
              <button
                type="button"
                onClick={() => setLocale("fr")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                  locale === "fr"
                    ? "bg-primary text-white"
                    : "text-black/50 hover:text-black"
                )}
                aria-pressed={locale === "fr"}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                  locale === "ar"
                    ? "bg-primary text-white"
                    : "text-black/50 hover:text-black"
                )}
                aria-pressed={locale === "ar"}
              >
                عربي
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="btn btn-md btn-dark relative"
              aria-label={t("header.openCart", { count: cartCount })}
            >
              <ShoppingBag size={17} aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {cartCount > 0 && (
                <span className="bg-primary absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-md md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("menu.close") : t("menu.open")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <nav
            className="container-x animate-fade-up border-t border-black/5 pb-4 pt-2 md:hidden"
            aria-label={t("nav.mobile")}
          >
            {[...nav, { to: "/admin", label: t("nav.admin") }].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-xl px-4 py-3 text-sm font-semibold",
                    isActive
                      ? "bg-primary text-white"
                      : "text-black/70 hover:bg-black/5"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
