'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function RegistrationForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        const f = new FormData(e.currentTarget);
        try {
          if (f.get('password') !== f.get('confirmation'))
            throw new Error('Les deux mots de passe ne correspondent pas.');
          const r = await fetch('/api/auth/sign-up/username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: f.get('username'), password: f.get('password') }),
          });
          if (!r.ok)
            throw new Error(
              r.status === 429
                ? 'Trop de tentatives. Réessayez plus tard.'
                : 'Inscription refusée. Ce pseudo peut déjà être utilisé ; vérifiez les champs.',
            );
          router.push('/quiz/niveaux');
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Pseudo
        <input
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_]+"
          required
          aria-describedby="pseudo-help"
        />
      </label>
      <p id="pseudo-help">
        De 3 à 30 lettres, chiffres ou tirets bas. Les majuscules et minuscules désignent le même
        compte.
      </p>
      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={14}
          maxLength={128}
          required
          aria-describedby="password-help"
        />
      </label>
      <p id="password-help">Au moins 14 caractères. Une phrase longue est facile à retenir.</p>
      <label>
        Confirmer le mot de passe
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={14}
          maxLength={128}
          required
        />
      </label>
      <p>
        Aucune adresse e-mail n’est demandée. Conservez votre pseudo et votre mot de passe : aucune
        récupération automatique par e-mail n’est disponible.
      </p>
      {error && <p role="alert">{error}</p>}
      <button className="button" disabled={pending}>
        {pending ? 'Création…' : 'Créer mon compte'}
      </button>
    </form>
  );
}
