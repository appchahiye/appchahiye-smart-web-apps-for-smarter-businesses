import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  ArrowRight,
  Workflow,
  Cloud,
  Scaling,
  Cpu,
  CheckCircle,
  Linkedin,
  Instagram,
  Twitter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
const navLinks = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
];
const AppLogo = () => (
  <a href="#" className="flex items-center gap-2 font-bold text-xl">
    <div className="w-7 h-7 bg-gradient-brand rounded-lg" />
    AppChahiye
  </a>
);
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <AppLogo />
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button className="bg-gradient-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Get Your App
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-6 pt-10">
                  {navLinks.map((link) => (
                    <a key={link.name} href={link.href} className="text-lg font-medium">
                      {link.name}
                    </a>
                  ))}
                  <Button className="bg-gradient-brand text-white">Get Your App</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 via-deep-violet/20 to-background -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground">
            Your Business, <span className="text-transparent bg-clip-text bg-gradient-brand">Simplified.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            We build smart web apps that help your business run smoother, faster, and smarter.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" className="bg-gradient-brand text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              See Examples
            </Button>
          </div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
        >
            <div className="relative mx-auto w-full max-w-4xl">
                <div className="absolute -inset-2 rounded-xl bg-gradient-brand opacity-20 blur-2xl"></div>
                <img src="https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" alt="Dashboard Mockup" className="relative rounded-xl shadow-2xl border" />
            </div>
        </motion.div>
      </div>
    </section>
  );
};
const HowItWorksSection = () => {
    const steps = [
        { icon: Workflow, title: "Tell us your needs", description: "Describe your business process and what you want to achieve." },
        { icon: Cpu, title: "We design & build", description: "Our experts craft a custom web application tailored for you." },
        { icon: Cloud, title: "Launch & manage", description: "Go live and easily manage your operations from anywhere." },
    ];
    return (
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">How It Works</h2>
                    <p className="mt-4 text-lg text-muted-foreground">A simple 3-step process to get your custom app.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-brand text-white shadow-lg">
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const WhyChooseUsSection = () => {
    const features = [
        { icon: Workflow, title: "Custom-built workflows", description: "Apps designed around your unique business processes." },
        { icon: Cloud, title: "Cloud-based & secure", description: "Access your app from anywhere with top-tier security." },
        { icon: Scaling, title: "Scales with you", description: "Our solutions grow as your business grows." },
        { icon: Cpu, title: "No tech skills needed", description: "We handle all the technical details, so you don't have to." },
    ];
    return (
        <section id="features" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Why Choose AppChahiye?</h2>
                    <p className="mt-4 text-lg text-muted-foreground">The perfect solution for your business operations.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader>
                                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-brand text-white">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const PortfolioSection = () => {
    const projects = [
        { name: "CRM Dashboard", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
        { name: "Project Manager", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
        { name: "Inventory System", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
        { name: "Client Portal", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
    ];
    return (
        <section id="portfolio" className="py-16 md:py-24 bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Our Work</h2>
                    <p className="mt-4 text-lg text-muted-foreground">See what we've built for businesses like yours.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {projects.map((project, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative overflow-hidden rounded-xl"
                        >
                            <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                            <div className="absolute bottom-0 left-0 p-6">
                                <h3 className="text-white text-2xl font-bold">{project.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const PricingSection = () => {
    const tiers = [
        { name: "Starter", price: "$999", features: ["1 Core Workflow", "Up to 5 Users", "Basic Support"] },
        { name: "Growth", price: "$2499", features: ["Up to 3 Workflows", "Up to 20 Users", "Priority Support", "Integrations"], popular: true },
        { name: "Enterprise", price: "Custom", features: ["Unlimited Workflows", "Unlimited Users", "Dedicated Support", "Advanced Security"] },
    ];
    return (
        <section id="pricing" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Simple, Transparent Pricing</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for your business.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                        <Card className={cn("flex flex-col h-full", tier.popular && "border-deep-violet ring-2 ring-deep-violet")}>
                            {tier.popular && <div className="bg-gradient-brand text-white text-center py-1.5 text-sm font-semibold rounded-t-lg">Most Popular</div>}
                            <CardHeader>
                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                <p className="text-4xl font-bold pt-4">{tier.price}</p>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <ul className="space-y-4 text-muted-foreground flex-1">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-deep-violet mr-2" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className={cn("w-full mt-8", tier.popular ? "bg-gradient-brand text-white" : "")} variant={tier.popular ? "default" : "outline"}>
                                    {tier.name === "Enterprise" ? "Request Custom Quote" : "Get Started"}
                                </Button>
                            </CardContent>
                        </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const TestimonialsSection = () => {
    const testimonials = [
        { name: "Sarah L.", company: "CEO, Innovate Inc.", text: "AppChahiye transformed our operations. What used to take hours now takes minutes. A true game-changer!", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
        { name: "Mike R.", company: "Founder, Growth Co.", text: "The custom app they built for us is intuitive, fast, and perfectly tailored to our workflow. Highly recommended.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
    ];
    return (
        <section id="testimonials" className="py-16 md:py-24 bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Loved by Businesses Worldwide</h2>
                </div>
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                        <Card className="h-full">
                            <CardContent className="pt-6">
                                <p className="text-lg">"{testimonial.text}"</p>
                                <div className="flex items-center mt-6">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const CtaSection = () => {
    return (
        <section id="contact" className="py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-2xl bg-gradient-brand p-12 text-center text-white overflow-hidden">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Ready to simplify your business?</h2>
                    <p className="mt-4 text-lg max-w-2xl mx-auto opacity-90">Let's build the perfect web app to streamline your operations and fuel your growth.</p>
                    <Button size="lg" variant="outline" className="mt-8 bg-white text-deep-violet hover:bg-white/90 font-bold px-8 py-3">
                        Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
};
const Footer = () => {
    return (
        <footer className="bg-background border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <AppLogo />
                        <p className="text-muted-foreground text-sm">Smart Web Apps for Smarter Businesses</p>
                    </div>
                    {/* Add more footer columns if needed */}
                </div>
                <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AppChahiye. All rights reserved.</p>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="w-5 h-5" /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <PortfolioSection />
        <PricingSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}