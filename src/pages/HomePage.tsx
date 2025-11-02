import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Menu,
  ArrowRight,
  Workflow,
  Cloud,
  Scaling,
  Cpu,
  CheckCircle,
  Instagram,
  Facebook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { WebsiteContent } from '@shared/types';
import { GetStartedModal } from '@/components/GetStartedModal';
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
const Header = ({ onGetStartedClick }: { onGetStartedClick: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <AppLogo />
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button onClick={onGetStartedClick} className="bg-gradient-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Get Your App</Button>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-6 pt-10">
                  {navLinks.map((link) => <a key={link.name} href={link.href} className="text-lg font-medium">{link.name}</a>)}
                  <Button onClick={onGetStartedClick} className="bg-gradient-brand text-white">Get Your App</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
const HeroSection = ({ content, onGetStartedClick }: { content?: WebsiteContent['hero'], onGetStartedClick: () => void }) => (
  <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 via-deep-violet/20 to-background -z-10"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        {content ? (
          <>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: content.headline.replace('Simplified.', '<span class="text-transparent bg-clip-text bg-gradient-brand">Simplified.</span>') }}></h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">{content.subheadline}</p>
          </>
        ) : (
          <>
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-6" />
          </>
        )}
        <div className="mt-10 flex justify-center gap-4">
          <Button onClick={onGetStartedClick} size="lg" className="bg-gradient-brand text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl">Get Started</Button>
          <Button size="lg" variant="outline" className="px-8 py-3">See Examples</Button>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-16">
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="absolute -inset-2 rounded-xl bg-gradient-brand opacity-20 blur-2xl"></div>
          {content ? <img src={content.imageUrl} alt="Dashboard Mockup" className="relative rounded-xl shadow-2xl border" /> : <Skeleton className="w-full aspect-video rounded-xl" />}
        </div>
      </motion.div>
    </div>
  </section>
);
const HowItWorksSection = ({ content }: { content?: WebsiteContent['howItWorks'] }) => {
    const icons = [Workflow, Cpu, Cloud];
    return (
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">How It Works</h2>
                    <p className="mt-4 text-lg text-muted-foreground">A simple 3-step process to get your custom app.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {(content || Array(3).fill(null)).map((step, index) => {
                        const Icon = icons[index];
                        return (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-brand text-white shadow-lg"><Icon className="w-8 h-8" /></div>
                                {step ? (
                                    <>
                                        <h3 className="text-xl font-semibold">{step.title}</h3>
                                        <p className="mt-2 text-muted-foreground">{step.description}</p>
                                    </>
                                ) : (
                                    <>
                                        <Skeleton className="h-6 w-32 mx-auto" />
                                        <Skeleton className="h-4 w-48 mx-auto mt-2" />
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
const WhyChooseUsSection = ({ content }: { content?: WebsiteContent['whyChooseUs'] }) => {
    const icons = [Workflow, Cloud, Scaling, Cpu];
    return (
        <section id="features" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-display">Why Choose AppChahiye?</h2>
                    <p className="mt-4 text-lg text-muted-foreground">The perfect solution for your business operations.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(content || Array(4).fill(null)).map((feature, index) => {
                        const Icon = icons[index];
                        return (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <CardHeader>
                                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-brand text-white"><Icon className="w-6 h-6" /></div>
                                        {feature ? <CardTitle>{feature.title}</CardTitle> : <Skeleton className="h-6 w-40" />}
                                    </CardHeader>
                                    <CardContent>
                                        {feature ? <p className="text-muted-foreground">{feature.description}</p> : <Skeleton className="h-10 w-full" />}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
const PortfolioSection = ({ content }: { content?: WebsiteContent['portfolio'] }) => (
    <section id="portfolio" className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-display">Our Work</h2>
                <p className="mt-4 text-lg text-muted-foreground">See what we've built for businesses like yours.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {(content || Array(4).fill(null)).map((project, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group relative overflow-hidden rounded-xl aspect-video">
                        {project ? (
                            <>
                                <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                                <div className="absolute bottom-0 left-0 p-6"><h3 className="text-white text-2xl font-bold">{project.name}</h3></div>
                            </>
                        ) : <Skeleton className="w-full h-full" />}
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);
const PricingSection = ({ content, onGetStartedClick }: { content?: WebsiteContent['pricing'], onGetStartedClick: () => void }) => (
    <section id="pricing" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-display">Simple, Transparent Pricing</h2>
                <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for your business.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {(content || Array(3).fill(null)).map((tier, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                        <Card className={cn("flex flex-col h-full", tier?.popular && "border-deep-violet ring-2 ring-deep-violet")}>
                            {tier?.popular && <div className="bg-gradient-brand text-white text-center py-1.5 text-sm font-semibold rounded-t-lg">Most Popular</div>}
                            <CardHeader>
                                {tier ? <CardTitle className="text-2xl">{tier.name}</CardTitle> : <Skeleton className="h-8 w-32" />}
                                {tier ? <p className="text-4xl font-bold pt-4">{tier.price}</p> : <Skeleton className="h-10 w-24 mt-4" />}
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <ul className="space-y-4 text-muted-foreground flex-1">
                                    {(tier?.features || Array(3).fill(null)).map((feature, i) => (
                                        <li key={i} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-deep-violet mr-2" />
                                            {feature ? <span>{feature}</span> : <Skeleton className="h-5 w-40" />}
                                        </li>
                                    ))}
                                </ul>
                                <Button onClick={onGetStartedClick} className={cn("w-full mt-8", tier?.popular ? "bg-gradient-brand text-white" : "")} variant={tier?.popular ? "default" : "outline"}>
                                    {tier ? (tier.name === "Enterprise" ? "Request Custom Quote" : "Get Started") : <Skeleton className="h-6 w-32" />}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);
const TestimonialsSection = ({ content }: { content?: WebsiteContent['testimonials'] }) => (
    <section id="testimonials" className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center"><h2 className="text-3xl md:text-4xl font-bold font-display">Loved by Businesses Worldwide</h2></div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(content || Array(2).fill(null)).map((testimonial, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                        <Card className="h-full">
                            <CardContent className="pt-6">
                                {testimonial ? (
                                    <>
                                        <p className="text-lg">"{testimonial.text}"</p>
                                        <div className="flex items-center mt-6">
                                            <Avatar><AvatarImage src={testimonial.avatar} /><AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback></Avatar>
                                            <div className="ml-4">
                                                <p className="font-semibold">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full" />
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /></div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);
const CtaSection = ({ content, onGetStartedClick }: { content?: WebsiteContent['finalCta'], onGetStartedClick: () => void }) => (
    <section id="contact" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl bg-gradient-brand p-12 text-center text-white overflow-hidden">
                {content ? (
                    <>
                        <h2 className="text-3xl md:text-4xl font-bold font-display">{content.headline}</h2>
                        <p className="mt-4 text-lg max-w-2xl mx-auto opacity-90">{content.subheadline}</p>
                    </>
                ) : (
                    <>
                        <Skeleton className="h-12 w-3/4 mx-auto bg-white/20" />
                        <Skeleton className="h-6 w-1/2 mx-auto mt-4 bg-white/20" />
                    </>
                )}
                <Button onClick={onGetStartedClick} size="lg" variant="outline" className="mt-8 bg-white text-deep-violet hover:bg-white/90 font-bold px-8 py-3">
                    Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    </section>
);
const Footer = () => (
    <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <AppLogo />
                    <p className="text-muted-foreground text-sm">Smart Web Apps for Smarter Businesses</p>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AppChahiye. All rights reserved.</p>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <a href="#" className="text-muted-foreground hover:text-foreground"><Instagram className="w-5 h-5" /></a>
                    <a href="#" className="text-muted-foreground hover:text-foreground"><Facebook className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
    </footer>
);
export function HomePage() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    api<WebsiteContent>('/api/content')
      .then(data => setContent(data))
      .catch(err => console.error("Failed to fetch content:", err));
  }, []);
  const handleGetStartedClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return (
    <div className="bg-background text-foreground">
      <GetStartedModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <Header onGetStartedClick={handleGetStartedClick} />
      <main>
        <HeroSection content={content?.hero} onGetStartedClick={handleGetStartedClick} />
        <HowItWorksSection content={content?.howItWorks} />
        <WhyChooseUsSection content={content?.whyChooseUs} />
        <PortfolioSection content={content?.portfolio} />
        <PricingSection content={content?.pricing} onGetStartedClick={handleGetStartedClick} />
        <TestimonialsSection content={content?.testimonials} />
        <CtaSection content={content?.finalCta} onGetStartedClick={handleGetStartedClick} />
      </main>
      <Footer />
    </div>
  );
}