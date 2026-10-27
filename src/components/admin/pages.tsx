import 'server-only';
import { adminLabel } from '@/lib/admin/labels';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  dashboard,
  orders,
  orderDetail,
  stockData,
  catalogData,
  productDetail,
  quizData,
  activityData,
  queryText,
  type Search,
} from '@/lib/admin/read';
import { requireOwnerPage } from '@/lib/admin/session';
import { globalQualityReview } from '@/lib/quiz-global-quality';
import { quizDraftContentSchema, type QuizDraftContent } from '@/lib/admin/validation';
import { quizLevels } from '@/lib/quiz-v12';
import { money } from '@/lib/rules';
import {
  CommandForm,
  StockForm,
  FulfillmentForm,
  ProductForm,
  CoverForm,
  QuizEditor,
} from './forms';
import { RecoveryCodesForm, PasswordForm } from './auth-forms';
const date = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));
const badge = (s: string) => <span className="admin-badge">{adminLabel(s)}</span>;
export async function DashboardPage() {
  const data = await dashboard();
  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="admin-kpis">
        {[
          ['Commandes payées TEST', data.paid],
          ['À préparer / expédier', data.prepare],
          ['Chiffre d’affaires TEST', money(data.revenue)],
          ['Stock faible ou épuisé', data.low.length],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <p>
        {data.pending} paiement(s) en attente · {data.review} anomalie(s) à examiner.
      </p>
      <div className="admin-columns">
        <section className="admin-panel">
          <h2>Commandes récentes</h2>
          {data.recent.length ? (
            data.recent.map((o) => (
              <p key={o.id}>
                <Link href={'/admin/commandes/' + o.id}>{o.reference}</Link> · {date(o.createdAt)} ·{' '}
                {money(o.totalCents)} {badge(o.status)} {badge(o.fulfillmentStatus)}
              </p>
            ))
          ) : (
            <p>Aucune commande reçue.</p>
          )}
          <Link href="/admin/commandes">Toutes les commandes</Link>
        </section>
        <section className="admin-panel">
          <h2>À réapprovisionner</h2>
          {data.low.length ? (
            data.low.map((p) => (
              <p key={p.id}>
                <Link href={'/admin/stocks?produit=' + p.id}>{p.titleFr}</Link> : {p.available}{' '}
                disponible(s), seuil {p.lowStockThreshold}
              </p>
            ))
          ) : (
            <p>Aucune alerte de stock.</p>
          )}
        </section>
      </div>
      <section className="admin-panel">
        <h2>Activité récente</h2>
        {data.activity.map((a) => (
          <p key={a.id}>
            {date(a.occurredAt)} · {adminLabel(a.action)} · {adminLabel(a.entityType)}
          </p>
        ))}
        {!data.activity.length && <p>Aucune modification administrateur.</p>}
      </section>
    </>
  );
}
export async function OrdersPage({ search }: { search: Search }) {
  const data = await orders(search);
  const params = new URLSearchParams(
    Object.entries(search).filter((e): e is [string, string] => typeof e[1] === 'string'),
  );
  return (
    <>
      <h1>Commandes</h1>
      <form className="admin-filters">
        <label>
          Référence ou e-mail
          <input name="q" defaultValue={queryText(search, 'q')} />
        </label>
        <label>
          Paiement
          <select name="paiement" defaultValue={queryText(search, 'paiement')}>
            <option value="">Tous</option>
            {['PAID', 'PENDING_PAYMENT', 'EXPIRED', 'REQUIRES_REVIEW'].map((s) => (
              <option key={s} value={s}>
                {adminLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Logistique
          <select name="livraison" defaultValue={queryText(search, 'livraison')}>
            <option value="">Tous</option>
            {['UNFULFILLED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>
                {adminLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pays (code ISO)
          <input
            name="pays"
            maxLength={2}
            pattern="[A-Za-z]{2}"
            placeholder="FR"
            defaultValue={queryText(search, 'pays')}
          />
        </label>
        <label>
          Du
          <input type="date" name="debut" defaultValue={queryText(search, 'debut')} />
        </label>
        <label>
          Au
          <input type="date" name="fin" defaultValue={queryText(search, 'fin')} />
        </label>
        <button className="button">Filtrer</button>
      </form>
      <p>{data.count} commande(s). Montants Stripe TEST.</p>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Client</th>
              <th>Pays</th>
              <th>Lignes</th>
              <th>Total TEST</th>
              <th>Paiement</th>
              <th>Logistique</th>
              <th>Suivi</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((o) => (
              <tr key={o.id}>
                <td data-label="Référence">
                  <Link href={'/admin/commandes/' + o.id}>{o.reference}</Link>
                </td>
                <td data-label="Date">{date(o.createdAt)}</td>
                <td data-label="Client">{o.email.replace(/^(.).+(@.*)$/, '$1…$2')}</td>
                <td data-label="Pays">{o.countryCode}</td>
                <td data-label="Lignes">{o._count.items}</td>
                <td data-label="Total TEST">{money(o.totalCents)}</td>
                <td data-label="Paiement">{badge(o.status)}</td>
                <td data-label="Logistique">{badge(o.fulfillmentStatus)}</td>
                <td data-label="Suivi">
                  {o.trackingNumber ? (
                    <>
                      {o.carrier} · {o.trackingNumber}
                    </>
                  ) : (
                    'Non renseigné'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.rows.length && <p>Aucune commande correspondant aux filtres.</p>}
      <div className="admin-actions">
        {data.page > 1 && (
          <Link
            href={
              '?' +
              new URLSearchParams({ ...Object.fromEntries(params), page: String(data.page - 1) })
            }
          >
            Page précédente
          </Link>
        )}
        {data.page * 25 < data.count && (
          <Link
            href={
              '?' +
              new URLSearchParams({ ...Object.fromEntries(params), page: String(data.page + 1) })
            }
          >
            Page suivante
          </Link>
        )}
        <a href={'/api/admin/export-commandes?' + params}>
          Exporter ces filtres en CSV (1 000 maximum)
        </a>
      </div>
      <p>L’export standard n’inclut pas les adresses e-mail.</p>
    </>
  );
}
export async function OrderPage({ id }: { id: string }) {
  const order = await orderDetail(id);
  if (!order) notFound();
  return (
    <>
      <Link href="/admin/commandes">← Commandes</Link>
      <h1>{order.reference}</h1>
      <p>
        Paiement Stripe TEST : {badge(order.status)} · Logistique : {badge(order.fulfillmentStatus)}
      </p>
      <div className="admin-columns">
        <section className="admin-panel">
          <h2>Livraison</h2>
          <p>
            {order.recipient}
            <br />
            {order.address}
            <br />
            {order.addressExtra}
            <br />
            {order.postalCode} {order.city}
            <br />
            {order.countryCode}
          </p>
          <p>{order.email}</p>
        </section>
        <section className="admin-panel">
          <h2>Paiement et articles</h2>
          {order.items.map((i) => (
            <p key={i.id}>
              {i.quantity} × {i.titleFr} · {money(i.unitPriceCents)}
            </p>
          ))}
          <p>
            Sous-total : {money(order.subtotalCents)} · Livraison : {money(order.shippingCents)} ·
            Total TEST : {money(order.totalCents)}
          </p>
          <p>Session Stripe (lecture seule) : {order.stripeSessionId ?? 'Non créée'}</p>
          <p>E-mail : {order.emailDelivery?.status ?? 'Aucun envoi enregistré'}</p>
        </section>
      </div>
      <section className="admin-panel">
        <h2>Suivi et note interne</h2>
        <p>
          Transporteur : {order.carrier ?? 'Non renseigné'} · Suivi :{' '}
          {order.trackingNumber ?? 'Non renseigné'}
        </p>
        <p>
          Expédiée le : {order.shippedAt ? date(order.shippedAt) : 'Non expédiée'} · Livrée le :{' '}
          {order.deliveredAt ? date(order.deliveredAt) : 'Non livrée'}
        </p>
        <p style={{ whiteSpace: 'pre-wrap' }}>{order.internalNote || 'Aucune note interne.'}</p>
      </section>
      <FulfillmentForm
        order={{
          id: order.id,
          fulfillmentStatus: order.fulfillmentStatus,
          fulfillmentVersion: order.fulfillmentVersion,
          status: order.status,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          internalNote: order.internalNote,
        }}
      />
      <section className="admin-panel">
        <h2>Historique logistique</h2>
        {order.fulfillmentEvents.map((e) => (
          <p key={e.id}>
            {date(e.createdAt)} · {adminLabel(e.fromStatus)} → {adminLabel(e.toStatus)} · {e.reason}
            {e.trackingNumber && <> · Suivi : {e.trackingNumber}</>}
          </p>
        ))}
        {!order.fulfillmentEvents.length && <p>Aucune transition logistique.</p>}
      </section>
    </>
  );
}
export async function StocksPage({ search }: { search: Search }) {
  const data = await stockData(),
    q = queryText(search, 'q').toLocaleLowerCase('fr');
  const list = data.products.filter(
    (p) =>
      (!q || p.titleFr.toLocaleLowerCase('fr').includes(q)) &&
      (queryText(search, 'alerte') !== 'oui' || p.available <= p.lowStockThreshold),
  );
  const selected = data.products.find((p) => p.id === queryText(search, 'produit'));
  return (
    <>
      <h1>Stocks et inventaire</h1>
      <p>
        Disponible = physique − réservations actives. Les paiements consomment déjà leurs
        réservations.
      </p>
      <form className="admin-filters">
        <label>
          Livre
          <input name="q" defaultValue={q} />
        </label>
        <label>
          <input
            type="checkbox"
            name="alerte"
            value="oui"
            defaultChecked={queryText(search, 'alerte') === 'oui'}
          />{' '}
          Stock faible
        </label>
        <button className="button">Filtrer</button>
      </form>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Livre</th>
              <th>Physique</th>
              <th>Réservé</th>
              <th>Disponible</th>
              <th>Seuil</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td data-label="Livre">{p.titleFr}</td>
                <td data-label="Physique">{p.stockOnHand}</td>
                <td data-label="Réservé">{p.reserved}</td>
                <td data-label="Disponible">{p.available}</td>
                <td data-label="Seuil">{p.lowStockThreshold}</td>
                <td data-label="Action">
                  <Link href={'?produit=' + p.id}>Ajuster</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <StockForm product={selected} />}
      <section className="admin-panel">
        <h2>Derniers mouvements manuels</h2>
        {data.movements.map((m) => (
          <p key={m.id}>
            {date(m.createdAt)} · {m.product.titleFr} · {m.beforeOnHand} → {m.afterOnHand} (
            {m.delta > 0 ? '+' : ''}
            {m.delta}) · {m.reason}
          </p>
        ))}
        {!data.movements.length && <p>Aucun mouvement manuel enregistré.</p>}
      </section>
    </>
  );
}
export async function CatalogPage({ search }: { search: Search }) {
  const data = await catalogData(),
    q = queryText(search, 'q').toLocaleLowerCase('fr');
  return (
    <>
      <h1>Catalogue</h1>
      <Link className="button" href="/admin/catalogue/nouveau">
        Ajouter un livre
      </Link>
      <form className="admin-filters">
        <label>
          Rechercher
          <input name="q" defaultValue={q} />
        </label>
        <label>
          Visibilité
          <select name="statut" defaultValue={queryText(search, 'statut')}>
            <option value="">Toutes</option>
            {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((s) => (
              <option key={s} value={s}>
                {adminLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <button className="button">Filtrer</button>
      </form>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Livre</th>
              <th>Prix</th>
              <th>Visibilité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.products
              .filter(
                (p) =>
                  (!q || p.titleFr.toLocaleLowerCase('fr').includes(q)) &&
                  (!queryText(search, 'statut') || p.adminStatus === queryText(search, 'statut')),
              )
              .map((p) => (
                <tr key={p.id}>
                  <td data-label="Livre">{p.titleFr}</td>
                  <td data-label="Prix">{money(p.priceCents)}</td>
                  <td data-label="Visibilité">{badge(p.active ? 'PUBLISHED' : p.adminStatus)}</td>
                  <td data-label="Action">
                    <Link href={'/admin/catalogue/' + p.id}>Modifier</Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <h2>Brouillons historiques en préparation</h2>
      {data.drafts.map((d) => (
        <section className="admin-panel" key={d.id}>
          <h3>{d.titleFr}</h3>
          <p>Les données proposées seront conservées ; la quantité sera à confirmer dans Stocks.</p>
          <CommandForm
            command="adopt-draft"
            input={{ id: d.id }}
            label="Gérer ce brouillon dans le catalogue"
          />
        </section>
      ))}
    </>
  );
}
export async function ProductPage({ id }: { id?: string }) {
  const data = await productDetail(id);
  if (id && !data.product) notFound();
  const p = data.product;
  return (
    <>
      <Link href="/admin/catalogue">← Catalogue</Link>
      <h1>{p ? p.titleFr : 'Nouveau livre'}</h1>
      {p?.active && (
        <Link href={'/livres/' + p.slug} target="_blank">
          Voir la fiche publique
        </Link>
      )}
      {data.historicalDraft && (
        <section className="admin-panel">
          <h2>Brouillon d’origine conservé</h2>
          <p>
            Prix proposé :{' '}
            {data.historicalDraft.priceCents === null
              ? 'non renseigné'
              : money(data.historicalDraft.priceCents)}{' '}
            · Quantité proposée : {data.historicalDraft.stockOnHand ?? 'non renseignée'}.
            Enregistrez toute quantité physique via Stocks.
          </p>
        </section>
      )}
      <ProductForm product={p ? serialize(p) : null} categories={data.categories} />
      {p && (
        <>
          <CoverForm productId={p.id} version={p.version} ready={data.storageReady} />
          <section className="admin-panel">
            <h2>Historique des couvertures</h2>
            {p.coverAssets.map((asset) => (
              <div key={asset.id}>
                <p>
                  {date(asset.createdAt)} · {asset.alt} · {asset.width} × {asset.height}
                </p>
                {p.coverAssetId !== asset.id && (
                  <CommandForm
                    command="restore-cover"
                    input={{ productId: p.id, assetId: asset.id, version: p.version }}
                    label="Restaurer cette couverture"
                  />
                )}
              </div>
            ))}
            {!p.coverAssets.length && (
              <p>Aucune couverture téléversée. La couverture historique est conservée.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
export async function QuizListPage({ search }: { search: Search }) {
  const data = await quizData(),
    byId = new Map(
      data.baseline.map((q) => [
        q.id,
        {
          id: q.id,
          bookId: q.origin!.bookId,
          prompt: q.promptFr,
          status: 'PUBLISHED',
          draft: false,
        },
      ]),
    );
  for (const r of data.records) {
    const newest = r.revisions[0];
    byId.set(r.id, {
      id: r.id,
      bookId: r.bookId,
      prompt:
        (newest ?? r.activeRevision)
          ? quizDraftContentSchema.parse((newest ?? r.activeRevision)!.content).questionFr
          : (byId.get(r.id)?.prompt ?? r.id),
      status: r.archivedAt
        ? 'ARCHIVED'
        : r.activeRevision || byId.has(r.id)
          ? 'PUBLISHED'
          : 'DRAFT',
      draft: newest?.status === 'DRAFT',
    });
  }
  const q = queryText(search, 'q').toLocaleLowerCase('fr'),
    bookId = queryText(search, 'ouvrage'),
    level = queryText(search, 'niveau'),
    status = queryText(search, 'statut');
  const rows = [...byId.values()].filter(
    (r) =>
      (!bookId || r.bookId === bookId) &&
      (!level || data.books.find((b) => b.id === r.bookId)?.level === level) &&
      (!status || r.status === status) &&
      (!q || r.prompt.toLocaleLowerCase('fr').includes(q)),
  );
  const page = Math.max(1, Number(queryText(search, 'page')) || 1);
  return (
    <>
      <h1>Questions et références</h1>
      <p>
        {data.enabled
          ? 'Publications en base intégrées aux quiz sans redéploiement.'
          : 'Activation publique des révisions en base désactivée : les quiz utilisent encore les banques historiques.'}
      </p>
      <Link className="button" href="/admin/quiz/nouvelle">
        Ajouter une question
      </Link>
      <form className="admin-filters">
        <label>
          Rechercher
          <input name="q" defaultValue={q} />
        </label>
        <label>
          Niveau
          <select name="niveau" defaultValue={level}>
            <option value="">Tous</option>
            {quizLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ouvrage
          <select name="ouvrage" defaultValue={bookId}>
            <option value="">Tous</option>
            {data.books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.titleFr}
              </option>
            ))}
          </select>
        </label>
        <label>
          État
          <select name="statut" defaultValue={status}>
            <option value="">Tous</option>
            {['PUBLISHED', 'DRAFT', 'ARCHIVED'].map((s) => (
              <option key={s} value={s}>
                {adminLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <button className="button">Filtrer</button>
      </form>
      <p>{rows.length} question(s) correspondant aux filtres.</p>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Ouvrage</th>
              <th>État</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * 25, page * 25).map((r) => (
              <tr key={r.id}>
                <td data-label="Question">{r.prompt}</td>
                <td data-label="Ouvrage">{data.books.find((b) => b.id === r.bookId)?.titleFr}</td>
                <td data-label="État">
                  {badge(r.status)}
                  {r.draft && badge('Nouvelle révision en brouillon')}
                </td>
                <td data-label="Action">
                  <Link href={'/admin/quiz/' + r.id}>Éditer</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-actions">
        {page > 1 && (
          <Link
            href={
              '?' +
              new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(search).filter(
                    (x): x is [string, string] => typeof x[1] === 'string',
                  ),
                ),
                page: String(page - 1),
              })
            }
          >
            Page précédente
          </Link>
        )}
        {page * 25 < rows.length && (
          <Link
            href={
              '?' +
              new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(search).filter(
                    (x): x is [string, string] => typeof x[1] === 'string',
                  ),
                ),
                page: String(page + 1),
              })
            }
          >
            Page suivante
          </Link>
        )}
      </div>
    </>
  );
}
export async function QuizPage({ id }: { id?: string }) {
  const data = await quizData(),
    record = data.records.find((r) => r.id === id),
    baseline = data.baseline.find((q) => q.id === id);
  if (id && !record && !baseline) notFound();
  const latest =
      record?.revisions[0]?.status === 'DRAFT'
        ? record.revisions[0]
        : (record?.activeRevision ?? (baseline ? undefined : record?.revisions[0])),
    book =
      data.books.find((b) => b.id === (record?.bookId ?? baseline?.origin?.bookId)) ??
      data.books[0];
  const r = baseline?.sources?.[0]?.reference;
  const content: QuizDraftContent = latest
    ? quizDraftContentSchema.parse(latest.content)
    : {
        questionFr: baseline?.promptFr ?? '',
        options: baseline
          ? baseline.options.map((o) => ({ id: o.id as 'a' | 'b' | 'c' | 'd', textFr: o.label }))
          : ['a', 'b', 'c', 'd'].map((id) => ({ id: id as 'a' | 'b' | 'c' | 'd', textFr: '' })),
        correctOptionId: (baseline?.correctOptionIds[0] as 'a' | 'b' | 'c' | 'd') ?? null,
        explanationFr: baseline?.explanationFr ?? '',
        reference: {
          workTitleAr: r?.workTitleAr ?? book.titleAr,
          authorAr: r?.authorAr ?? book.authorAr,
          sectionAr: r?.sectionAr ?? '',
          quoteAr: r?.quoteAr ?? '',
          url: baseline?.sources?.[0]?.url ?? '',
          edition: r?.edition ?? null,
          printedPage: r?.printedPage ?? null,
          pdfPage: r?.pdfPage ?? null,
        },
      };
  return (
    <>
      <Link href="/admin/quiz">← Questions</Link>
      <h1>{id ? 'Éditer la question' : 'Nouvelle question'}</h1>
      <p>
        Une sauvegarde crée un brouillon. La version publique ne change qu’après publication
        explicite.
      </p>
      <QuizEditor
        books={data.books.map((b) => ({
          ...b,
          level: quizLevels.find((l) => l.id === b.level)!.label,
        }))}
        initial={{
          ...(id ? { id } : {}),
          version: record?.version ?? 0,
          bookId: book.id,
          content,
          globalEligible: latest?.globalEligible ?? false,
          sourceVerification: latest?.sourceVerification ?? 'NOT_ATTESTED',
          excluded: globalQualityReview.excluded.some((e) => e.questionId === id),
        }}
      />
      {id && (
        <section className="admin-panel">
          <h2>Publication et versions</h2>
          {baseline && record && (record.activeRevisionId || record.archivedAt) && (
            <CommandForm
              command="quiz-baseline"
              input={{ id, version: record.version }}
              label="Restaurer la version de référence"
              reason
            />
          )}
          {baseline && !record?.activeRevisionId && !record?.archivedAt && (
            <p>
              Version publique actuelle : banque de référence avec corrections éditoriales V1.5.
            </p>
          )}
          {record?.revisions.map((revision) => (
            <div key={revision.id} className="admin-revision">
              <p>
                Révision {revision.revision} · {adminLabel(revision.status)} ·{' '}
                {date(revision.createdAt)} · {revision.reason}
              </p>
              <p>
                Vérification déclarée : {adminLabel(revision.sourceVerification)} · Global :{' '}
                {revision.globalEligible
                  ? 'autorisé sous réserve des exclusions historiques'
                  : 'non autorisé'}
              </p>
              {record.activeRevisionId !== revision.id && (
                <CommandForm
                  command="quiz-publish"
                  input={{ id, version: record.version, revisionId: revision.id }}
                  label={
                    revision.status === 'PUBLISHED'
                      ? 'Restaurer cette révision publiée'
                      : 'Publier cette révision'
                  }
                  reason
                />
              )}
            </div>
          ))}
          {!record?.revisions.length && (
            <p>
              Archives JSON conservées. La version de référence inclut les corrections éditoriales
              V1.5. Enregistrez un brouillon pour créer une révision.
            </p>
          )}
          <CommandForm
            command="quiz-archive"
            input={{ id, version: record?.version ?? 0, archived: !record?.archivedAt }}
            label={record?.archivedAt ? 'Restaurer la question' : 'Archiver la question'}
            reason
          />
        </section>
      )}
    </>
  );
}
export async function ActivityPage() {
  const events = await activityData();
  return (
    <>
      <h1>Journal d’activité</h1>
      <p>Les 100 dernières actions. Les traces ne sont pas modifiables depuis l’administration.</p>
      {events.map((e) => (
        <article className="admin-panel" key={e.id}>
          <h2>{adminLabel(e.action)}</h2>
          <p>
            {date(e.occurredAt)} · {adminLabel(e.entityType)} · {e.entityId} · Acteur :{' '}
            {e.actorId === 'anonymous' ? 'Non authentifié' : 'Propriétaire'}
          </p>
          {e.reason && <p>{e.reason}</p>}
          <pre>{JSON.stringify({ avant: e.priorSummary, après: e.nextSummary }, null, 2)}</pre>
        </article>
      ))}
      {!events.length && <p>Aucune action enregistrée.</p>}
    </>
  );
}
export async function AccountPage() {
  await requireOwnerPage();
  return (
    <>
      <h1>Mon compte</h1>
      <p>
        Propriétaire unique · second facteur vérifié pour cette session. Expiration après 30 minutes
        d’inactivité et au plus huit heures après vérification.
      </p>
      <section className="admin-panel">
        <h2>Codes de secours</h2>
        <RecoveryCodesForm />
      </section>
      <section className="admin-panel">
        <h2>Mot de passe</h2>
        <PasswordForm />
        <h2>Sessions</h2>
        <CommandForm command="revoke-sessions" input={{}} label="Révoquer toutes mes sessions" />
      </section>
    </>
  );
}
