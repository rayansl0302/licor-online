import { useMemo, useState } from "react";
import { buildProductId, getBrandById, getCategoriesForBrand } from "../data/brands";
import { useCatalog } from "../contexts/CatalogContext";
import type { BrandId } from "../types";
import "./CatalogEditor.css";

interface CatalogEditorProps {
  brandId: BrandId;
}

export function CatalogEditor({ brandId }: CatalogEditorProps) {
  const { brands, loading, saving, error, addProduct, removeProduct, updateProduct } =
    useCatalog();

  const [newNome, setNewNome] = useState("");
  const [newPreco, setNewPreco] = useState("");
  const [newCategoria, setNewCategoria] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const brand = getBrandById(brands, brandId);
  const categories = useMemo(
    () => getCategoriesForBrand(brands, brandId),
    [brands, brandId]
  );

  const handleAdd = async () => {
    const preco = Number(newPreco.replace(",", "."));
    if (!newNome.trim() || !newCategoria.trim() || Number.isNaN(preco) || preco < 0) {
      setLocalError("Preencha nome, categoria e preço base válido.");
      return;
    }

    setLocalError(null);
    try {
      await addProduct(brandId, newCategoria, newNome, preco);
      setNewNome("");
      setNewPreco("");
    } catch {
      setLocalError("Não foi possível adicionar o licor.");
    }
  };

  const handleRemove = async (categoria: string, productId: string, nome: string) => {
    if (!window.confirm(`Remover "${nome}" do catálogo?`)) return;

    setLocalError(null);
    try {
      await removeProduct(brandId, categoria, productId);
    } catch {
      setLocalError("Não foi possível remover o licor.");
    }
  };

  if (!brand) return null;

  return (
    <section className="catalog-editor" aria-label="Editar catálogo">
      <div className="catalog-editor__head">
        <h3 className="catalog-editor__title">Editar catálogo — {brand.nome}</h3>
        <p className="catalog-editor__hint">
          Preço base (sem lucro). Alterações salvam na nuvem para todos os pedidos.
          {saving && " Salvando…"}
        </p>
      </div>

      {(error || localError) && (
        <p className="alert alert--error" role="alert">
          {localError ?? error}
        </p>
      )}

      {loading ? (
        <p className="empty-hint">Carregando catálogo…</p>
      ) : (
        <>
          {brand.categorias.map((category) => (
            <div key={category.nome} className="catalog-editor__group">
              <h4 className="catalog-editor__group-title">{category.nome}</h4>
              <ul className="catalog-editor__list">
                {category.produtos.map((product) => {
                  const productId = buildProductId(
                    brand.id,
                    category.nome,
                    product.nome
                  );

                  return (
                    <li key={productId} className="catalog-editor__row">
                      <label className="sr-only" htmlFor={`nome-${productId}`}>
                        Nome
                      </label>
                      <input
                        id={`nome-${productId}`}
                        type="text"
                        className="field__input catalog-editor__input-name"
                        defaultValue={product.nome}
                        disabled={saving}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (!value || value === product.nome) return;
                          updateProduct(brandId, category.nome, productId, {
                            nome: value,
                          }).catch(() => {
                            setLocalError("Não foi possível renomear o licor.");
                          });
                        }}
                      />
                      <label className="sr-only" htmlFor={`preco-${productId}`}>
                        Preço base
                      </label>
                      <input
                        id={`preco-${productId}`}
                        type="number"
                        min={0}
                        step={0.01}
                        className="field__input catalog-editor__input-price"
                        defaultValue={product.preco}
                        disabled={saving}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (Number.isNaN(value) || value < 0 || value === product.preco) {
                            return;
                          }
                          updateProduct(brandId, category.nome, productId, {
                            preco: value,
                          }).catch(() => {
                            setLocalError("Não foi possível atualizar o preço.");
                          });
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn--cancelado btn--small"
                        disabled={saving}
                        onClick={() =>
                          handleRemove(category.nome, productId, product.nome)
                        }
                      >
                        Remover
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="catalog-editor__add">
            <h4 className="catalog-editor__group-title">Adicionar licor</h4>
            <div className="catalog-editor__add-fields">
              <label className="field">
                <span className="field__label">Nome</span>
                <input
                  type="text"
                  className="field__input"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Ex.: Pitanga"
                  disabled={saving}
                />
              </label>
              <label className="field">
                <span className="field__label">Preço base (R$)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="field__input"
                  value={newPreco}
                  onChange={(e) => setNewPreco(e.target.value)}
                  placeholder="18"
                  disabled={saving}
                />
              </label>
              <label className="field">
                <span className="field__label">Categoria</span>
                <input
                  type="text"
                  className="field__input"
                  list={`categorias-${brandId}`}
                  value={newCategoria}
                  onChange={(e) => setNewCategoria(e.target.value)}
                  placeholder="Ex.: Tradicionais"
                  disabled={saving}
                />
                <datalist id={`categorias-${brandId}`}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </label>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving}
              onClick={handleAdd}
            >
              Adicionar ao catálogo
            </button>
          </div>
        </>
      )}
    </section>
  );
}
