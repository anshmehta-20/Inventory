import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';

const contactDetails = [
  {
    label: 'Address',
    value: 'Mahavir Nagar, Kandivali West, Mumbai',
  },
  {
    label: 'Timings',
    value: 'Open daily from 8:30 AM to 9:30 PM',
  },
  {
    label: 'Contact',
    value: 'Add your phone number',
    muted: true,
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="About Us" subtitle="Shreeji Foods, Mahavir Nagar" />
      <main className="container mx-auto px-4 py-12 space-y-10">
        <section className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Serving Happiness Since 1999
          </h2>
          <p className="text-lg text-muted-foreground">
            Since 1999, Shreeji Foods has been serving delicious, fresh, and authentic vegetarian meals to the community of Kandivali West, Mahavir Nagar. We are known for quality, hygiene, and homely taste, and every plate reflects our love for great food.
          </p>
          <p className="text-lg text-muted-foreground">
            From classic Indian snacks to hearty meals, every dish is prepared with care so you enjoy the perfect balance of taste and freshness. Our loyal customers have trusted us for more than two decades, and we work hard to earn that trust every single day.
          </p>
          <p className="text-lg text-muted-foreground">
            We believe good food brings people together, and that sense of togetherness guides everything we do.
          </p>
        </section>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="grid gap-6 py-8 md:grid-cols-3">
            {contactDetails.map((detail) => (
              <div key={detail.label} className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </p>
                <p
                  className={detail.muted ? 'text-base text-muted-foreground italic' : 'text-base text-foreground'}
                >
                  {detail.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="max-w-3xl space-y-4 rounded-[var(--radius)] border border-dashed border-primary/40 bg-primary/5 p-6">
          <h3 className="text-xl font-semibold text-foreground">Visit Us Soon</h3>
          <p className="text-muted-foreground text-base">
            Come visit us and experience the taste of tradition and trust at Shreeji Foods. We are proud to serve Mahavir Nagar with fresh vegetarian meals and warm hospitality.
          </p>
        </section>
      </main>
    </div>
  );
}
