import { useCallback, useEffect, useRef, useState } from "react";
import { useCatalog } from "../contexts/CatalogContext";
import type { Brand } from "../types";
import {
  downloadCatalogJson,
  getDefaultCatalogExportJson,
  parseCatalogImportJson,
} from "../utils/catalogImport";
import "./CatalogImportPanel.css";

const DEFAULT_CATALOG_URL = "/catalogo-padrao.json";

interface CatalogImportPanelProps {
  onImported?: (message: string) => void;
}

function describeImport(brands: Brand[]): string {
  const totalProdutos = brands.reduce(
    (sum, brand) =>
      sum +
      brand.categorias.reduce((catSum, cat) => catSum + cat.produtos.length, 0),
    0
  );
  return `${brands.length} marca(s), ${totalProdutos} produto(s)`;
}

export function CatalogImportPanel({ onImported }: CatalogImportPanelProps) {
  const { brands, saving, importCatalog } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "warn">(
    "success"
  );
  const [pendingBrands, setPendingBrands] = useState<Brand[] | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [pastedJson, setPastedJson] = useState("");

  const resetForm = useCallback(() => {
    setFeedback(null);
    setPendingBrands(null);
    setPreviewText(null);
    setPastedJson("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeModal]);

  const showFeedback = (message: string, type: "success" | "error" | "warn") => {
    setFeedback(message);
    setFeedbackType(type);
  };

  const handleExport = () => {
    downloadCatalogJson(brands);
    showFeedback("JSON do catálogo atual baixado.", "success");
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(DEFAULT_CATALOG_URL);
      if (!response.ok) throw new Error("not-found");
      const text = await response.text();
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "catalogo-padrao.json";
      link.click();
      URL.revokeObjectURL(url);
      showFeedback("Modelo padrão baixado.", "success");
    } catch {
      const blob = new Blob([getDefaultCatalogExportJson()], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "catalogo-padrao.json";
      link.click();
      URL.revokeObjectURL(url);
      showFeedback("Modelo padrão baixado.", "success");
    }
  };

  const applyParsedFile = (text: string) => {
    setPendingBrands(null);
    setPreviewText(null);
    setFeedback(null);

    const result = parseCatalogImportJson(text);

    if (result.erros.length > 0) {
      showFeedback(result.erros[0], "error");
      return;
    }

    if (result.brands.length === 0) {
      showFeedback("Nenhuma marca válida no arquivo.", "error");
      return;
    }

    setPendingBrands(result.brands);
    setPreviewText(
      `Pronto: ${describeImport(result.brands)}${
        result.avisos.length > 0 ? ` · ${result.avisos.length} aviso(s)` : ""
      }`
    );

    if (result.avisos.length > 0) {
      showFeedback(result.avisos[0], "warn");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      applyParsedFile(await file.text());
    } catch {
      showFeedback("Não foi possível ler o arquivo.", "error");
    }

    event.target.value = "";
  };

  const confirmImport = async (nextBrands: Brand[]) => {
    if (
      !window.confirm(
        "Importar substitui todo o catálogo na nuvem pelo conteúdo do JSON. Continuar?"
      )
    ) {
      return;
    }

    try {
      await importCatalog(nextBrands);
      onImported?.("Catálogo importado com sucesso!");
      closeModal();
    } catch {
      showFeedback("Não foi possível importar o catálogo.", "error");
    }
  };

  const handleImportPending = async () => {
    if (!pendingBrands) {
      showFeedback("Escolha um arquivo .json válido primeiro.", "error");
      return;
    }
    await confirmImport(pendingBrands);
  };

  const handleImportFromTextarea = async () => {
    const text = pastedJson.trim();
    if (!text) {
      showFeedback("Cole o JSON no campo.", "error");
      return;
    }

    const result = parseCatalogImportJson(text);
    if (result.erros.length > 0) {
      showFeedback(result.erros[0], "error");
      return;
    }

    await confirmImport(result.brands);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={() => setOpen(true)}
      >
        Importar
      </button>

      {open && (
        <div className="catalog-import-modal" role="presentation">
          <button
            type="button"
            className="catalog-import-modal__backdrop"
            aria-label="Fechar importação"
            onClick={closeModal}
          />

          <div
            className="catalog-import-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-import-title"
          >
            <header className="catalog-import-modal__header">
              <div>
                <h2 id="catalog-import-title" className="catalog-import-modal__title">
                  Importar catálogo
                </h2>
                <p className="catalog-import-modal__subtitle">
                  JSON substitui o catálogo inteiro na nuvem.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={closeModal}
              >
                Fechar
              </button>
            </header>

            <div className="catalog-import-modal__body">
              <div className="catalog-import-modal__actions">
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={handleDownloadTemplate}
                >
                  Baixar modelo
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={handleExport}
                >
                  Exportar atual
                </button>
              </div>

              <label className="field">
                <span className="field__label">Arquivo JSON</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="catalog-import-modal__file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  disabled={saving}
                />
              </label>

              {previewText && (
                <p className="catalog-import-modal__preview" role="status">
                  {previewText}
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary"
                disabled={saving || !pendingBrands}
                onClick={handleImportPending}
              >
                {saving ? "Salvando…" : "Importar arquivo"}
              </button>

              <label className="field catalog-import-modal__paste">
                <span className="field__label">Ou cole o JSON</span>
                <textarea
                  className="field__textarea catalog-import-modal__textarea"
                  rows={4}
                  placeholder='{ "version": 1, "brands": [ ... ] }'
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  disabled={saving}
                />
              </label>

              <button
                type="button"
                className="btn btn--secondary"
                disabled={saving || !pastedJson.trim()}
                onClick={handleImportFromTextarea}
              >
                Importar texto colado
              </button>

              {feedback && (
                <p
                  className={`alert catalog-import-modal__alert ${
                    feedbackType === "success"
                      ? "alert--success"
                      : feedbackType === "warn"
                        ? "alert--warn"
                        : "alert--error"
                  }`}
                  role="status"
                >
                  {feedback}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
