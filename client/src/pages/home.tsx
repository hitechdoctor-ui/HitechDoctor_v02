import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Smartphone, Laptop, Shield, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const services = [
    {
      title: "Επισκευές Κινητών",
      desc: "Άμεση διάγνωση και αντικατάσταση οθόνης, μπαταρίας και πλακέτας με γνήσια ανταλλακτικά.",
      icon: Smartphone,
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "IT Support",
      desc: "Υποστήριξη δικτύων, format, εγκατάσταση λογισμικού και ανάκτηση δεδομένων.",
      icon: Laptop,
      color: "from-purple-500/20 to-indigo-500/20",
    },
    {
      title: "Εγγύηση Ποιότητας",
      desc: "Όλες μας οι εργασίες συνοδεύονται από γραπτή εγγύηση καλής λειτουργίας.",
      icon: Shield,
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Express Εξυπηρέτηση",
      desc: "Οι περισσότερες βλάβες επισκευάζονται σε λιγότερο από 2 ώρες στο εργαστήριό μας.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Seo 
        title="Αρχική" 
        description="Ο τεχνολογικός σας γιατρός. Εξειδικευμένες επισκευές κινητών, υπολογιστών και αγορά αξεσουάρ." 
      />
      
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-2">
              <Zap className="w-4 h-4" />
              <span>Αξιόπιστες Υπηρεσίες Τεχνολογίας</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight">
              Επαναφέρουμε την <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-500">
                Τεχνολογία σας
              </span> <br />
              στη Ζωή.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Στο HiTech Doctor αναλαμβάνουμε επισκευές smartphone, tablet και Η/Υ γρήγορα, υπεύθυνα και οικονομικά. Βρείτε επίσης κορυφαία αξεσουάρ στο eShop μας.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link href="/eshop">
                <Button size="lg" className="h-14 px-8 text-base rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 border-0">
                  Εξερευνήστε το eShop
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl border-white/10 hover:bg-white/5">
                Επικοινωνία
              </Button>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="relative w-full aspect-square max-w-[600px] mx-auto rounded-3xl overflow-hidden glass-panel tech-glow p-2">
              {/* landing page hero high tech motherboard repair */}
              <img 
                src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80" 
                alt="Επισκευή τεχνολογίας" 
                className="w-full h-full object-cover rounded-2xl opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent rounded-2xl" />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-card/50 border-y border-white/5 py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Οι Υπηρεσίες Μας</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Παρέχουμε ολοκληρωμένες λύσεις για κάθε πρόβλημα της συσκευής σας, με έμφαση στην ποιότητα και την ταχύτητα.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, idx) => (
                <div 
                  key={idx} 
                  className="bg-background rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
