import { useEffect, useState } from "react";
import { usePix } from "../contexts/PixContext";
import type { PixSettings } from "../lib/userPix";
import type { NotificationPermissionState } from "../lib/orderNotifications";
import "./ProfilePanel.css";

interface ProfilePanelProps {
  open: boolean;
  userEmail: string;
  notificationsSupported: boolean;
  notificationPermission: NotificationPermissionState;
  onRequestNotifications: () => Promise<NotificationPermissionState>;
  onLogout: () => void;
  onClose: () => void;
}

const EMPTY_DRAFT: PixSettings = {
  key: "",
  bank: "",
  holderName: "",
};

export function ProfilePanel({
  open,
  userEmail,
  notificationsSupported,
  notificationPermission,
  onRequestNotifications,
  onLogout,
  onClose,
}: ProfilePanelProps) {
  const {
    pixKey,
    pixBank,
    pixHolderName,
    loading: pixLoading,
    saving: pixSaving,
    error: pixError,
    savePix,
    hasPixInfo,
  } = usePix();

  const [draft, setDraft] = useState<PixSettings>(EMPTY_DRAFT);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setDraft({
      key: pixKey,
      bank: pixBank,
      holderName: pixHolderName,
    });
    setSaveMessage(null);
  }, [open, pixKey, pixBank, pixHolderName]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const showNotifyButton =
    notificationsSupported && notificationPermission !== "granted";

  const handleEnableNotifications = async () => {
    await onRequestNotifications();
  };

  const handleSavePix = async () => {
    setSaveMessage(null);
    try {
      await savePix(draft);
      setSaveMessage("Dados PIX salvos!");
    } catch {
      setSaveMessage(null);
    }
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  const updateDraft = (patch: Partial<PixSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaveMessage(null);
  };

  return (
    <div className="profile-panel" role="presentation">
      <button
        type="button"
        className="profile-panel__backdrop"
        aria-label="Fechar perfil"
        onClick={onClose}
      />

      <div
        className="profile-panel__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-panel-title"
      >
        <header className="profile-panel__header">
          <div>
            <h2 id="profile-panel-title" className="profile-panel__title">
              Meu perfil
            </h2>
            <p className="profile-panel__subtitle">
              Conta e dados para copiar nos pedidos
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="profile-panel__body">
          <section className="profile-panel__section">
            <h3 className="profile-panel__section-title">Conta</h3>
            <label className="field">
              <span className="field__label">E-mail</span>
              <input
                type="email"
                className="field__input"
                value={userEmail}
                readOnly
                aria-readonly="true"
              />
            </label>
          </section>

          <section className="profile-panel__section">
            <div className="profile-panel__section-head">
              <h3 className="profile-panel__section-title">Dados PIX</h3>
              <span className="profile-panel__status">
                {pixLoading
                  ? "Carregando…"
                  : hasPixInfo
                    ? "Último salvamento na nuvem"
                    : "Preencha e toque em Salvar"}
              </span>
            </div>

            {pixError && (
              <p className="alert alert--error profile-panel__alert" role="alert">
                {pixError}
              </p>
            )}

            {saveMessage && (
              <p className="alert alert--success profile-panel__alert" role="status">
                {saveMessage}
              </p>
            )}

            <label className="field">
              <span className="field__label">Nome completo (titular)</span>
              <input
                type="text"
                className="field__input"
                value={draft.holderName}
                onChange={(e) => updateDraft({ holderName: e.target.value })}
                placeholder="Ex.: Maria José da Silva"
                autoComplete="name"
                disabled={pixLoading}
              />
            </label>
            <label className="field">
              <span className="field__label">Banco</span>
              <input
                type="text"
                className="field__input"
                value={draft.bank}
                onChange={(e) => updateDraft({ bank: e.target.value })}
                placeholder="Ex.: Nubank, Itaú"
                autoComplete="off"
                disabled={pixLoading}
              />
            </label>
            <label className="field">
              <span className="field__label">Chave PIX</span>
              <input
                type="text"
                className="field__input"
                value={draft.key}
                onChange={(e) => updateDraft({ key: e.target.value })}
                placeholder="CPF, e-mail, telefone ou aleatória"
                autoComplete="off"
                disabled={pixLoading}
              />
            </label>

            <button
              type="button"
              className="btn btn--primary profile-panel__save"
              disabled={pixLoading || pixSaving}
              onClick={handleSavePix}
            >
              {pixSaving ? "Salvando…" : "Salvar dados PIX"}
            </button>
          </section>

          {showNotifyButton && (
            <section className="profile-panel__section">
              <h3 className="profile-panel__section-title">Avisos</h3>
              <p className="profile-panel__hint">
                Receba notificação quando chegar pedido em aberto (útil no
                iPhone após instalar o app).
              </p>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={handleEnableNotifications}
              >
                Ativar avisos do navegador
              </button>
            </section>
          )}
        </div>

        <footer className="profile-panel__footer">
          <button
            type="button"
            className="btn btn--secondary profile-panel__logout"
            onClick={handleLogout}
          >
            Sair da conta
          </button>
        </footer>
      </div>
    </div>
  );
}
