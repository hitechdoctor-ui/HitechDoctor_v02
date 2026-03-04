import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Νίκος Παπαδόπουλος",
    initial: "Ν",
    service: "Αλλαγή οθόνης iPhone 14",
    text: "Εξαιρετική δουλειά! Άλλαξαν την οθόνη του iPhone μου σε λιγότερο από μία ώρα και η τιμή ήταν πολύ λογική. Θα τους συστήσω σε όλους.",
    rating: 5,
    date: "Φεβ 2026",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
    initBg: "bg-primary/20 text-primary",
  },
  {
    id: 2,
    name: "Μαρία Κωνσταντίνου",
    initial: "Μ",
    service: "Επισκευή Samsung Galaxy S24",
    text: "Πολύ επαγγελματικοί και γρήγοροι. Το κινητό μου έπεσε και έσπασε η οθόνη. Το έφτιαξαν αυθημερόν με πρωτότυπα ανταλλακτικά. Άριστη εξυπηρέτηση!",
    rating: 5,
    date: "Ιαν 2026",
    color: "from-blue-500/15 to-blue-500/5",
    border: "border-blue-500/20",
    initBg: "bg-blue-500/20 text-blue-400",
  },
  {
    id: 3,
    name: "Γιώργος Αλεξίου",
    initial: "Γ",
    service: "Αντικατάσταση μπαταρίας iPhone 13",
    text: "Η μπαταρία του iPhone μου είχε πέσει στο 74%. Σε 30 λεπτά έβγαινα με καινούργια μπαταρία. Τιμή πολύ καλή και εγγύηση 6 μηνών. 10/10!",
    rating: 5,
    date: "Δεκ 2025",
    color: "from-emerald-500/15 to-emerald-500/5",
    border: "border-emerald-500/20",
    initBg: "bg-emerald-500/20 text-emerald-400",
  },
  {
    id: 4,
    name: "Ελένη Σταυρίδου",
    initial: "Ε",
    service: "Τζάμι Προστασίας iPhone",
    text: "Αγόρασα τζάμι προστασίας privacy και το έβαλαν επί τόπου χωρίς φυσαλίδες. Πολύ καλή ποιότητα, αξίζει κάθε λεπτό. Σίγουρα θα ξαναγοράσω!",
    rating: 5,
    date: "Νοε 2025",
    color: "from-violet-500/15 to-violet-500/5",
    border: "border-violet-500/20",
    initBg: "bg-violet-500/20 text-violet-400",
  },
  {
    id: 5,
    name: "Κώστας Δημητρίου",
    initial: "Κ",
    service: "Επισκευή iPhone XR — εμπλοκή φόρτισης",
    text: "Το iPhone μου δεν φόρτιζε. Σε λίγα λεπτά διέγνωσαν πρόβλημα στη θύρα και το επισκεύασαν αμέσως. Γρήγοροι, ειλικρινείς, προσιτές τιμές.",
    rating: 5,
    date: "Οκτ 2025",
    color: "from-orange-500/15 to-orange-500/5",
    border: "border-orange-500/20",
    initBg: "bg-orange-500/20 text-orange-400",
  },
  {
    id: 6,
    name: "Σοφία Παναγιώτου",
    initial: "Σ",
    service: "Θήκη Apple Silicone MagSafe",
    text: "Έχω αγοράσει από το eShop θήκη MagSafe και τζάμι για iPhone. Γρήγορη παράδοση, γνήσια προϊόντα και εξαιρετική ποιότητα. Το μαγαζί που εμπιστεύομαι!",
    rating: 5,
    date: "Σεπ 2025",
    color: "from-pink-500/15 to-pink-500/5",
    border: "border-pink-500/20",
    initBg: "bg-pink-500/20 text-pink-400",
  },
];

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-16 px-4 overflow-hidden" aria-label="Αξιολογήσεις πελατών">
      <div className="container mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-semibold mb-5">
            <Star className="w-4 h-4 fill-yellow-400" />
            Αξιολογήσεις Πελατών
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black mb-3">
            Τι λένε οι{" "}
            <span className="text-primary">πελάτες μας</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Πάνω από 500 επισκευές — η εμπιστοσύνη τους είναι η μεγαλύτερη αξιολόγηση.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-black text-foreground">5.0</span>
            <span className="text-sm text-muted-foreground">· Google Reviews</span>
          </div>
        </div>

        {/* Reviews grid — scroll on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="reviews-grid">
          {REVIEWS.map((r) => (
            <article
              key={r.id}
              data-testid={`review-card-${r.id}`}
              className={`relative glass-panel border ${r.border} rounded-2xl p-5 flex flex-col gap-3 bg-gradient-to-br ${r.color} hover:-translate-y-1 transition-transform duration-300`}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 fill-white/5" />

              {/* Stars + date */}
              <div className="flex items-center justify-between">
                <StarRow count={r.rating} />
                <span className="text-[10px] text-muted-foreground/50 font-medium">{r.date}</span>
              </div>

              {/* Review text */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{r.text}"
              </p>

              {/* Footer: avatar + name + service */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${r.initBg}`}>
                  {r.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight truncate">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-tight truncate">{r.service}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Google CTA */}
        <div className="text-center mt-8">
          <a
            href="https://g.page/r/Ca3DhY1VO2uKEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="btn-write-review"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 text-sm font-semibold text-muted-foreground hover:text-yellow-400 transition-all"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Γράψτε την αξιολόγησή σας στο Google
          </a>
        </div>

      </div>
    </section>
  );
}
