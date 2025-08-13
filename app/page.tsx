"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, ShieldCheck, ArrowRight, School, Workflow, Briefcase, Star } from "lucide-react"

// 1. Barre de Navigation
const Navigation = () => {
  const router = useRouter()
  return (
    <header className="container mx-auto px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="font-bold text-xl text-gray-900 dark:text-white">EcoleChat</div>
      <Button onClick={() => router.push("/login")}>Se connecter</Button>
    </header>
  )
}

// 2. Section Héros
const HeroSection = () => {
  const router = useRouter()
  return (
    <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            La plateforme de communication pour l'éducation supérieure.
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Centralisez les discussions, sécurisez les échanges et renforcez la collaboration entre étudiants, professeurs et administration.
          </p>
          <div className="mt-8">
            <Button onClick={() => router.push("/login")} size="lg" className="text-base px-8 py-6">
              Accéder à mon espace <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <div className="w-1/4 bg-gray-100 dark:bg-gray-700 rounded-l-md p-2 space-y-3">
                <div className="flex items-center space-x-2"> <div className="w-6 h-6 rounded-full bg-purple-300"></div> <div className="w-20 h-4 rounded bg-gray-300 dark:bg-gray-600"></div> </div>
                <div className="flex items-center space-x-2"> <div className="w-6 h-6 rounded-full bg-blue-300"></div> <div className="w-16 h-4 rounded bg-gray-300 dark:bg-gray-600"></div> </div>
                <div className="flex items-center space-x-2 opacity-50"> <div className="w-6 h-6 rounded-full bg-gray-300"></div> <div className="w-20 h-4 rounded bg-gray-300 dark:bg-gray-600"></div> </div>
              </div>
              <div className="w-3/4 bg-white dark:bg-gray-800 p-2">
                <div className="w-1/2 h-5 rounded bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <div className="w-3/4 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-2"></div>
                <div className="w-1/2 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-4 ml-auto"></div>
                <div className="w-2/3 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 3. Section Fonctionnalités
const FeaturesSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Une plateforme pensée pour l'éducation</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Tout ce dont vous avez besoin pour communiquer efficacement.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-4">
          <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full"><MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
          <h3 className="text-xl font-bold mt-4">Communication Centralisée</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Discussions directes, par classe ou par cours. Ne perdez plus jamais une information importante.</p>
        </div>
        <div className="text-center p-4">
          <div className="inline-block p-4 bg-green-100 dark:bg-green-900/50 rounded-full"><ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" /></div>
          <h3 className="text-xl font-bold mt-4">Sécurité et Contrôle</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Gestion des accès par rôles pour des échanges confidentiels et maîtrisés.</p>
        </div>
        <div className="text-center p-4">
          <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/50 rounded-full"><Workflow className="h-8 w-8 text-purple-600 dark:text-purple-400" /></div>
          <h3 className="text-xl font-bold mt-4">Gestion Intuitive</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Un panneau d'administration complet pour gérer utilisateurs, classes et cours sans effort.</p>
        </div>
      </div>
    </div>
  </section>
)

// 4. Section "Pour Qui ?"
const ForWhoSection = () => (
  <section className="py-20 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Adapté à chaque rôle de votre établissement</h2>
      </div>
      <Tabs defaultValue="students" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students"><School className="mr-2 h-5 w-5"/>Étudiants</TabsTrigger>
          <TabsTrigger value="teachers"><Users className="mr-2 h-5 w-5"/>Professeurs</TabsTrigger>
          <TabsTrigger value="admins"><Briefcase className="mr-2 h-5 w-5"/>Administration</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-2">Un espace d'apprentissage connecté</h3>
          <p className="text-gray-600 dark:text-gray-300">Collaborez sur les projets de groupe, posez des questions sur les cours, et ne manquez aucune annonce importante de vos professeurs ou de l'administration. Votre vie étudiante, simplifiée.</p>
        </TabsContent>
        <TabsContent value="teachers" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-2">Animez vos cours efficacement</h3>
          <p className="text-gray-600 dark:text-gray-300">Partagez des ressources, répondez aux questions et envoyez des annonces à vos classes en quelques clics. Communiquez facilement avec vos collègues et l'administration.</p>
        </TabsContent>
        <TabsContent value="admins" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-2">Supervisez et gérez en toute sérénité</h3>
          <p className="text-gray-600 dark:text-gray-300">Invitez de nouveaux membres, définissez les rôles, créez les classes et les cours. Gardez une vue d'ensemble sur l'activité de la plateforme et assurez un environnement sûr pour tous.</p>
        </TabsContent>
      </Tabs>
    </div>
  </section>
)

// 5. Section Témoignages
const TestimonialsSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Ils nous font confiance</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex mb-2"> {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)} </div>
            <p className="italic text-gray-600 dark:text-gray-300">"EcoleChat a transformé la communication dans notre département. Les étudiants sont plus engagés et les informations circulent beaucoup mieux."</p>
            <div className="mt-4 flex items-center">
              <Avatar className="h-12 w-12 mr-4"><AvatarFallback>CB</AvatarFallback></Avatar>
              <div>
                <p className="font-bold">Céline Bernard</p>
                <p className="text-sm text-gray-500">Directrice du département Informatique</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex mb-2"> {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)} </div>
            <p className="italic text-gray-600 dark:text-gray-300">"En tant qu'étudiant, c'est génial d'avoir un seul endroit pour toutes les discussions liées à l'université. C'est beaucoup plus simple que les emails."</p>
            <div className="mt-4 flex items-center">
              <Avatar className="h-12 w-12 mr-4"><AvatarFallback>LM</AvatarFallback></Avatar>
              <div>
                <p className="font-bold">Lucas Martin</p>
                <p className="text-sm text-gray-500">Étudiant en Master 2 Droit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex mb-2"> {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)} </div>
            <p className="italic text-gray-600 dark:text-gray-300">"La gestion des utilisateurs est très intuitive. Le système de rôles est puissant et nous permet de garder le contrôle total sur la plateforme."</p>
            <div className="mt-4 flex items-center">
              <Avatar className="h-12 w-12 mr-4"><AvatarFallback>AD</AvatarFallback></Avatar>
              <div>
                <p className="font-bold">Alain Dubois</p>
                <p className="text-sm text-gray-500">Administrateur Système</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
)

// 6. Pied de Page
const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-900">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} EcoleChat. Tous droits réservés.</p>
        <div className="flex mt-4 md:mt-0 space-x-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">À propos</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Contact</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
)

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ForWhoSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
