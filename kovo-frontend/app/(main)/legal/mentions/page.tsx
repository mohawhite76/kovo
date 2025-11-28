import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Mentions légales - Kovo",
  description: "Mentions légales de la plateforme Kovo"
}

export default function MentionsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link href="/settings">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Retour aux paramètres
        </Button>
      </Link>

      <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Mentions légales</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Éditeur du site</h2>
            <p className="text-muted-foreground">
              Le site web et l'application mobile Kovo sont édités par :
            </p>
            <div className="mt-3 text-muted-foreground">
              <p><strong>Raison sociale :</strong> Kovo</p>
              <p><strong>Forme juridique :</strong> [À compléter]</p>
              <p><strong>Capital social :</strong> [À compléter]</p>
              <p><strong>Siège social :</strong> [Adresse complète]</p>
              <p><strong>SIRET :</strong> [Numéro SIRET]</p>
              <p><strong>RCS :</strong> [Ville] [Numéro RCS]</p>
              <p><strong>Email :</strong> contact@kovo.fr</p>
              <p><strong>Téléphone :</strong> [Numéro de téléphone]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Directeur de publication</h2>
            <p className="text-muted-foreground">
              Le directeur de la publication est [Nom et Prénom], en qualité de [Fonction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Hébergement</h2>
            <p className="text-muted-foreground mb-3">
              Le site et l'application Kovo sont hébergés par :
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-foreground">Base de données et backend :</p>
                <div className="mt-2 text-muted-foreground">
                  <p><strong>Supabase Inc.</strong></p>
                  <p>970 Toa Payoh North, #07-04</p>
                  <p>Singapore 318992</p>
                  <p>Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground">Stockage de fichiers :</p>
                <div className="mt-2 text-muted-foreground">
                  <p><strong>Cloudinary Ltd.</strong></p>
                  <p>111 W Evelyn Ave, Suite 206</p>
                  <p>Sunnyvale, CA 94086, États-Unis</p>
                  <p>Site web : <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cloudinary.com</a></p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground">Service d'emailing :</p>
                <div className="mt-2 text-muted-foreground">
                  <p><strong>Brevo (anciennement Sendinblue)</strong></p>
                  <p>7 rue de Madrid</p>
                  <p>75008 Paris, France</p>
                  <p>Site web : <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">brevo.com</a></p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground">Notifications push :</p>
                <div className="mt-2 text-muted-foreground">
                  <p><strong>OneSignal Inc.</strong></p>
                  <p>2850 S Delaware St, Suite 201</p>
                  <p>San Mateo, CA 94403, États-Unis</p>
                  <p>Site web : <a href="https://onesignal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">onesignal.com</a></p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Développement</h2>
            <p className="text-muted-foreground">
              Le site web et l'application mobile ont été développés par l'équipe Kovo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble du contenu de ce site (structure, textes, logos, images, éléments graphiques, vidéos, sons, bases de données, logiciels, etc.) est la propriété exclusive de Kovo, à l'exception des éléments fournis par les utilisateurs.
            </p>
            <p className="text-muted-foreground mt-3">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Kovo.
            </p>
            <p className="text-muted-foreground mt-3">
              Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Protection des données personnelles</h2>
            <p className="text-muted-foreground">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-muted-foreground mt-3">
              Pour plus d'informations sur la protection de vos données personnelles, consultez notre <Link href="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
            </p>
            <p className="text-muted-foreground mt-3">
              Pour exercer vos droits, contactez notre Délégué à la Protection des Données (DPO) :
            </p>
            <p className="text-muted-foreground mt-2">
              Email : <strong>privacy@kovo.fr</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">
              Le site Kovo utilise des cookies pour améliorer l'expérience utilisateur, réaliser des statistiques de visites et proposer des contenus adaptés.
            </p>
            <p className="text-muted-foreground mt-3">
              Vous pouvez gérer vos préférences de cookies via le banner de consentement présent sur le site ou dans les paramètres de votre navigateur.
            </p>
            <p className="text-muted-foreground mt-3">
              Types de cookies utilisés :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (connexion, préférences)</li>
              <li><strong>Cookies de performance :</strong> pour analyser l'utilisation du site et améliorer nos services</li>
              <li><strong>Cookies fonctionnels :</strong> pour mémoriser vos préférences (thème, langue)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Liens hypertextes</h2>
            <p className="text-muted-foreground">
              Le site Kovo peut contenir des liens vers d'autres sites web. Kovo n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
            <p className="text-muted-foreground mt-3">
              La création de liens vers le site Kovo est autorisée sous réserve de ne pas porter atteinte à l'image de Kovo et de mentionner clairement la source.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              Kovo s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Kovo ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p className="text-muted-foreground mt-3">
              Kovo ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
            </p>
            <p className="text-muted-foreground mt-3">
              Kovo se réserve le droit de modifier ou d'interrompre temporairement ou définitivement tout ou partie du site sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Droit applicable</h2>
            <p className="text-muted-foreground">
              Les présentes mentions légales sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Médiation</h2>
            <p className="text-muted-foreground">
              Conformément à l'article L.612-1 du Code de la consommation, Kovo propose un dispositif de médiation de la consommation. L'entité de médiation retenue est :
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>[Nom du médiateur]</strong><br />
              [Adresse]<br />
              Site web : [URL]
            </p>
            <p className="text-muted-foreground mt-3">
              Après démarche préalable écrite des consommateurs vis-à-vis de Kovo, le Service du Médiateur peut être saisi pour tout litige de consommation dont le règlement n'aurait pas abouti.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Par email :</strong> contact@kovo.fr<br />
              <strong>Par courrier :</strong> Kovo, [Adresse complète]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
