import { countries, europeanCountries } from '@/lib/rules';
export const dynamic = 'force-dynamic';
export default function Page() {
  return (
    <article className="section-wrap prose">
      <span className="eyebrow">LA MAKTABA</span>
      <h1>Informations & livraison</h1>
      <h2>Une boutique de démonstration</h2>
      <p>
        Maktaba Malikiya est actuellement un projet en phase de test. Les commandes sont fictives :
        aucune somme réelle n’est débitée et aucun colis n’est expédié.
      </p>
      <h2>Livraison</h2>
      <p>
        France métropolitaine : 4 € pour moins de 50 € de produits, livraison offerte à partir de 50
        €. Territoires ultramarins exclus. Autres pays autorisés : 20 €, sans gratuité.
      </p>
      <p>
        Pays configurés pour la démonstration :{' '}
        {countries()
          .map((c) => europeanCountries[c])
          .join(', ')}
        . Cette liste reste à confirmer avant toute activité commerciale.
      </p>
      <h2 id="confidentialite">Confidentialité</h2>
      <p>
        Le panier est conservé dans le stockage local de votre navigateur. Aucun traceur
        publicitaire n’est installé. La commande collecte uniquement les coordonnées utiles au
        traitement : e-mail, nom et adresse. Ces données sont enregistrées dans la base de la
        boutique et peuvent être transmises à Stripe (paiement test) et Resend (confirmation si
        configurée).
      </p>
      <p>
        Ne saisissez pas de données personnelles réelles pour la démonstration. Le responsable de
        traitement, les durées de conservation, les coordonnées pour exercer vos droits et les
        informations sur les sous-traitants doivent être complétés avant ouverture au public.
      </p>
      <h2>Mentions légales, contact & retours</h2>
      <p>
        Identité du vendeur, adresse professionnelle, contact, immatriculation, hébergeur,
        conditions générales de vente et politique de rétractation : à compléter et valider par le
        propriétaire avant commercialisation. Aucun délai de livraison ni régime fiscal n’est
        annoncé à ce stade.
      </p>
    </article>
  );
}
