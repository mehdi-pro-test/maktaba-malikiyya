import '../../../../src/app/globals.css';
export const metadata = { title: 'Fixture de test du quiz — contenu synthétique' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
