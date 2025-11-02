import Header from '@/components/Header';
import FadeContent from '@/components/FadeContent';
import { Card, CardContent } from '@/components/ui/card';

const contactDetails = [
  {
    label: 'Address',
    value:
      'Shreeji Foods, Shop No. 11, Mahavir Nagar, Panchsheel Garden, Siddhivinayak Nagar, Kandivali West, Mumbai, Maharashtra 400067',
    href: 'https://www.google.com/maps/search/?api=1&query=Shreeji+Foods%2C+Shop+No.+11%2C+Mahavir+Nagar%2C+Panchsheel+Garden%2C+Siddhivinayak+Nagar%2C+Kandivali+West%2C+Mumbai%2C+Maharashtra+400067',
  },
  {
    label: 'Timings',
    value: 'Open daily from 8:30 AM to 9:30 PM',
  },
  {
    label: 'Email',
    value: 'shreejifoods1999@gmail.com',
    href: 'mailto:shreejifoods1999@gmail.com',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="About Us" subtitle="Shreeji Foods, Mahavir Nagar" />
      <main className="container mx-auto px-4 py-12 space-y-10">
        <FadeContent blur duration={900} className="max-w-3xl space-y-4">
          <section>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Serving Happiness Since 1999
            </h2>
            <p className="text-lg text-muted-foreground">
              Since 1999, Shreeji Foods has been serving delicious, fresh, and authentic snacks and sweets to the community of Kandivali West, Mahavir Nagar. We are known for quality, hygiene, and homely taste, and every snack reflects our love for great food.
            </p>
            <p className="text-lg text-muted-foreground">
              From classic Indian snacks to traditional sweets, giving you the perfect balance of taste and freshness. Our loyal customers have trusted us for more than two decades, and we work hard to earn that trust every single day.
            </p>
            <p className="text-lg text-muted-foreground">
              We believe good food brings people together, and that sense of togetherness guides everything we do.
            </p>
          </section>
        </FadeContent>

        <FadeContent duration={1000} delay={120} className="block">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="grid gap-6 py-8 md:grid-cols-3">
              {contactDetails.map((detail) => (
                <div key={detail.label} className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-base text-foreground">{detail.value}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeContent>

        <FadeContent duration={1000} delay={240} className="max-w-3xl">
          <section className="space-y-4 rounded-[var(--radius)] border border-dashed border-primary/40 bg-primary/5 p-6">
            <h3 className="text-xl font-semibold text-foreground">Visit Us</h3>
            <p className="text-muted-foreground text-base">
              Come visit us and experience the taste of tradition and trust at Shreeji Foods. We look forward to serving you and becoming a part of your daily meals and special occasions.
            </p>
          </section>
        </FadeContent>
      </main>
    </div>
  );
}
