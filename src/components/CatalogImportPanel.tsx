import { useRef, useState } from "react";
import { useCatalog } from "../contexts/CatalogContext";
import type { Brand } from "../types";
import {
  downloadCatalogJson,
  getDefaultCatalogExportJson,
  parseCatalogImportJson,
} from "../utils/catalogImport";
import "./CatalogImportPanel.css";

const DEFAULT_CATALOG_URL = "/catalogo-padrao.json";

function describeImport(brands: Brand[]): string {
  const totalProdutos = brands.reduce(
    (sum, brand) =>
      sum +
      brand.categorias.reduce((catSum, cat) => catSum + cat.produtos.length, 0),
    0
  );
  return `${brands.length} marca(s), ${totalProdutos} produto(s)`;
}

export function CatalogImportPanel() {
  const { brands, saving, importCatalog } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "warn">(
    "success"
  );
  const [pendingBrands, setPendingBrands] = useState<Brand[] | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);

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

  const applyParsedFile = async (text: string) => {
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
      `Pronto para importar: ${describeImport(result.brands)}${
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
      await applyParsedFile(await file.text());
    } catch {
      showFeedback("Não foi possível ler o arquivo.", "error");
    }

    event.target.value = "";
  };

  const handleImportPending = async () => {
    if (!pendingBrands) {
      showFeedback("Escolha um arquivo .json válido primeiro.", "error");
      return;
    }

    if (
      !window.confirm(
        "Importar substitui todo o catálogo na nuvem pelo conteúdo do JSON. Continuar?"
      )
    ) {
      return;
    }

    try {
      await importCatalog(pendingBrands);
      setPendingBrands(null);
      setPreviewText(null);
      showFeedback("Catálogo importado com sucesso!", "success");
    } catch {
      showFeedback("Não foi possível importar o catálogo.", "error");
    }
  };

  const handleImportFromTextarea = async () => {
    const textarea = document.getElementById(
      "catalog-import-json"
    ) as HTMLTextAreaElement | null;
    const text = textarea?.value.trim();
    if (!text) {
      showFeedback("Cole o JSON no campo abaixo.", "error");
      return;
    }

    const result = parseCatalogImportJson(text);
    if (result.erros.length > 0) {
      showFeedback(result.erros[0], "error");
      return;
    }

    if (
      !window.confirm(
        "Importar substitui todo o catálogo na nuvem pelo JSON colado. Continuar?"
      )
    ) {
      return;
    }

    try {
      await importCatalog(result.brands);
      if (textarea) textarea.value = "";
      setPendingBrands(null);
      setPreviewText(null);
      showFeedback("Catálogo importado com sucesso!", "success");
    } catch {
      showFeedback("Não foi possível importar o catálogo.", "error");
    }
  };

  return (
    <section className="catalog-import" aria-label="Importar e exportar catálogo">
      <h3 className="catalog-import__title">Importar / exportar JSON</h3>
      <p className="catalog-import__hint">
        Use o arquivo modelo, edite no computador e importe de volta. Substitui o
        catálogo inteiro na nuvem.
      </p>

      <div className="catalog-import__actions">
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
          className="catalog-import__file"
          accept=".json,application/json"
          onChange={handleFileChange}
          disabled={saving}
        />
      </label>

      {previewText && (
        <p className="catalog-import__preview" role="status">
          {previewText}
        </p>
      )}

      <button
        type="button"
        className="btn btn--primary"
        disabled={saving || !pendingBrands}
        onClick={handleImportPending}
      >
        {saving ? "Salvando…" : "Importar arquivo selecionado"}
      </button>

      <label className="field catalog-import__paste">
        <span className="field__label">Ou cole o JSON aqui</span>
        <textarea
          id="catalog-import-json"
          className="field__textarea catalog-import__textarea"
          rows={5}
          placeholder='{ "version": 1, "brands": [ ... ] }'
          disabled={saving}
        />
      </label>

      <button
        type="button"
        className="btn btn--secondary"
        disabled={saving}
        onClick={handleImportFromTextarea}
      >
        Importar texto colado
      </button>

      {feedback && (
        <p
          className={`alert catalog-import__alert ${
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
    </section>
  );
}
