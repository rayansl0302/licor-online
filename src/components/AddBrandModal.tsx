import { useCallback, useEffect, useMemo, useState } from "react";
import { createUniqueBrandId } from "../data/brands";
import { useCatalog } from "../contexts/CatalogContext";
import type { BrandId } from "../types";
import "./AddBrandModal.css";

interface AddBrandModalProps {
  onCreated?: (brandId: BrandId, message: string) => void;
}

export function AddBrandModal({ onCreated }: AddBrandModalProps) {
  const { brands, saving, addBrand } = useCatalog();

  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [cor, setCor] = useState("#1e5a9e");
  const [feedback, setFeedback] = useState<string | null>(null);

  const previewId = useMemo(() => {
    const trimmed = nome.trim();
    if (!trimmed) return "";
    return createUniqueBrandId(
      trimmed,
      brands.map((brand) => brand.id)
    );
  }, [nome, brands]);

  const resetForm = useCallback(() => {
    setNome("");
    setCidade("");
    setCor("#1e5a9e");
    setFeedback(null);
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

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setFeedback("Informe o nome do fornecedor.");
      return;
    }

    setFeedback(null);

    try {
      const brandId = await addBrand({
        nome: nome.trim(),
        cidade: cidade.trim() || undefined,
        cor,
      });
      onCreated?.(brandId, `Fornecedor "${nome.trim()}" adicionado!`);
      closeModal();
    } catch {
      setFeedback("Não foi possível adicionar o fornecedor.");
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary btn--small"
        onClick={() => setOpen(true)}
      >
        + Fornecedor
      </button>

      {open && (
        <div className="add-brand-modal" role="presentation">
          <button
            type="button"
            className="add-brand-modal__backdrop"
            aria-label="Fechar"
            onClick={closeModal}
          />

          <div
            className="add-brand-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-brand-title"
          >
            <header className="add-brand-modal__header">
              <div>
                <h2 id="add-brand-title" className="add-brand-modal__title">
                  Novo fornecedor
                </h2>
                <p className="add-brand-modal__subtitle">
                  Ex.: Cachoeira Colonial, Arraiá do Quiabo
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

            <div className="add-brand-modal__body">
              <label className="field">
                <span className="field__label">Nome</span>
                <input
                  type="text"
                  className="field__input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Licores da Serra"
                  disabled={saving}
                />
              </label>

              <label className="field">
                <span className="field__label">Cidade (opcional)</span>
                <input
                  type="text"
                  className="field__input"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex.: Cachoeira"
                  disabled={saving}
                />
              </label>

              <label className="field add-brand-modal__color-field">
                <span className="field__label">Cor da aba</span>
                <input
                  type="color"
                  className="add-brand-modal__color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  disabled={saving}
                />
                <input
                  type="text"
                  className="field__input"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  disabled={saving}
                />
              </label>

              {previewId && (
                <p className="add-brand-modal__preview">
                  Identificador: <code>{previewId}</code>
                </p>
              )}

              {feedback && (
                <p className="alert alert--error" role="alert">
                  {feedback}
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary"
                disabled={saving || !nome.trim()}
                onClick={handleSubmit}
              >
                {saving ? "Salvando…" : "Adicionar fornecedor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
