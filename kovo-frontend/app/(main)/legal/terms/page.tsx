import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Conditions Générales d'Utilisation - Kovo",
  description: "Conditions générales d'utilisation de la plateforme Kovo"
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link href="/settings">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Retour aux paramètres
        </Button>
      </Link>

      <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Présentation</h2>
            <p className="text-muted-foreground">
              Kovo est une plateforme de covoiturage dédiée exclusivement aux étudiants français. Notre mission est de faciliter les déplacements entre étudiants de manière économique, écologique et conviviale.
            </p>
            <p className="text-muted-foreground mt-2">
              En utilisant Kovo, vous acceptez les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Conditions d'accès</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Inscription</h3>
            <p className="text-muted-foreground">
              Pour utiliser Kovo, vous devez :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Être étudiant dans un établissement d'enseignement supérieur français</li>
              <li>Être âgé d'au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Vérifier votre statut d'étudiant en fournissant une carte étudiante valide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Compte utilisateur</h3>
            <p className="text-muted-foreground">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte est sous votre responsabilité. En cas d'utilisation non autorisée, contactez-nous immédiatement à contact@kovo.fr.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Utilisation en tant que conducteur</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 Conditions préalables</h3>
            <p className="text-muted-foreground">
              Pour proposer des trajets, vous devez :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Posséder un permis de conduire valide</li>
              <li>Fournir une photo de votre permis de conduire pour vérification</li>
              <li>Renseigner les informations de votre véhicule</li>
              <li>Disposer d'une assurance automobile en cours de validité couvrant le transport de passagers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Publication de trajets</h3>
            <p className="text-muted-foreground">
              En publiant un trajet, vous vous engagez à :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Fournir des informations exactes (date, heure, lieu, places disponibles)</li>
              <li>Respecter les horaires annoncés</li>
              <li>Informer rapidement les passagers en cas de modification ou d'annulation</li>
              <li>Adopter une conduite responsable et respectueuse du Code de la route</li>
              <li>Proposer un prix raisonnable correspondant au partage des frais (essence, péages)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Limitations</h3>
            <p className="text-muted-foreground">
              Le covoiturage sur Kovo doit rester un partage de frais. Il est interdit de faire du profit. Le prix proposé ne peut dépasser le coût réel du trajet divisé par le nombre de passagers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Utilisation en tant que passager</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Réservations</h3>
            <p className="text-muted-foreground">
              En réservant un trajet, vous vous engagez à :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Être ponctuel au point de rendez-vous</li>
              <li>Respecter le conducteur et les autres passagers</li>
              <li>Payer le montant convenu</li>
              <li>Annuler votre réservation si vous ne pouvez pas vous présenter</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Annulation</h3>
            <p className="text-muted-foreground">
              Vous pouvez annuler une réservation à tout moment via l'application. Toutefois, les annulations répétées ou de dernière minute peuvent entraîner des restrictions sur votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Règles de conduite</h2>
            <p className="text-muted-foreground mb-3">
              Tous les utilisateurs doivent respecter les règles suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Respect mutuel :</strong> comportement courtois et bienveillant</li>
              <li><strong>Sécurité :</strong> ne partagez pas d'informations personnelles sensibles</li>
              <li><strong>Communication :</strong> utilisez la messagerie intégrée pour les échanges</li>
              <li><strong>Véracité :</strong> ne publiez pas de fausses informations</li>
              <li><strong>Légalité :</strong> respectez les lois en vigueur</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.1 Comportements interdits</h3>
            <p className="text-muted-foreground mb-3">
              Sont strictement interdits :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Le harcèlement, les insultes ou tout comportement inapproprié</li>
              <li>La discrimination sous toute forme</li>
              <li>L'utilisation de la plateforme à des fins commerciales</li>
              <li>La création de faux comptes ou l'usurpation d'identité</li>
              <li>Le spam ou la publicité non sollicitée</li>
              <li>La collecte de données personnelles d'autres utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Paiements</h2>
            <p className="text-muted-foreground">
              Les paiements entre conducteurs et passagers s'effectuent de gré à gré. Kovo n'intervient pas dans les transactions financières et ne perçoit aucune commission. Nous vous recommandons d'utiliser des moyens de paiement traçables (virement, Lydia, PayLib, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Responsabilité</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">7.1 Rôle de Kovo</h3>
            <p className="text-muted-foreground">
              Kovo est un simple intermédiaire mettant en relation conducteurs et passagers. Nous ne sommes pas :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Partie au contrat de covoiturage entre utilisateurs</li>
              <li>Responsables des actes des utilisateurs</li>
              <li>Garants de la réalisation effective des trajets</li>
              <li>Assureur des trajets effectués</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Responsabilité des utilisateurs</h3>
            <p className="text-muted-foreground">
              Chaque utilisateur est pleinement responsable de ses actes. Les conducteurs doivent s'assurer d'être couverts par leur assurance automobile pour le transport de passagers. En cas d'accident ou de litige, les utilisateurs doivent régler leurs différends entre eux.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.3 Limitation de responsabilité</h3>
            <p className="text-muted-foreground">
              Kovo ne peut être tenu responsable de :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Tout dommage résultant d'un trajet (accident, retard, annulation)</li>
              <li>La perte ou le vol d'objets personnels</li>
              <li>Les litiges entre utilisateurs</li>
              <li>L'inexactitude des informations fournies par les utilisateurs</li>
              <li>Les interruptions de service ou problèmes techniques</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              Tous les éléments de la plateforme Kovo (logo, design, code, contenu) sont protégés par les droits de propriété intellectuelle. Toute reproduction, modification ou utilisation sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Données personnelles</h2>
            <p className="text-muted-foreground">
              Le traitement de vos données personnelles est régi par notre <Link href="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>. En utilisant Kovo, vous consentez à ce traitement conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Sanctions</h2>
            <p className="text-muted-foreground mb-3">
              En cas de non-respect des présentes CGU, Kovo se réserve le droit de :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Supprimer du contenu inapproprié</li>
              <li>Avertir l'utilisateur</li>
              <li>Suspendre temporairement le compte</li>
              <li>Supprimer définitivement le compte</li>
              <li>Engager des poursuites judiciaires si nécessaire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Modifications des CGU</h2>
            <p className="text-muted-foreground">
              Kovo se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications importantes par email ou notification. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Résiliation</h2>
            <p className="text-muted-foreground">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. Kovo peut également résilier votre accès en cas de violation des CGU, avec ou sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Droit applicable et juridiction</h2>
            <p className="text-muted-foreground">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à l'interprétation ou à l'exécution des présentes sera soumis aux tribunaux français compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces CGU, contactez-nous :
            </p>
            <p className="text-muted-foreground mt-2">
              Email : <strong>contact@kovo.fr</strong><br />
              Adresse : Kovo, [Adresse complète]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
