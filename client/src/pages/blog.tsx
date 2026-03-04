import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { ReviewsSection } from "@/components/reviews-section";
import { BLOG_POSTS, formatBlogDate } from "@/data/blog-posts";
import { Clock, ArrowRight, User, Tag } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Συμβουλές": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Συντήρηση": "bg-green-500/15 text-green-400 border-green-500/25",
  "Σύγκριση": "bg-purple-500/15 text-purple-400 border-purple-500/25",
  "Αξεσουάρ": "bg-primary/15 text-primary border-primary/25",
};

export default function Blog() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "HiTech Doctor Blog",
    "description": "Συμβουλές, οδηγοί και νέα για κινητά τηλέφωνα και επισκευές",
    "url": "https://hitechdoctor.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "HiTech Doctor",
      "url": "https://hitechdoctor.com",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Seo
        title="Blog — Συμβουλές & Οδηγοί για Κινητά | HiTech Doctor"
        description="Χρήσιμες συμβουλές, οδηγοί επισκευής και νέα για κινητά τηλέφωνα iPhone και Android από την ομάδα HiTech Doctor."
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }]} className="mb-6" />
          <h1 className="text-4xl sm:text-5xl font-display font-black mb-4">
            Το <span className="text-primary">Blog</span> μας
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Συμβουλές, οδηγοί και η αλήθεια από τεχνικούς που ξέρουν — όχι από marketing.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="group bg-card border border-white/6 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                data-testid={`card-blog-${post.id}`}
              >
                {/* Image - 16:9 */}
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[post.category] ?? "bg-primary/15 text-primary border-primary/25"}`}>
                      {post.category}
                    </span>
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime} λεπτά</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-xs text-primary hover:gap-2 transition-all font-semibold"
                      data-testid={`link-blog-post-${post.id}`}
                    >
                      Περισσότερα
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />
      <Footer />
    </div>
  );
}
