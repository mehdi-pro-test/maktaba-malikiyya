'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { money } from '@/lib/rules';
type Result = {
  reference: string;
  status: string;
  totalCents: number;
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
        if (!r.ok) throw new Error('Cette confirmation est introuvable.');
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
                : result.status === 'REQUIRES_REVIEW'
                  ? 'N’effectuez pas de nouveau paiement. Une intervention du gestionnaire est nécessaire.'
                  : 'Nous attendons la confirmation sécurisée de Stripe. Cette page se met à jour automatiquement.'}
          </p>
          {result.status === 'PAID' && (
            <p>
              {result.emailDelivery?.status === 'SENT'
                ? 'Votre e-mail de confirmation a été envoyé.'
                : result.emailDelivery?.status === 'NOT_CONFIGURED'
                  ? 'L’e-mail n’a pas été envoyé : le service de messagerie n’est pas encore configuré.'
                  : 'L’e-mail de confirmation est en attente d’envoi.'}
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
