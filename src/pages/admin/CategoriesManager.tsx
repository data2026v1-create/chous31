import { useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useStore } from "../../lib/store";
import { useI18n } from "../../lib/i18n";
import type { Category } from "../../lib/types";
import { readFileAsDataUrl, uid } from "../../lib/utils";

interface CatDraft {
  id: string;
  name: string;
  emoji: string;
  image: string;
}

export default function CategoriesManager() {
  const { categories, products, saveCategory, deleteCategory, toast } = useStore();
  const { t } = useI18n();
  const [draft, setDraft] = useState<CatDraft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) {
      toast(t("cm.required"), "error");
      return;
    }
    saveCategory({
      id: draft.id || uid("categorie"),
      name: draft.name.trim(),
      emoji: draft.emoji.trim() || "👟",
      image:
        draft.image ||
        "https://images.pexels.com/photos/26852035/pexels-photo-26852035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    });
    setDraft(null);
  };

  return (
    <div className="animate-fade-up space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("cm.title")}
          </h1>
          <p className="mt-1 text-sm text-black/50">
            {t(categories.length > 1 ? "cm.subN" : "cm.sub1", { n: categories.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ id: "", name: "", emoji: "👟", image: "" })}
          className="btn btn-primary btn-md"
        >
          <Plus size={16} aria-hidden="true" />
          {t("cm.add")}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <div key={c.id} className="card group overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <img src={c.image} alt={c.name} className="img-zoom h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-4 text-3xl rtl:left-auto rtl:right-4" aria-hidden="true">
                  {c.emoji}
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-display font-bold">{c.name}</h3>
                  <p className="text-xs text-black/45">
                    {t(count > 1 ? "cm.itemsN" : "cm.items1", { n: count })}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDraft({ id: c.id, name: c.name, emoji: c.emoji, image: c.image })}
                    className="btn btn-ghost btn-sm"
                    aria-label={t("cm.editAria", { name: c.name })}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(c)}
                    className="btn btn-sm bg-red-50 text-red-500 hover:bg-red-100"
                    aria-label={t("cm.deleteAria", { name: c.name })}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="animate-pop w-full max-w-md rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <header className="flex items-center justify-between border-b border-black/8 px-6 py-4">
              <h2 className="font-display text-lg font-bold">
                {draft.id ? t("cm.editTitle") : t("cm.new")}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
                aria-label={t("cm.close")}
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={submit} className="space-y-4 p-6">
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <div>
                  <label className="label" htmlFor="c-name">{t("cm.name")}</label>
                  <input
                    id="c-name"
                    className="input"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Running"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="c-emoji">{t("cm.emoji")}</label>
                  <input
                    id="c-emoji"
                    className="input text-center"
                    value={draft.emoji}
                    onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("cm.image")}</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/5">
                    {draft.image ? (
                      <img src={draft.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-black/25">
                        <ImagePlus size={20} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          setDraft({ ...draft, image: await readFileAsDataUrl(f) });
                        } catch {
                          toast(t("pm.imgErr"), "error");
                        }
                      }}
                    />
                    {t("cm.import")}
                  </label>
                </div>
                <input
                  className="input mt-3"
                  placeholder={t("cm.urlPh")}
                  value={draft.image.startsWith("data:") ? "" : draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                />
              </div>

              <footer className="flex justify-end gap-2.5 border-t border-black/8 pt-5">
                <button type="button" onClick={() => setDraft(null)} className="btn btn-ghost btn-md">
                  {t("cm.cancel")}
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  {t("cm.save")}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="animate-pop card w-full max-w-sm p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">
              {t("cm.confirmTitle", { name: confirmDelete.name })}
            </h3>
            <p className="mt-1.5 text-sm text-black/55">{t("cm.confirmText")}</p>
            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-md flex-1">
                {t("cm.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="btn btn-md flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                {t("pm.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
