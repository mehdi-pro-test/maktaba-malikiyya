'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
async function auth(path: string, body: unknown) {
  const response = await fetch('/api/auth/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error('Connexion refusée. Vérifiez les informations ou réessayez plus tard.');
  return data;
}
export function LoginForm() {
  const router = useRouter(),
    [factor, setFactor] = useState(false),
    [backup, setBackup] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        const values = new FormData(e.currentTarget);
        try {
          if (factor) {
            await auth(backup ? 'two-factor/verify-backup-code' : 'two-factor/verify-totp', {
              code: values.get('code'),
            });
            router.push('/admin');
            router.refresh();
          } else {
            const result = await auth('sign-in/email', {
              email: values.get('email'),
              password: values.get('password'),
            });
            if (result.twoFactorRedirect) setFactor(true);
            else {
              router.push('/admin/activation');
              router.refresh();
            }
          }
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      {factor ? (
        <>
          <label>
            {backup ? 'Code de secours' : 'Code de l’application d’authentification'}
            <input
              name="code"
              required
              autoComplete="one-time-code"
              inputMode={backup ? 'text' : 'numeric'}
              maxLength={backup ? 32 : 6}
            />
          </label>
          <button className="admin-link-button" type="button" onClick={() => setBackup(!backup)}>
            {backup ? 'Utiliser le code à six chiffres' : 'Utiliser un code de secours'}
          </button>
        </>
      ) : (
        <>
          <label>
            Adresse e-mail
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="button" disabled={pending}>
        {pending ? 'Vérification…' : factor ? 'Vérifier le second facteur' : 'Se connecter'}
      </button>
    </form>
  );
}
export function ActivationForm() {
  const router = useRouter(),
    [setup, setSetup] = useState<{ totpURI: string; backupCodes: string[] } | null>(null),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  return (
    <div>
      <p>Aucune donnée de la boutique n’est accessible avant la vérification du second facteur.</p>
      <form
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending) return;
          setPending(true);
          setError('');
          const values = new FormData(e.currentTarget);
          try {
            if (!setup) {
              const result = await auth('two-factor/enable', {
                password: values.get('password'),
                method: 'totp',
              });
              setSetup(result);
            } else {
              await auth('two-factor/verify-totp', { code: values.get('code') });
              router.push('/admin');
              router.refresh();
            }
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setPending(false);
          }
        }}
      >
        {!setup ? (
          <label>
            Confirmer le mot de passe
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
        ) : (
          <>
            <p>Ajoutez ce compte dans votre application d’authentification :</p>
            <p>
              <a href={setup.totpURI}>Ouvrir l’application d’authentification</a>
            </p>
            <label>
              Clé pour ajout manuel
              <input readOnly value={new URL(setup.totpURI).searchParams.get('secret') ?? ''} />
            </label>
            <h2>Codes de secours</h2>
            <p>Conservez-les hors ligne avant de continuer. Chaque code ne sert qu’une fois.</p>
            <ul className="admin-recovery">
              {setup.backupCodes.map((code) => (
                <li key={code}>
                  <code>{code}</code>
                </li>
              ))}
            </ul>
            <label>
              Code à six chiffres
              <input
                name="code"
                autoComplete="one-time-code"
                inputMode="numeric"
                required
                pattern="[0-9]{6}"
              />
            </label>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <button className="button" disabled={pending}>
          {pending
            ? 'Vérification…'
            : setup
              ? 'Activer et accéder à l’administration'
              : 'Configurer mon second facteur'}
        </button>
      </form>
    </div>
  );
}
export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="admin-link-button"
      onClick={async () => {
        await auth('sign-out', {});
        router.push('/admin/connexion');
        router.refresh();
      }}
    >
      Se déconnecter
    </button>
  );
}
export function RecoveryCodesForm() {
  const [codes, setCodes] = useState<string[]>([]),
    [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        try {
          const result = await auth('two-factor/generate-backup-codes', {
            password: new FormData(e.currentTarget).get('password'),
          });
          setCodes(result.backupCodes);
        } catch (error) {
          setError((error as Error).message);
        }
      }}
    >
      <label>
        Mot de passe
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <label>
        <input type="checkbox" required /> Remplacer les anciens codes de secours
      </label>
      <button className="button">Régénérer les codes</button>
      {error && <p role="alert">{error}</p>}
      {codes.length > 0 && (
        <div role="status">
          <p>Nouveaux codes à conserver hors ligne :</p>
          <ul>
            {codes.map((code) => (
              <li key={code}>
                <code>{code}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export function PasswordForm() {
  const router = useRouter(),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        const f = new FormData(e.currentTarget);
        if (f.get('newPassword') !== f.get('confirmation')) {
          setError('La confirmation ne correspond pas.');
          setPending(false);
          return;
        }
        try {
          await auth('change-password', {
            currentPassword: f.get('currentPassword'),
            newPassword: f.get('newPassword'),
            revokeOtherSessions: true,
          });
          router.push('/admin/connexion');
          router.refresh();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Mot de passe actuel
        <input name="currentPassword" type="password" autoComplete="current-password" required />
      </label>
      <label>
        Nouveau mot de passe
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={14}
          maxLength={128}
          required
        />
      </label>
      <label>
        Confirmer le nouveau mot de passe
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
        Toutes les sessions seront révoquées. Une nouvelle connexion avec second facteur sera
        nécessaire.
      </p>
      <button className="button" disabled={pending}>
        {pending ? 'Modification…' : 'Changer mon mot de passe'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
