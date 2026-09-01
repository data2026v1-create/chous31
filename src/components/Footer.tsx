import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { tr, useI18n } from "../lib/i18n";

/* Icônes sociales (SVG inline) */
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

export default function Footer() {
  const { settings, categories, toast } = useStore();
  const { locale, t } = useI18n();
  const storeName = tr(locale, settings.storeName, settings.storeNameAr);

  const submitNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("email") as HTMLInputElement;
    if (input.value.includes("@")) {
      toast(t("footer.newsOk"));
      form.reset();
    } else {
      toast(t("footer.newsErr"), "error");
    }
  };

  return (
    <footer className="bg-[#101010] text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {t("footer.newsletterTitle")}{" "}
              <span className="text-primary">{storeName}</span>
            </h2>
            <p className="mt-2 text-sm text-white/60">{t("footer.newsletterSub")}</p>
          </div>
          <form onSubmit={submitNewsletter} className="flex w-full max-w-md gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              {t("footer.emailPh")}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder={t("footer.emailPh")}
              className="input input-light flex-1"
              required
            />
            <button type="submit" className="btn btn-primary btn-md">
              {t("footer.subscribe")}
            </button>
          </form>
        </div>
      </div>

      {/* Colonnes */}
      <div className="container-x grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={storeName}
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <>
                <span className="bg-primary grid h-8 w-8 place-items-center rounded-lg font-display text-base font-bold text-white">
                  S
                </span>
                <span className="font-display text-lg font-bold">{storeName}</span>
              </>
            )}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            {tr(locale, settings.footerText, settings.footerTextAr)}
          </p>
          <div className="mt-5 flex gap-2.5">
            {[
              { icon: InstagramIcon, label: "Instagram" },
              { icon: FacebookIcon, label: "Facebook" },
              { icon: XIcon, label: "Twitter / X" },
              { icon: YoutubeIcon, label: "YouTube" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-primary"
              >
                <s.icon />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={t("footer.shop")}>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
            {t("footer.shop")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/populaire?cat=${c.id}`}
                  className="text-white/75 transition-colors hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/populaire" className="text-white/75 transition-colors hover:text-primary">
                {t("footer.allItems")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("footer.help")}>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
            {t("footer.help")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {["footer.h1", "footer.h2", "footer.h3", "footer.h4", "footer.h5"].map((k) => (
              <li key={k}>
                <a href="#" className="text-white/75 transition-colors hover:text-primary">
                  {t(k)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.info")}>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
            {t("footer.info")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/admin" className="text-white/75 transition-colors hover:text-primary">
                {t("footer.adminLink")}
              </Link>
            </li>
            {["footer.i1", "footer.i2", "footer.i3", "footer.i4"].map((k) => (
              <li key={k}>
                <a href="#" className="text-white/75 transition-colors hover:text-primary">
                  {t(k)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row">
          <p>{t("footer.rights", { year: new Date().getFullYear(), store: storeName })}</p>
          <p className="flex items-center gap-2">
            <span className="text-primary">●</span> {t("footer.powered")}
          </p>
        </div>
      </div>
    </footer>
  );
}
