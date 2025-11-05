import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Mail, 
  ShoppingBag, 
  Star, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import FadeContent from '@/components/FadeContent';
import Header from '@/components/Header';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section - Redesigned with Unique Effects */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20" />
        
        {/* Floating Shapes Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-40 right-20 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern with Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-1/4 left-1/4 w-6 h-6 text-amber-500 animate-pulse opacity-60" style={{ animationDelay: '0s' }} />
          <Sparkles className="absolute top-1/3 right-1/3 w-8 h-8 text-orange-500 animate-pulse opacity-60" style={{ animationDelay: '1s' }} />
          <Star className="absolute bottom-1/3 left-1/3 w-5 h-5 text-rose-500 animate-pulse opacity-60 fill-rose-500/50" style={{ animationDelay: '2s' }} />
          <Star className="absolute top-1/2 right-1/4 w-7 h-7 text-amber-500 animate-pulse opacity-60 fill-amber-500/50" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <FadeContent duration={800} className="text-center space-y-6 sm:space-y-8 md:space-y-10 max-w-5xl mx-auto">
            {/* Animated Badge */}
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Badge variant="secondary" className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium backdrop-blur-sm bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-amber-900 dark:text-amber-100">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 fill-amber-500 text-amber-500 animate-pulse" />
                <span className="hidden xs:inline">Serving Since 1999</span>
                <span className="xs:hidden">Since 1999</span>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 text-amber-500 animate-pulse" />
              </Badge>
            </div>

            {/* Hero Title with 3D Effect */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground/90">
                Welcome to
              </h1>
              
              {/* Stunning 3D Text Effect */}
              <div className="relative inline-block px-2 sm:px-0">
                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                  {/* 3D Shadow Layers - Hidden on very small screens for performance */}
                  <span className="hidden sm:block absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent blur-sm translate-x-1 translate-y-1 opacity-50" aria-hidden="true">
                    Shreeji Foods
                  </span>
                  <span className="hidden md:block absolute inset-0 bg-gradient-to-br from-orange-600 to-rose-600 bg-clip-text text-transparent blur-md translate-x-2 translate-y-2 opacity-30" aria-hidden="true">
                    Shreeji Foods
                  </span>
                  
                  {/* Main Gradient Text with Glow */}
                  <span 
                    className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent inline-block"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 40px rgba(249, 115, 22, 0.2))',
                    }}
                  >
                    Shreeji Foods
                  </span>
                </h2>
                
                {/* Animated Underline */}
                <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-3/4 sm:w-2/3">
                  <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full opacity-60" />
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full -mt-0.5 opacity-40" />
                </div>
              </div>
            </div>

            {/* Subtitle with Enhanced Styling */}
            <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium mt-4 sm:mt-6 md:mt-8 px-4">
              Your trusted destination for 
              <span className="text-amber-600 font-bold"> premium dry fruits</span>, 
              <span className="text-rose-600 font-bold"> authentic sweets</span>, and 
              <span className="text-orange-600 font-bold"> delicious namkeen</span>
              <br className="hidden md:block" />
              <span className="text-sm md:text-lg">in Kandivali West, Mumbai</span>
            </p>

            {/* CTA Buttons with Enhanced Effects */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 pt-6 sm:pt-8 w-full px-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 md:px-10 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 group">
                <Link to="/products">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Browse Products
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 md:px-10 border-2 hover:border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all hover:scale-105 backdrop-blur-sm group">
                <Link to="/about">
                  Learn More
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Product Categories - Redesigned with Modern Cards */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-rose-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeContent duration={800} delay={100} className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-semibold text-primary">What We Offer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent px-4">
              Our Specialties
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Discover our wide range of premium quality products, crafted with care and tradition
            </p>
          </FadeContent>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
            <FadeContent duration={800} delay={200}>
              <Link to="/products?category=Dry Fruits" className="block">
                <Card className="group relative hover:shadow-2xl transition-all duration-500 border-2 hover:border-amber-500/50 overflow-hidden bg-gradient-to-br from-card to-card hover:-translate-y-2 cursor-pointer">
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-amber-500 text-white shadow-lg">Premium</Badge>
                </div>
                
                {/* Image Section with Real Photo */}
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 via-orange-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 relative overflow-hidden">
                  <img 
                    src="/dry-fruits.png" 
                    alt="Premium Dry Fruits Collection" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon with Animation - Commented out but kept for reference */}
                  {/* <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
                  </div>
                  <div className="relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                    <Sparkles className="w-28 h-28 text-amber-600 dark:text-amber-400 relative" />
                  </div> */}
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <div className="absolute bottom-6 right-6 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                </div>
                
                <CardContent className="p-4 sm:p-5 md:p-7 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-amber-600 transition-colors">
                      Premium Dry Fruits
                    </h3>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Finest quality almonds, cashews, pistachios, walnuts, and more. Carefully sourced and packed fresh for maximum nutrition.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    <span className="text-xs font-medium text-amber-600">Top Quality Assured</span>
                  </div>
                </CardContent>
              </Card>
              </Link>
            </FadeContent>

            <FadeContent duration={800} delay={300}>
              <Link to="/products?category=Sweets" className="block">
                <Card className="group relative hover:shadow-2xl transition-all duration-500 border-2 hover:border-rose-500/50 overflow-hidden bg-gradient-to-br from-card to-card hover:-translate-y-2 cursor-pointer">
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-rose-500 text-white shadow-lg">Traditional</Badge>
                </div>
                
                {/* Image Section with Real Photo */}
                <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 dark:from-rose-900/30 dark:to-pink-900/20 relative overflow-hidden">
                  <img 
                    src="/sweets.png" 
                    alt="Traditional Indian Sweets" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon with Animation - Commented out but kept for reference */}
                  {/* <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.3),transparent_50%)]" />
                  </div>
                  <div className="relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                    <svg className="w-28 h-28 text-rose-600 dark:text-rose-400 relative" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div> */}
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <div className="absolute bottom-6 right-6 w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
                </div>
                
                <CardContent className="p-4 sm:p-5 md:p-7 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-rose-600 transition-colors">
                      Traditional Sweets
                    </h3>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Authentic Indian sweets made with love and traditional recipes. From laddoos to barfis, taste the heritage in every bite.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                    <span className="text-xs font-medium text-rose-600">Homemade Taste</span>
                  </div>
                </CardContent>
              </Card>
              </Link>
            </FadeContent>

            <FadeContent duration={800} delay={400}>
              <Link to="/products?category=Namkeen" className="block">
                <Card className="group relative hover:shadow-2xl transition-all duration-500 border-2 hover:border-orange-500/50 overflow-hidden bg-gradient-to-br from-card to-card hover:-translate-y-2 cursor-pointer">
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-orange-500 text-white shadow-lg">Fresh Daily</Badge>
                </div>
                
                {/* Image Section */}
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 dark:from-orange-900/30 dark:to-amber-900/20 flex items-center justify-center relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.3),transparent_50%)]" />
                  </div>
                  
                  {/* Icon with Animation */}
                  <div className="relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse" />
                    <ShoppingBag className="w-28 h-28 text-orange-600 dark:text-orange-400 relative" />
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  <div className="absolute bottom-6 right-6 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                </div>
                
                <CardContent className="p-4 sm:p-5 md:p-7 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                      Crispy Namkeen
                    </h3>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Crunchy and flavorful namkeens perfect for any occasion. Fresh, hygienic preparation, absolutely delicious.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <span className="text-xs font-medium text-orange-600">Always Fresh</span>
                  </div>
                </CardContent>
              </Card>
              </Link>
            </FadeContent>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeContent duration={800} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Shreeji Foods?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Over 25 years of trust and quality service
            </p>
          </FadeContent>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Star,
                title: '25+ Years Experience',
                description: 'Serving the community since 1999 with dedication and love',
              },
              {
                icon: Sparkles,
                title: 'Premium Quality',
                description: 'Only the finest ingredients and products for our customers',
              },
              {
                icon: ShoppingBag,
                title: 'Wide Selection',
                description: 'Extensive range of dry fruits, sweets, and namkeens',
              },
              {
                icon: Star,
                title: 'Trusted by Thousands',
                description: 'Loyal customer base built on trust and quality',
              },
            ].map((feature, index) => (
              <FadeContent key={index} duration={800} delay={100 + index * 100}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeContent duration={800} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Visit Our Store
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Come experience the taste of tradition
            </p>
          </FadeContent>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Shop No. 11, Mahavir Nagar<br />
                        Panchsheel Garden, Siddhivinayak Nagar<br />
                        Kandivali West, Mumbai 400067
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Opening Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Open Daily<br />
                        8:30 AM - 9:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a 
                        href="mailto:shreejifoods1999@gmail.com"
                        className="text-sm text-primary hover:underline"
                      >
                        shreejifoods1999@gmail.com
                      </a>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-6">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Shreeji+Foods%2C+Shop+No.+11%2C+Mahavir+Nagar%2C+Panchsheel+Garden%2C+Siddhivinayak+Nagar%2C+Kandivali+West%2C+Mumbai%2C+Maharashtra+400067"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-background dark:to-background p-8 flex items-center justify-center relative overflow-hidden border-l dark:border-l-primary/20">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
                  <div className="text-center space-y-4 relative z-10">
                    <MapPin className="w-20 h-20 mx-auto text-amber-600 dark:text-primary" />
                    <p className="text-lg font-semibold text-amber-900 dark:text-foreground">
                      Located in the heart of<br />Kandivali West
                    </p>
                    <p className="text-sm text-amber-800 dark:text-muted-foreground">
                      Easy to reach, convenient parking
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <FadeContent duration={800}>
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Experience Quality?
              </h2>
              <p className="text-lg text-muted-foreground">
                Visit us today or browse our product catalog online
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="text-lg h-12 px-8">
                  <Link to="/products">
                    View Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg h-12 px-8">
                  <Link to="/about">
                    About Us
                  </Link>
                </Button>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>
    </div>
  );
}
