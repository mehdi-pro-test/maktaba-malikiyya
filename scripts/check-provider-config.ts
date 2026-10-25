import 'dotenv/config';
const provider = process.argv[2];
if (provider === 'stripe') {
  if (
    !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ||
    !process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')
  )
    throw new Error('Clé Stripe TEST et signature webhook valides requises.');
} else if (provider === 'resend') {
  if (
    !process.env.RESEND_API_KEY?.startsWith('re_') ||
    !process.env.RESEND_FROM_EMAIL?.includes('@')
  )
    throw new Error('Clé Resend et expéditeur autorisé requis.');
} else throw new Error('Fournisseur attendu : stripe ou resend.');
console.log(
  `Format de configuration ${provider} vérifié. La recette fournisseur reste nécessaire.`,
);
