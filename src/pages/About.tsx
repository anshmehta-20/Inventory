import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const highlights = [
  {
    title: 'Our Story',
    description:
      "Shreeji Foods began as a family-run sweets shop with a passion for bringing authentic flavors to our community. What started as handcrafted mithai has grown into a full-fledged inventory of delicacies, snacks, and specialty ingredients loved across the region.",
  },
  {
    title: 'What We Offer',
    description:
      "From traditional sweets to festive hampers and everyday essentials, our curated catalog celebrates quality ingredients and time-honored techniques. Every product is sourced, prepared, and stored with care to ensure it reaches you at its freshest.",
  },
  {
    title: 'Why It Matters',
    description:
      "This dashboard helps our team track inventory in real time, respond faster to customer needs, and keep the Shreeji promise of consistency. With smarter tools, we can focus on what matters most—delighting every customer who walks through our doors.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="About Shreeji Foods" subtitle="Crafting sweetness since day one" />
      <main className="container mx-auto px-4 py-12 space-y-10">
        <section className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Rooted in Tradition, Powered by Innovation</h2>
          <p className="text-lg text-muted-foreground">
            We're on a mission to keep the soul of traditional sweets alive while modernizing the way we operate. This platform is a reflection of that journey—bridging the warmth of our kitchen with the efficiency our customers rely on.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-[var(--radius)] border border-dashed border-primary/40 bg-primary/5 p-6">
          <h3 className="text-xl font-semibold text-foreground">Looking Ahead</h3>
          <p className="mt-3 text-muted-foreground">
            As we continue to grow, we&apos;re investing in smarter processes, fresher inventory cycles, and meaningful customer experiences. Thank you for being a part of the Shreeji Foods family.
          </p>
        </section>
      </main>
    </div>
  );
}
