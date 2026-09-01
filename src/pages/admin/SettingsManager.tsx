import { useState } from "react";
import { Check, ImagePlus, RotateCcw, Save, X } from "lucide-react";
import { useStore } from "../../lib/store";
import { tr, useI18n } from "../../lib/i18n";
import { defaultSettings } from "../../lib/demoData";
import { readFileAsDataUrl } from "../../lib/utils";
import { openWhatsApp } from "../../lib/whatsapp";
import { WhatsAppIcon } from "../../components/icons";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-black/10"
          aria-label={label}
        />
        <input
          className="input font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function ImageSetting({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  const { toast } = useStore();
  const { t } = useI18n();
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <div className="h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/5">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-black/25">
              <ImagePlus size={22} aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2.5">
          <label className="btn btn-outline btn-sm cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  onChange(await readFileAsDataUrl(f));
                  toast(t("sm.imported"));
                } catch {
                  toast(t("pm.imgErr"), "error");
                }
              }}
            />
            {t("sm.import")}
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="btn btn-ghost btn-sm">
              <X size={14} aria-hidden="true" /> {t("sm.remove")}
            </button>
          )}
          <input
            className="input"
            placeholder={t("sm.urlPh")}
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="text-[11px] leading-relaxed text-black/40">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsManager() {
  const { settings, saveSettings, toast } = useStore();
  const { locale, t } = useI18n();
  const [pwd, setPwd] = useState("");
  const [waDraft, setWaDraft] = useState(settings.whatsappNumber);

  const set = (patch: Partial<typeof settings>) => saveSettings(patch);

  const saveWhatsApp = () => {
    const num = waDraft.replace(/[^0-9]/g, "");
    set({ whatsappNumber: num });
    setWaDraft(num);
    toast(t("sm.waSaved"));
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("sm.title")}
          </h1>
          <p className="mt-1 text-sm text-black/50">{t("sm.sub")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            set(defaultSettings);
            toast(t("sm.resetOk"));
          }}
          className="btn btn-ghost btn-md"
        >
          <RotateCcw size={15} aria-hidden="true" />
          {t("sm.reset")}
        </button>
      </header>

      {/* Couleurs */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.colors")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.colorsDesc")}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ColorField label={t("sm.primary")} value={settings.primaryColor} onChange={(v) => set({ primaryColor: v })} />
          <ColorField label={t("sm.bg")} value={settings.bgColor} onChange={(v) => set({ bgColor: v })} />
          <ColorField label={t("sm.text")} value={settings.textColor} onChange={(v) => set({ textColor: v })} />
          <ColorField label={t("sm.surface")} value={settings.surfaceColor} onChange={(v) => set({ surfaceColor: v })} />
        </div>

        {/* Aperçu */}
        <div
          className="mt-6 rounded-2xl border border-black/10 p-5 transition-colors duration-300"
          style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-50">
            {t("sm.preview")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-primary btn-md"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Check size={15} aria-hidden="true" /> {t("sm.btnP")}
            </button>
            <button type="button" className="btn btn-dark btn-md">
              {t("sm.btnS")}
            </button>
            <span
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {t("sm.badge")}
            </span>
            <span className="font-display text-lg font-bold">{t("sm.titlePrev")}</span>
          </div>
          <div
            className="mt-4 h-20 rounded-xl"
            style={{ backgroundColor: settings.surfaceColor }}
          />
        </div>
      </section>

      {/* Textes (français) */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.texts")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.textsDesc")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="t-badge">{t("sm.heroBadge")}</label>
            <input id="t-badge" className="input" value={settings.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="t-title">{t("sm.heroTitle")}</label>
            <input id="t-title" className="input" value={settings.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="t-sub">{t("sm.heroSub")}</label>
            <textarea id="t-sub" className="input min-h-20" value={settings.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="t-cat">{t("sm.catSec")}</label>
            <input id="t-cat" className="input" value={settings.sectionCategories} onChange={(e) => set({ sectionCategories: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="t-pop">{t("sm.popSec")}</label>
            <input id="t-pop" className="input" value={settings.sectionPopular} onChange={(e) => set({ sectionPopular: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="t-marq">{t("sm.marquee")}</label>
            <input id="t-marq" className="input" value={settings.promoMessage} onChange={(e) => set({ promoMessage: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="t-pt">{t("sm.promoT")}</label>
            <input id="t-pt" className="input" value={settings.promoTitle} onChange={(e) => set({ promoTitle: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="t-pd">{t("sm.promoD")}</label>
            <input id="t-pd" className="input" value={settings.promoText} onChange={(e) => set({ promoText: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="t-foot">{t("sm.footerT")}</label>
            <input id="t-foot" className="input" value={settings.footerText} onChange={(e) => set({ footerText: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Textes (arabe) */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.arSec")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.arSecDesc")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ar-name">{t("sm.arName")}</label>
            <input id="ar-name" className="input" dir="rtl" value={settings.storeNameAr} onChange={(e) => set({ storeNameAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-badge">{t("sm.arBadge")}</label>
            <input id="ar-badge" className="input" dir="rtl" value={settings.heroBadgeAr} onChange={(e) => set({ heroBadgeAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-title">{t("sm.arTitle")}</label>
            <input id="ar-title" className="input" dir="rtl" value={settings.heroTitleAr} onChange={(e) => set({ heroTitleAr: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ar-sub">{t("sm.arSub")}</label>
            <textarea id="ar-sub" className="input min-h-20" dir="rtl" value={settings.heroSubtitleAr} onChange={(e) => set({ heroSubtitleAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-cat">{t("sm.arCat")}</label>
            <input id="ar-cat" className="input" dir="rtl" value={settings.sectionCategoriesAr} onChange={(e) => set({ sectionCategoriesAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-pop">{t("sm.arPop")}</label>
            <input id="ar-pop" className="input" dir="rtl" value={settings.sectionPopularAr} onChange={(e) => set({ sectionPopularAr: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ar-marq">{t("sm.arMarquee")}</label>
            <input id="ar-marq" className="input" dir="rtl" value={settings.promoMessageAr} onChange={(e) => set({ promoMessageAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-pt">{t("sm.arPromoT")}</label>
            <input id="ar-pt" className="input" dir="rtl" value={settings.promoTitleAr} onChange={(e) => set({ promoTitleAr: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="ar-pd">{t("sm.arPromoD")}</label>
            <input id="ar-pd" className="input" dir="rtl" value={settings.promoTextAr} onChange={(e) => set({ promoTextAr: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ar-foot">{t("sm.arFooter")}</label>
            <input id="ar-foot" className="input" dir="rtl" value={settings.footerTextAr} onChange={(e) => set({ footerTextAr: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Logo & images */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.images")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.imagesDesc")}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <span className="label">{t("sm.logo")}</span>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-40 place-items-center overflow-hidden rounded-xl border border-black/10 bg-black/5">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-12 max-w-36 object-contain" />
                ) : (
                  <span className="flex items-center gap-1.5 font-display font-bold">
                    <span className="bg-primary grid h-6 w-6 place-items-center rounded-md text-xs text-white">S</span>
                    {settings.storeName}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2.5">
                <label className="btn btn-outline btn-sm cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        set({ logoUrl: await readFileAsDataUrl(f) });
                        toast(t("sm.logoOk"));
                      } catch {
                        toast(t("pm.imgErr"), "error");
                      }
                    }}
                  />
                  {t("sm.uploadLogo")}
                </label>
                {settings.logoUrl && (
                  <button type="button" onClick={() => set({ logoUrl: "" })} className="btn btn-ghost btn-sm">
                    <X size={14} aria-hidden="true" /> {t("sm.removeLogo")}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="s-name">{t("sm.storeName")}</label>
            <input id="s-name" className="input" value={settings.storeName} onChange={(e) => set({ storeName: e.target.value })} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ImageSetting
            label={t("sm.heroImg")}
            value={settings.heroImage}
            onChange={(v) => set({ heroImage: v })}
            hint={t("sm.heroImgHint")}
          />
          <ImageSetting
            label={t("sm.promoImg")}
            value={settings.promoImage}
            onChange={(v) => set({ promoImage: v })}
            hint={t("sm.promoImgHint")}
          />
        </div>
      </section>

      {/* WhatsApp */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.whatsapp")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.whatsappDesc")}</p>

        <div className="mt-5 max-w-md space-y-4">
          <div>
            <label className="label" htmlFor="wa-number">
              {t("sm.waNumber")}
            </label>
            <div className="flex gap-2.5">
              <input
                id="wa-number"
                className="input flex-1"
                dir="ltr"
                inputMode="tel"
                placeholder={t("sm.waPh")}
                value={waDraft}
                onChange={(e) => setWaDraft(e.target.value)}
              />
              <button type="button" onClick={saveWhatsApp} className="btn btn-primary btn-md">
                <Save size={15} aria-hidden="true" />
                {t("sm.waSave")}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-black/40">{t("sm.waHint")}</p>
          </div>

          <p
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${
              settings.whatsappNumber
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                settings.whatsappNumber ? "bg-emerald-500" : "bg-amber-500"
              }`}
              aria-hidden="true"
            />
            {t("sm.waStatus", {
              status: settings.whatsappNumber ? t("sm.waActive") : t("sm.waInactive"),
            })}
          </p>

          <div>
            <button
              type="button"
              disabled={!settings.whatsappNumber}
              className="btn btn-outline btn-sm"
              onClick={() => {
                openWhatsApp(
                  settings.whatsappNumber,
                  `✅ ${tr(locale, settings.storeName, settings.storeNameAr)} — ${t("sm.waTestOk")}`
                );
                toast(t("sm.waTestOk"));
              }}
            >
              <WhatsAppIcon size={15} />
              {t("sm.waTest")}
            </button>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{t("sm.security")}</h2>
        <p className="mt-1 text-xs text-black/45">{t("sm.securityDesc")}</p>
        <div className="mt-5 flex max-w-md gap-2.5">
          <label htmlFor="s-pwd" className="sr-only">
            {t("sm.newPwd")}
          </label>
          <input
            id="s-pwd"
            className="input"
            type="text"
            placeholder={t("sm.newPwd")}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => {
              if (pwd.trim().length < 4) {
                toast(t("sm.pwdErr"), "error");
                return;
              }
              set({ adminPassword: pwd.trim() });
              setPwd("");
              toast(t("sm.pwdOk"));
            }}
          >
            <Save size={15} aria-hidden="true" />
            {t("sm.update")}
          </button>
        </div>
        <p className="mt-3 text-xs text-black/40">{t("sm.pwdWarn")}</p>
      </section>
    </div>
  );
}
