'use client';
import { BookImage } from '@/components/book-image';
import { adminLabel } from '@/lib/admin/labels';
import { money } from '@/lib/rules';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuizQuestion } from '@/lib/quiz';
import { quizContentSchema } from '@/lib/admin/validation';
import { QuizPreview } from '@/components/quiz-game';
type Data = Record<string, unknown>;
async function mutate(command: string, input: unknown) {
  const response = await fetch('/api/admin/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, input }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Enregistrement impossible');
  return data;
}
const str = (form: FormData, key: string) => String(form.get(key) ?? '');
const num = (form: FormData, key: string) => Number(str(form, key));
const nullable = (form: FormData, key: string) => (str(form, key) ? Number(str(form, key)) : null);
export function CommandForm({
  command,
  input,
  label,
  reason = false,
}: {
  command: string;
  input: Data;
  label: string;
  reason?: boolean;
}) {
  const router = useRouter(),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="admin-inline-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        const form = new FormData(e.currentTarget);
        try {
          await mutate(command, {
            ...input,
            ...(reason ? { reason: str(form, 'reason') } : {}),
            confirmed: true,
          });
          if (command === 'revoke-sessions') {
            router.push('/admin/connexion');
          } else router.refresh();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      {reason && (
        <label>
          Motif
          <input name="reason" required minLength={3} maxLength={500} />
        </label>
      )}
      <label>
        <input type="checkbox" required /> Je confirme : {label.toLowerCase()}
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Enregistrement…' : label}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
export function StockForm({
  product,
}: {
  product: { id: string; stockOnHand: number; reserved: number; titleFr: string };
}) {
  const router = useRouter(),
    key = useRef(crypto.randomUUID()),
    [mode, setMode] = useState('ADD'),
    [quantity, setQuantity] = useState(''),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [pending, setPending] = useState(false);
  const after =
    mode === 'COUNT'
      ? Number(quantity)
      : product.stockOnHand + (mode === 'ADD' ? Number(quantity) : -Number(quantity));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        setSuccess('');
        const values = new FormData(e.currentTarget);
        try {
          await mutate('stock', {
            productId: product.id,
            mode,
            quantity: Number(quantity),
            expectedOnHand: product.stockOnHand,
            reason: str(values, 'reason'),
            idempotencyKey: key.current,
          });
          key.current = crypto.randomUUID();
          setSuccess('Mouvement enregistré.');
          setQuantity('');
          router.refresh();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <h2>{product.titleFr}</h2>
      <label>
        Opération
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="ADD">Entrée / retour contrôlé</option>
          <option value="REMOVE">Sortie / perte / casse</option>
          <option value="COUNT">Inventaire physique compté</option>
        </select>
      </label>
      <label>
        Quantité
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min={mode === 'COUNT' ? 0 : 1}
          max={100000}
          required
        />
      </label>
      <label>
        Motif
        <input name="reason" required minLength={3} maxLength={500} />
      </label>
      <p>
        Physique : {product.stockOnHand} → {Number.isFinite(after) ? after : '—'} · Réservé :{' '}
        {product.reserved} · Disponible après : {Math.max(0, after - product.reserved)}
      </p>
      <label>
        <input type="checkbox" required /> Je confirme le comptage ou le mouvement et son motif.
      </label>
      <button className="button" disabled={pending || !quantity || after < product.reserved}>
        {pending ? 'Enregistrement…' : 'Enregistrer le mouvement'}
      </button>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </form>
  );
}
export function FulfillmentForm({
  order,
}: {
  order: {
    id: string;
    fulfillmentVersion: number;
    fulfillmentStatus: string;
    status: string;
    carrier: string | null;
    trackingNumber: string | null;
    internalNote: string | null;
  };
}) {
  const router = useRouter(),
    key = useRef(crypto.randomUUID()),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  const transitions: Record<string, string[]> = {
    UNFULFILLED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };
  if (order.status !== 'PAID')
    return (
      <p>
        La préparation et l’expédition seront disponibles après confirmation du paiement Stripe.
      </p>
    );
  if (!transitions[order.fulfillmentStatus]?.length)
    return <p>Aucune transition logistique disponible pour cet état.</p>;
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
          await mutate('fulfillment', {
            orderId: order.id,
            version: order.fulfillmentVersion,
            status: str(f, 'status'),
            carrier: str(f, 'carrier'),
            trackingNumber: str(f, 'trackingNumber'),
            note: str(f, 'note'),
            reason: str(f, 'reason'),
            idempotencyKey: key.current,
          });
          key.current = crypto.randomUUID();
          router.refresh();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <h2>Préparation et expédition</h2>
      <label>
        Nouvel état
        <select name="status">
          {transitions[order.fulfillmentStatus].map((status) => (
            <option key={status} value={status}>
              {adminLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Transporteur
        <input name="carrier" maxLength={100} defaultValue={order.carrier ?? ''} />
      </label>
      <label>
        Numéro de suivi
        <input name="trackingNumber" maxLength={160} defaultValue={order.trackingNumber ?? ''} />
      </label>
      <label>
        Note interne
        <textarea
          name="note"
          aria-label="Note interne"
          maxLength={2000}
          defaultValue={order.internalNote ?? ''}
        />
      </label>
      <label>
        Motif
        <input name="reason" required minLength={3} maxLength={500} />
      </label>
      <p>Une annulation logistique ne rembourse pas le paiement et ne réintègre pas de stock.</p>
      <label>
        <input type="checkbox" required /> Confirmer cette transition logistique
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Mettre à jour le suivi'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
export function ProductForm({
  product,
  categories,
}: {
  product: Data | null;
  categories: { id: string; nameFr: string }[];
}) {
  const router = useRouter(),
    formRef = useRef<HTMLFormElement>(null),
    [preview, setPreview] = useState<Data | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  const assets = Array.isArray(product?.coverAssets) ? (product.coverAssets as Data[]) : [];
  const cover = assets.find((a) => a.id === product?.coverAssetId);
  return (
    <>
      {' '}
      <form
        ref={formRef}
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending) return;
          setPending(true);
          setError('');
          setSuccess('');
          const f = new FormData(e.currentTarget);
          try {
            const result = await mutate('product', {
              ...(product ? { id: product.id, version: product.version } : {}),
              slug: str(f, 'slug'),
              titleFr: str(f, 'titleFr'),
              titleAr: str(f, 'titleAr'),
              descriptionFr: str(f, 'descriptionFr'),
              descriptionAr: str(f, 'descriptionAr'),
              categoryId: str(f, 'categoryId'),
              priceCents: num(f, 'priceCents'),
              lowStockThreshold: num(f, 'lowStockThreshold'),
              status: str(f, 'status'),
            });
            if (!product) router.push('/admin/catalogue/' + result.id);
            else {
              setSuccess('Fiche enregistrée.');
              router.refresh();
            }
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          Titre français
          <input
            name="titleFr"
            defaultValue={String(product?.titleFr ?? '')}
            required
            maxLength={200}
          />
        </label>
        <label>
          Titre arabe
          <input
            name="titleAr"
            lang="ar"
            dir="rtl"
            defaultValue={String(product?.titleAr ?? '')}
            required
            maxLength={300}
          />
        </label>
        <label>
          Lien du livre (immuable)
          <input
            name="slug"
            defaultValue={String(product?.slug ?? '')}
            readOnly={!!product}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
          />
        </label>
        <label>
          Description française
          <textarea
            name="descriptionFr"
            aria-label="Description française"
            defaultValue={String(product?.descriptionFr ?? '')}
            maxLength={10000}
          />
        </label>
        <label>
          Description arabe
          <textarea
            name="descriptionAr"
            aria-label="Description arabe"
            lang="ar"
            dir="rtl"
            defaultValue={String(product?.descriptionAr ?? '')}
            maxLength={10000}
          />
        </label>
        <label>
          Catégorie
          <select name="categoryId" defaultValue={String(product?.categoryId ?? '')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameFr}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prix en centimes EUR
          <input
            type="number"
            name="priceCents"
            min={0}
            max={10000000}
            defaultValue={Number(product?.priceCents ?? 0)}
            required
          />
          <small>Exemple : 1500 = 15,00 €. Les commandes passées gardent leur prix.</small>
        </label>
        <label>
          Seuil de stock faible
          <input
            type="number"
            name="lowStockThreshold"
            min={0}
            max={100000}
            defaultValue={Number(product?.lowStockThreshold ?? 3)}
            required
          />
        </label>
        <label>
          Visibilité
          <select name="status" defaultValue={String(product?.adminStatus ?? 'DRAFT')}>
            <option value="DRAFT">Brouillon</option>
            {product && <option value="PUBLISHED">Publié</option>}
            {product && <option value="ARCHIVED">Archivé</option>}
          </select>
        </label>
        <p>
          La quantité se gère dans <Link href="/admin/stocks">Stocks</Link>. Un nouveau livre
          commence à zéro, en brouillon.
        </p>
        <label>
          <input type="checkbox" required /> Je confirme les informations et la visibilité.
        </label>
        <button className="button" disabled={pending}>
          {pending ? 'Enregistrement…' : product ? 'Enregistrer le livre' : 'Créer le brouillon'}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            const form = new FormData(formRef.current!);
            const price = num(form, 'priceCents');
            if (!Number.isInteger(price) || price < 0) {
              setError('Prix en centimes entiers requis.');
              return;
            }
            setPreview({
              titleFr: str(form, 'titleFr'),
              titleAr: str(form, 'titleAr'),
              descriptionFr: str(form, 'descriptionFr'),
              descriptionAr: str(form, 'descriptionAr'),
              priceCents: price,
            });
          }}
        >
          Prévisualiser la fiche
        </button>
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
      </form>
      {preview && (
        <section className="admin-preview">
          <h2>Aperçu de la fiche · non publié</h2>
          <div className="admin-cover-preview">
            <BookImage
              src={String(cover?.url ?? product?.imagePath ?? '/images/book-fallback.svg')}
              title={String(preview.titleFr ?? 'Livre')}
            />
          </div>
          <h3>{String(preview.titleFr)}</h3>
          <p lang="ar" dir="rtl">
            {String(preview.titleAr)}
          </p>
          <p>{money(Number(preview.priceCents))}</p>
          <p>{String(preview.descriptionFr)}</p>
          <p lang="ar" dir="rtl">
            {String(preview.descriptionAr)}
          </p>
        </section>
      )}
    </>
  );
}
export function CoverForm({
  productId,
  version,
  ready,
}: {
  productId: string;
  version: number;
  ready: boolean;
}) {
  const router = useRouter(),
    [preview, setPreview] = useState(''),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending || !ready) return;
        setPending(true);
        setError('');
        const f = new FormData(e.currentTarget);
        f.set('productId', productId);
        f.set('version', String(version));
        try {
          const response = await fetch('/api/admin/couvertures', { method: 'POST', body: f });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          router.refresh();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <h2>Couverture</h2>
      {!ready && (
        <p role="status">Téléversement indisponible : stockage persistant à configurer.</p>
      )}
      <label>
        Image PNG, JPEG ou WebP · 3 Mo maximum
        <input
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          disabled={!ready}
          onChange={(e) => {
            if (preview) URL.revokeObjectURL(preview);
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : '');
          }}
        />
      </label>
      {preview && (
        <div
          className="admin-cover-preview"
          style={{ backgroundImage: `url(${preview})` }}
          role="img"
          aria-label="Aperçu de la couverture avant enregistrement"
        />
      )}
      <label>
        Description de l’image
        <input name="alt" required minLength={3} maxLength={300} disabled={!ready} />
      </label>
      <label>
        <input type="checkbox" name="rights" required disabled={!ready} /> Je dispose des droits
        nécessaires pour publier cette image.
      </label>
      <button className="button" disabled={!ready || pending}>
        {pending ? 'Téléversement…' : 'Enregistrer cette couverture'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
export function QuizEditor({
  books,
  initial,
}: {
  books: { id: string; titleFr: string; titleAr: string; authorAr: string; level: string }[];
  initial: {
    id?: string;
    version: number;
    bookId: string;
    content: import('@/lib/admin/validation').QuizDraftContent;
    globalEligible: boolean;
    sourceVerification: string;
    excluded: boolean;
  };
}) {
  const router = useRouter(),
    creationKey = useRef(crypto.randomUUID()),
    formRef = useRef<HTMLFormElement>(null),
    [bookId, setBookId] = useState(initial.bookId),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [preview, setPreview] = useState<QuizQuestion | null>(null);
  const book = books.find((b) => b.id === bookId)!;
  const content = (f: FormData) => ({
    questionFr: str(f, 'questionFr'),
    options: ['a', 'b', 'c', 'd'].map((id) => ({
      id: id as 'a' | 'b' | 'c' | 'd',
      textFr: str(f, 'option-' + id),
    })),
    correctOptionId: (str(f, 'correctOptionId') || null) as 'a' | 'b' | 'c' | 'd' | null,
    explanationFr: str(f, 'explanationFr'),
    reference: {
      workTitleAr: str(f, 'workTitleAr'),
      authorAr: str(f, 'authorAr'),
      sectionAr: str(f, 'sectionAr'),
      quoteAr: str(f, 'quoteAr'),
      url: str(f, 'url'),
      edition: str(f, 'edition') || null,
      printedPage: nullable(f, 'printedPage'),
      pdfPage: nullable(f, 'pdfPage'),
    },
  });
  return (
    <>
      <form
        ref={formRef}
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending) return;
          setPending(true);
          setError('');
          setSuccess('');
          const f = new FormData(e.currentTarget);
          try {
            const result = await mutate('quiz-save', {
              ...(initial.id ? { id: initial.id } : { creationKey: creationKey.current }),
              bookId,
              version: initial.version,
              content: content(f),
              globalEligible: !initial.excluded && f.has('globalEligible'),
              sourceVerification: str(f, 'sourceVerification'),
              reason: str(f, 'reason'),
            });
            if (!initial.id) router.push('/admin/quiz/' + result.id);
            else {
              setSuccess(
                'Nouvelle révision enregistrée en brouillon. La version publiée est conservée.',
              );
              router.refresh();
            }
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          Ouvrage et niveau
          <select
            value={bookId}
            disabled={!!initial.id}
            onChange={(e) => setBookId(e.target.value)}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.titleFr} · {b.level}
              </option>
            ))}
          </select>
        </label>
        <label>
          Question française
          <textarea
            name="questionFr"
            aria-label="Question française"
            defaultValue={initial.content.questionFr}
            required
            maxLength={1500}
          />
        </label>
        <fieldset>
          <legend>Quatre propositions et bonne réponse</legend>
          {['a', 'b', 'c', 'd'].map((id) => (
            <div className="admin-option" key={id}>
              <label>
                Proposition {id.toUpperCase()}
                <input
                  name={'option-' + id}
                  defaultValue={initial.content.options.find((o) => o.id === id)?.textFr ?? ''}
                  maxLength={700}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="correctOptionId"
                  value={id}
                  defaultChecked={initial.content.correctOptionId === id}
                />{' '}
                Bonne réponse {id.toUpperCase()}
              </label>
            </div>
          ))}
        </fieldset>
        <label>
          Explication française
          <textarea
            name="explanationFr"
            aria-label="Explication française"
            defaultValue={initial.content.explanationFr}
            maxLength={7000}
          />
        </label>
        <fieldset key={bookId}>
          <legend>Référence arabe · obligatoire à la publication</legend>
          {(['workTitleAr', 'authorAr', 'sectionAr', 'quoteAr'] as const).map((key) => (
            <label key={key}>
              {
                {
                  workTitleAr: 'Titre arabe',
                  authorAr: 'Auteur arabe',
                  sectionAr: 'Chapitre arabe',
                  quoteAr: 'Citation arabe exacte',
                }[key]
              }
              <textarea
                lang="ar"
                dir="rtl"
                name={key}
                aria-label={
                  {
                    workTitleAr: 'Titre arabe',
                    authorAr: 'Auteur arabe',
                    sectionAr: 'Chapitre arabe',
                    quoteAr: 'Citation arabe exacte',
                  }[key]
                }
                maxLength={1500}
                defaultValue={
                  initial.content.reference[key] ||
                  (key === 'workTitleAr' ? book.titleAr : key === 'authorAr' ? book.authorAr : '')
                }
              />
            </label>
          ))}
          <label>
            URL de la source HTTPS
            <input name="url" defaultValue={initial.content.reference.url} maxLength={2000} />
          </label>
          <label>
            Édition vérifiée
            <input
              name="edition"
              defaultValue={initial.content.reference.edition ?? ''}
              maxLength={500}
            />
          </label>
          <label>
            Page imprimée vérifiée
            <input
              name="printedPage"
              type="number"
              min={1}
              defaultValue={initial.content.reference.printedPage ?? ''}
            />
          </label>
          <label>
            Page PDF vérifiée
            <input
              name="pdfPage"
              type="number"
              min={1}
              defaultValue={initial.content.reference.pdfPage ?? ''}
            />
          </label>
        </fieldset>
        <label>
          Vérification déclarée de la source
          <select name="sourceVerification" defaultValue={initial.sourceVerification}>
            <option value="NOT_ATTESTED">Collation non attestée</option>
            <option value="OWNER_COLLATED">
              Collation effectuée et déclarée par moi, propriétaire
            </option>
          </select>
        </label>
        <p>Aucune certification religieuse indépendante n’est créée par la publication.</p>
        <label>
          <input
            type="checkbox"
            name="globalEligible"
            defaultChecked={initial.globalEligible && !initial.excluded}
            disabled={initial.excluded}
          />{' '}
          Cette question est autonome et adaptée au mode global.
        </label>
        {initial.excluded && (
          <p>
            Une exclusion qualité historique reste active sur cet identifiant. Cette case ne permet
            pas de la contourner.
          </p>
        )}
        <label>
          Motif de cette révision
          <input name="reason" required minLength={3} maxLength={500} />
        </label>
        <div className="admin-actions">
          <button className="button" disabled={pending}>
            {pending ? 'Enregistrement…' : 'Enregistrer une révision en brouillon'}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setError('');
              const result = quizContentSchema.safeParse(content(new FormData(formRef.current!)));
              if (!result.success) {
                setError(
                  'Complétez les quatre choix, la bonne réponse, l’explication et la source pour prévisualiser.',
                );
                return;
              }
              const q = result.data;
              setPreview({
                id: 'preview',
                status: 'published',
                category: 'fiqh',
                type: 'single',
                order: 1,
                promptFr: q.questionFr,
                options: q.options.map((o) => ({ id: o.id, label: o.textFr })),
                correctOptionIds: [q.correctOptionId],
                explanationFr: q.explanationFr,
                origin: {
                  bookId: book.id,
                  titleFr: book.titleFr,
                  titleAr: book.titleAr,
                  levelLabel: book.level,
                },
                sources: [
                  {
                    title: q.reference.workTitleAr,
                    url: q.reference.url,
                    reference: { ...q.reference, quoteLayer: 'owner-provided', locator: '' },
                  },
                ],
              });
            }}
          >
            Prévisualiser côté joueur
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
      </form>
      {preview && (
        <section className="admin-preview">
          <h2>Aperçu du brouillon · non publié</h2>
          <QuizPreview key={JSON.stringify(preview)} question={preview} />
        </section>
      )}
    </>
  );
}
