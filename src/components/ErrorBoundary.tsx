import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/**
 * Garde-fou global : en cas d'erreur d'affichage, on montre un message
 * lisible (FR/AR) au lieu d'un écran blanc.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[StepStore] Erreur d'affichage :", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#faf7f4] p-6">
          <div className="card w-full max-w-md p-8 text-center">
            <span className="text-5xl" aria-hidden="true">
              ⚠️
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">
              Une erreur est survenue / حدث خطأ
            </h1>
            <p className="mt-2 break-words text-sm leading-relaxed text-black/60">
              {String(this.state.error.message || this.state.error)}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-md mt-6"
            >
              Recharger la page / إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
