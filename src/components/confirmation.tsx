'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { money } from '@/lib/rules';
type Result = {
  reference: string;
  status: string;
  totalCents: number;
  subtotalCents?: number;
  shippingCents?: number;
  items?: { titleFr: string; quantity: number; unitPriceCents: number }[];
  emailDelivery: { status: string } | null;
};
export function Confirmation({ token }: { token: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const { clear } = useCart();
  useEffect(() => {
    let mounted = true;
    const read = async () => {
      try {
        const r = await fetch(`/api/orders?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        if (!r.ok)
          throw new Error(
            r.status === 404
              ? 'Cette confirmation est introuvable.'
              : 'La vérification est momentanément indisponible. Réessayez dans un instant.',
          );
        const data = await r.json();
        if (mounted) {
          setResult(data);
          setError('');
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Vérification indisponible.');
      }
    };
    void read();
    const timer = setInterval(read, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [token]);
  useEffect(() => {
    if (result?.status === 'PAID') clear();
  }, [result?.status, clear]);
  return (
    <div className="confirmation">
      <span className="eyebrow">MAKTABA MALIKIYA · COMMANDE TEST</span>
      <h1 aria-live="polite">
        {result?.status === 'PAID'
          ? 'Merci pour votre confiance.'
          : result?.status === 'EXPIRED'
            ? 'Votre session a expiré.'
            : result?.status === 'CANCELLED'
              ? 'Votre commande a été annulée.'
              : result?.status === 'REQUIRES_REVIEW'
                ? 'Votre commande nécessite une vérification.'
                : 'En attente de confirmation.'}
      </h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : result ? (
        <>
          <p>
            Commande <strong>{result.reference}</strong> · {money(result.totalCents)}
          </p>
          <p>
            {result.status === 'PAID'
              ? 'Votre paiement de test est confirmé. Aucun débit réel n’a été effectué.'
              : result.status === 'EXPIRED'
                ? 'Le stock a été libéré. Vous pouvez recommencer votre commande.'
                : result.status === 'CANCELLED'
                  ? 'Aucun paiement n’est confirmé pour cette commande.'
                  : result.status === 'REQUIRES_REVIEW'
                    ? 'N’effectuez pas de nouveau paiement. Une intervention du gestionnaire est nécessaire.'
                    : 'Nous attendons la confirmation sécurisée de Stripe. Cette page se met à jour automatiquement.'}
          </p>
          <div className="confirmation-details">
            <dl>
              <div>
                <dt>Référence</dt>
                <dd>{result.reference}</dd>
              </div>
              <div>
                <dt>Paiement de test</dt>
                <dd>
                  {result.status === 'PAID'
                    ? 'Confirmé'
                    : result.status === 'PENDING_PAYMENT'
                      ? 'En attente'
                      : result.status === 'EXPIRED'
                        ? 'Session expirée'
                        : result.status === 'CANCELLED'
                          ? 'Annulé'
                          : 'Vérification nécessaire'}
                </dd>
              </div>
              <div>
                <dt>Total de la commande</dt>
                <dd>{money(result.totalCents)}</dd>
              </div>
              {result.items?.map((item, i) => (
                <div key={i}>
                  <dt>
                    {item.quantity} × {item.titleFr}
                  </dt>
                  <dd>{money(item.unitPriceCents * item.quantity)}</dd>
                </div>
              ))}
              {result.shippingCents !== undefined && (
                <div>
                  <dt>Livraison</dt>
                  <dd>{result.shippingCents === 0 ? 'Offerte' : money(result.shippingCents)}</dd>
                </div>
              )}
              <div>
                <dt>Confirmation par e-mail</dt>
                <dd>
                  {result.status !== 'PAID'
                    ? 'Après confirmation du paiement'
                    : result.emailDelivery?.status === 'SENT'
                      ? 'Envoyée'
                      : result.emailDelivery?.status === 'NOT_CONFIGURED'
                        ? 'Non envoyée — service non configuré'
                        : result.emailDelivery?.status === 'FAILED'
                          ? 'Échec de l’envoi, réessai nécessaire'
                          : result.emailDelivery?.status === 'REQUIRES_REVIEW'
                            ? 'Vérification nécessaire'
                            : 'En attente d’envoi'}
                </dd>
              </div>
            </dl>
          </div>
          {result.status === 'PAID' && (
            <p>
              {result.emailDelivery?.status === 'SENT'
                ? 'Votre e-mail de confirmation a été envoyé.'
                : result.emailDelivery?.status === 'NOT_CONFIGURED'
                  ? 'L’e-mail n’a pas été envoyé : le service de messagerie n’est pas encore configuré.'
                  : result.emailDelivery?.status === 'FAILED'
                    ? 'Votre commande est confirmée. L’envoi de l’e-mail a échoué et nécessite un réessai.'
                    : result.emailDelivery?.status === 'REQUIRES_REVIEW'
                      ? 'Votre commande est confirmée. L’envoi de l’e-mail nécessite une vérification.'
                      : 'Votre commande est confirmée. L’e-mail de confirmation est en attente d’envoi.'}
            </p>
          )}
        </>
      ) : (
        <p>Vérification de votre commande…</p>
      )}
      <Link href="/" className="button">
        Retour à la librairie
      </Link>
    </div>
  );
}
