/**
 * Below-the-fold home content — lazy-loaded to shrink initial JS and improve LCP/TBT.
 */
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, formatBlogDate } from "@/data/blog-posts";
import { SpecialOffers } from "@/components/special-offers";
import { RepairChatbot } from "@/components/repair-chatbot";
import { Globe, Search, ShoppingCart, Star, Code2, ArrowRight, Paintbrush } from "lucide-react";
import { Link } from "wouter";

export default function HomeBelowFold() {
  return (
    <>
      <section className="py-20 border-t border-primary/8" aria-label="Κατασκευή Ιστοσελίδων">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-4">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Κατασκευή Ιστοσελίδων
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-foreground mb-4 leading-tight">
                Φτιάξτε την <span className="gradient-text">Ψηφιακή σας Παρουσία</span> μαζί μας
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Δημιουργούμε επαγγελματικές ιστοσελίδες για επιχειρήσεις, e-shop και portfolio. Σύγχρονο design, γρήγορη φόρτωση, SEO optimization και ετήσια υποστήριξη από €150/χρόνο.
              </p>
              <ul className="grid grid-cols-2 gap-4 mb-8 list-none p-0 m-0">
                {[
                  { icon: Paintbrush, label: "Μοναδικό Design", desc: "Προσαρμοσμένο στο brand σας" },
                  { icon: Search, label: "SEO Optimized", desc: "Βρείτε πρώτοι στη Google" },
                  { icon: ShoppingCart, label: "e-Shop", desc: "Online πωλήσεις άμεσα" },
                  { icon: Star, label: "Ετήσια Υποστήριξη", desc: "Φιλοξενία + ενημερώσεις" },
                ].map((f) => (
                  <li key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-white/6">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-primary" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{f.label}</span>
                      <span className="block text-xs text-muted-foreground">{f.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/web-designer">
                  <Button
                    size="lg"
                    className="h-12 px-8 font-semibold border-0"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                    data-testid="button-home-webdesign-portfolio"
                  >
                    Δείτε το Portfolio μας
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/web-designer#inquiry">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-primary/30 text-primary" data-testid="button-home-webdesign-quote">
                    Ζητείστε Προσφορά
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden pcb-border tech-glow">
                <img
                  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=900"
                  alt="Κατασκευή ιστοσελίδων στην Αθήνα"
                  className="w-full aspect-video object-cover"
                  width={900}
                  height={506}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-primary" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-foreground">Από €150/χρόνο</span>
                    <span className="block text-xs text-muted-foreground">Πλήρης φιλοξενία + support</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SpecialOffers />

      <section className="py-16 border-t border-white/6" aria-label="Νέα από το blog">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-display font-black mb-3">
              Διαβάστε τα <span className="text-primary">Νέα μας</span>
            </h2>
            <p className="text-muted-foreground">Συμβουλές και οδηγοί από τους τεχνικούς μας — γραμμένα ανθρώπινα, για ανθρώπους.</p>
          </header>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 list-none p-0 m-0">
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <li key={post.id} className="group bg-card border border-white/6 rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                <article>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/9] overflow-hidden bg-black/40">
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] text-muted-foreground mb-2">{formatBlogDate(post.date)} · {post.readTime} λεπτά ανάγνωσης</p>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
          <p className="text-center m-0">
            <Link href="/blog">
              <Button variant="outline" className="border-white/20 hover:border-primary/40 gap-2">
                Διαβάστε περισσότερα
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </p>
        </div>
      </section>

      <ReviewsSection />
      <Footer />

      <div
        className="pointer-events-none fixed right-4 z-[150] bottom-[calc(5.25rem+env(safe-area-inset-bottom)+11rem)] sm:right-6 sm:bottom-[calc(1.5rem+11rem)] flex flex-col items-end gap-3"
        aria-hidden={false}
      >
        <RepairChatbot />
      </div>
    </>
  );
}
