import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ReviewsSection } from "@/components/reviews-section";
import { getBlogPost, getRelatedPosts, formatBlogDate, BLOG_POSTS } from "@/data/blog-posts";
import { Clock, User, Calendar, ArrowRight, ArrowLeft, Wrench, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import NotFound from "./not-found";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = getBlogPost(params.slug);

  if (!post) return <NotFound />;

  const related = getRelatedPosts(post);
  const recentPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 5);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://hitechdoctor.com",
    },
    "publisher": {
      "@type": "Organization",
      "name": "HiTech Doctor",
      "logo": { "@type": "ImageObject", "url": "https://hitechdoctor.com/favicon.png" },
    },
    "datePublished": post.date,
    "url": `https://hitechdoctor.com/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgressBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Seo title={`${post.title} | HiTech Doctor Blog`} description={post.excerpt} />
      <Navbar />

      <div className="pt-20">
        {/* Hero image */}
        <div className="relative h-64 sm:h-80 bg-black/60 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
          <div className="flex gap-8 items-start">
            {/* Main content */}
            <main className="flex-1 min-w-0">
              <div className="bg-card border border-white/8 rounded-2xl p-6 sm:p-8 mb-8">
                <Breadcrumb
                  items={[
                    { label: "Blog", href: "/blog" },
                    { label: post.category },
                    { label: post.title.substring(0, 40) + "..." },
                  ]}
                  className="mb-5"
                />

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatBlogDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime} λεπτά ανάγνωσης
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground leading-tight mb-4">
                  {post.title}
                </h1>

                <p className="text-muted-foreground text-base italic border-l-2 border-primary/40 pl-4 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.authorRole} — Από την ομάδα του HiTech Doctor</p>
                  </div>
                </div>

                {/* Article body */}
                <div
                  className="prose prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:mb-1 prose-em:text-muted-foreground/80"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-white/8 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Back */}
                <div className="mt-6">
                  <Link href="/blog">
                    <Button variant="ghost" className="gap-2 text-sm">
                      <ArrowLeft className="w-4 h-4" />
                      Πίσω στο Blog
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-4">Σχετικά Άρθρα</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((p) => (
                      <Link key={p.id} href={`/blog/${p.slug}`}>
                        <div className="flex gap-3 p-3 rounded-xl bg-card border border-white/8 hover:border-primary/30 transition-all group">
                          <img
                            src={p.image}
                            alt={p.title}
                            loading="lazy"
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{p.readTime} λεπτά</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Sticky Sidebar (desktop only) */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 space-y-4">
                {/* Services widget */}
                <div className="bg-card border border-white/8 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    Οι Υπηρεσίες μας
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Επισκευή iPhone", href: "/services/episkeui-iphone" },
                      { label: "Επισκευή Κινητών", href: "/services/episkeui-kiniton" },
                      { label: "eShop Αξεσουάρ", href: "/eshop" },
                    ].map((s) => (
                      <Link key={s.label} href={s.href}>
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-background/60 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all text-xs text-muted-foreground hover:text-primary">
                          {s.label}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent articles */}
                <div className="bg-card border border-white/8 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-3">Πρόσφατα Άρθρα</h3>
                  <div className="space-y-3">
                    {recentPosts.map((p) => (
                      <Link key={p.id} href={`/blog/${p.slug}`}>
                        <div className="flex gap-2.5 group">
                          <img
                            src={p.image}
                            alt={p.title}
                            loading="lazy"
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.readTime} λεπτά</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/30 rounded-2xl p-5">
                  <h3 className="text-sm font-bold mb-2">Χρειάζεστε Επισκευή;</h3>
                  <p className="text-xs text-muted-foreground mb-3">Εγγύηση εργασίας, γρήγορη εξυπηρέτηση.</p>
                  <Link href="/epikoinonia">
                    <Button className="w-full h-8 text-xs bg-primary text-primary-foreground">
                      Επικοινωνήστε μαζί μας
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <ReviewsSection />
      <Footer />
    </div>
  );
}
