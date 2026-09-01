import { Link } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useStore } from "../lib/store";
import { tr, useI18n } from "../lib/i18n";
import ProductCard from "../components/ProductCard";
import { formatPrice, usePageTitle } from "../lib/utils";

export default function Home() {
  const { settings, categories, products } = useStore();
  const { locale, t } = useI18n();
  usePageTitle(t("nav.home"));

  const popular = products.filter((p) => p.popular).slice(0, 4);

  const stats = [
    { value: "10k+", label: t("home.stats1") },
    { value: "4.9/5", label: t("home.stats2") },
    { value: "60+", label: t("home.stats3") },
  ];

  const heroTitle = tr(locale, settings.heroTitle, settings.heroTitleAr);
  const heroTitleWords = heroTitle.split(" ");

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: "var(--c-primary)" }}
          aria-hidden="true"
        />
        <div className="container-x grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="bg-primary inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-orange-500/30">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              {tr(locale, settings.heroBadge, settings.heroBadgeAr)}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {heroTitleWords.slice(0, -2).join(" ")}{" "}
              <span className="text-primary">
                {heroTitleWords.slice(-2).join(" ")}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-black/60 sm:text-lg">
              {tr(locale, settings.heroSubtitle, settings.heroSubtitleAr)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/populaire" className="btn btn-primary btn-lg">
                {t("home.cta")}
                <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />
              </Link>
              <Link to="/populaire?cat=lifestyle" className="btn btn-outline btn-lg">
                {t("home.cta2")}
              </Link>
            </div>
            <dl className="mt-10 flex gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold sm:text-3xl">{s.value}</dd>
                  <dd className="mt-0.5 text-xs font-medium text-black/45 sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up delay-2 relative">
            <div className="relative mx-auto max-w-lg">
              <div
                className="absolute inset-x-8 top-8 -bottom-6 rotate-3 rounded-[2.5rem]"
                style={{ backgroundColor: "var(--c-primary)" }}
                aria-hidden="true"
              />
              <img
                src={settings.heroImage}
                alt={tr(locale, settings.storeName, settings.storeNameAr)}
                className="relative aspect-[5/4] w-full rounded-[2.5rem] object-cover shadow-2xl shadow-black/20 transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:perspective(1100px)_rotateY(-6deg)_rotateX(3deg)_scale(1.02)]"
              />
              <div className="animate-float absolute -left-4 top-6 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/10 sm:-left-8 rtl:left-auto rtl:-right-4 rtl:sm:-right-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/45">
                  {t("home.offre")}
                </p>
                <p className="text-primary font-display text-lg font-bold">-30%</p>
              </div>
              <div className="absolute -right-3 bottom-8 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/10 sm:-right-6 rtl:right-auto rtl:-left-3 rtl:sm:-left-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/45">
                  {t("home.livraison")}
                </p>
                <p className="font-display text-sm font-bold">{t("home.express")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATÉGORIES ============ */}
      <section className="container-x py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
              {t("home.explore")}
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {tr(locale, settings.sectionCategories, settings.sectionCategoriesAr)}
            </h2>
          </div>
          <Link
            to="/populaire"
            className="hidden items-center gap-1.5 text-sm font-bold hover:text-[var(--c-primary)] sm:flex"
          >
            {t("home.seeAll")}
            <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <Link
                key={c.id}
                to={`/populaire?cat=${c.id}`}
                className={`animate-fade-up delay-${(i % 4) + 1} group relative aspect-[4/5] overflow-hidden rounded-2xl`}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="img-zoom h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="text-2xl" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-white sm:text-lg">
                    {c.name}
                  </h3>
                  <p className="text-xs font-medium text-white/70">
                    {t(count > 1 ? "home.catN" : "home.cat1", { count })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ POPULAIRE ============ */}
      <section className="bg-surface py-16">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-primary text-xs font-bold uppercase tracking-[0.18em]">
                {t("home.best")}
              </span>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {tr(locale, settings.sectionPopular, settings.sectionPopularAr)}
              </h2>
            </div>
            <Link to="/populaire" className="btn btn-outline btn-md">
              {t("home.seeAll")}
              <ArrowRight size={15} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ BANNIÈRE PROMO ============ */}
      <section className="container-x py-16">
        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src={settings.promoImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent rtl:bg-gradient-to-l" />
          <div className="relative flex flex-col items-start gap-5 p-8 sm:p-14 lg:max-w-xl">
            <span className="bg-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">
              {t("home.week")}
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              {tr(locale, settings.promoTitle, settings.promoTitleAr)}
            </h2>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              {tr(locale, settings.promoText, settings.promoTextAr)}
            </p>
            <Link to="/populaire?cat=running" className="btn btn-primary btn-lg">
              {t("home.enjoy")}
              <ArrowRight size={18} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ AVANTAGES ============ */}
      <section className="border-t border-black/8">
        <div className="container-x grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
          {[
            {
              icon: Truck,
              title: t("home.adv1"),
              text: t("home.adv1d", { amount: formatPrice(settings.freeShippingFrom, locale) }),
            },
            { icon: RotateCcw, title: t("home.adv2"), text: t("home.adv2d") },
            { icon: ShieldCheck, title: t("home.adv3"), text: t("home.adv3d") },
            { icon: CreditCard, title: t("home.adv4"), text: t("home.adv4d") },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3.5">
              <span className="bg-surface grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                <f.icon size={20} className="text-primary" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold">{f.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-black/50">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
