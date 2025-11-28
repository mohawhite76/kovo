import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Politique de confidentialité - Kovo",
  description: "Politique de confidentialité et protection des données personnelles sur Kovo"
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link href="/settings">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Retour aux paramètres
        </Button>
      </Link>

      <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Kovo est une plateforme de covoiturage dédiée aux étudiants français. La protection de vos données personnelles est une priorité pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Responsable du traitement</h2>
            <p className="text-muted-foreground">
              Le responsable du traitement des données personnelles est :<br />
              <strong>Kovo</strong><br />
              Email : contact@kovo.fr
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Données collectées</h2>
            <p className="text-muted-foreground mb-3">Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
              <li><strong>Données universitaires :</strong> université, numéro d'étudiant, carte étudiante (photo)</li>
              <li><strong>Données de conducteur :</strong> numéro de permis de conduire, photo du permis</li>
              <li><strong>Données de véhicule :</strong> marque, modèle, couleur, plaque d'immatriculation, photo du véhicule</li>
              <li><strong>Données de trajet :</strong> lieux de départ et d'arrivée, dates, horaires, prix</li>
              <li><strong>Données de communication :</strong> messages échangés entre utilisateurs</li>
              <li><strong>Données de connexion :</strong> adresse IP, données de navigation, cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Finalités du traitement</h2>
            <p className="text-muted-foreground mb-3">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Vérifier votre statut d'étudiant et vos documents de conduite</li>
              <li>Faciliter la mise en relation entre conducteurs et passagers</li>
              <li>Gérer les réservations et les paiements</li>
              <li>Permettre la communication entre utilisateurs</li>
              <li>Envoyer des notifications relatives à vos trajets</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Base légale du traitement</h2>
            <p className="text-muted-foreground">
              Le traitement de vos données repose sur :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Votre consentement</strong> pour les données facultatives et les notifications</li>
              <li><strong>L'exécution du contrat</strong> pour la fourniture du service de covoiturage</li>
              <li><strong>Nos intérêts légitimes</strong> pour la sécurité et l'amélioration du service</li>
              <li><strong>Les obligations légales</strong> pour la conservation de certaines données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Destinataires des données</h2>
            <p className="text-muted-foreground mb-3">Vos données peuvent être partagées avec :</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Les autres utilisateurs :</strong> profil public, informations de trajet</li>
              <li><strong>Nos prestataires de services :</strong> hébergement (Supabase), email (Brevo), notifications (OneSignal), stockage de fichiers (Cloudinary)</li>
              <li><strong>Les autorités compétentes :</strong> en cas d'obligation légale</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Durée de conservation</h2>
            <p className="text-muted-foreground">
              Vos données sont conservées :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Compte actif :</strong> tant que votre compte existe</li>
              <li><strong>Après suppression :</strong> 30 jours pour récupération, puis suppression définitive</li>
              <li><strong>Données de trajet :</strong> 3 ans après le trajet pour les obligations légales</li>
              <li><strong>Messages :</strong> jusqu'à suppression du compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Vos droits</h2>
            <p className="text-muted-foreground mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@kovo.fr</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Sécurité</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés. Cela inclut le chiffrement des données sensibles, des sauvegardes régulières et un accès restreint aux données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Cookies</h2>
            <p className="text-muted-foreground">
              Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies via le banner de consentement ou les paramètres de votre navigateur. Pour plus d'informations, consultez notre politique de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Modifications</h2>
            <p className="text-muted-foreground">
              Nous pouvons modifier cette politique de confidentialité. Les modifications importantes vous seront notifiées par email ou via l'application. La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Réclamation</h2>
            <p className="text-muted-foreground">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>CNIL</strong><br />
              3 Place de Fontenoy - TSA 80715<br />
              75334 PARIS CEDEX 07<br />
              Tél : 01 53 73 22 22<br />
              Site : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :
            </p>
            <p className="text-muted-foreground mt-2">
              Email : <strong>privacy@kovo.fr</strong><br />
              Adresse : Kovo, [Adresse complète]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
