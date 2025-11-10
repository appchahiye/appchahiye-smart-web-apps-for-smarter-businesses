import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Menu, ArrowRight, Workflow, Cloud, Scaling, Cpu, Instagram, Facebook, Loader2, Quote, ChevronLeft, ChevronRight, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WebsiteContent } from '@shared/types';
import { GetStartedModal } from '@/components/GetStartedModal';
import { Toaster, toast } from '@/components/ui/sonner';
import { useContentStore } from '@/stores/contentStore';
import { useDynamicAssets } from '@/hooks/use-dynamic-assets';
import { AppLogo } from '@/components/AppLogo';
import { api } from '@/lib/api-client';
const MotionCard = motion(Card);
const Section = ({ children, className, ...props }: React.ComponentProps<typeof motion.section>) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={cn("py-20 lg:py-24", className)}
    {...props}
  >
    {children}
  </motion.section>
);
const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-deep-violet">{children}</p>
);
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-center text-4xl md:text-5xl font-bold font-display tracking-tight">{children}</h2>
);
const SectionSubheading = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-center text-lg max-w-3xl mx-auto text-muted-foreground">{children}</p>
);
const Header = ({ onGetStartedClick }: { onGetStartedClick: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];
  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border', scrolled ? 'bg-background/80 backdrop-blur-lg' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            <a href="/" aria-label="Homepage"><AppLogo /></a>
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <a href="/portal/login">Sign In</a>
              </Button>
              <Button onClick={onGetStartedClick} className="bg-gradient-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Get Your App <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-6 pt-10">
                    {navLinks.map((link) => <a key={link.name} href={link.href} className="text-lg font-medium">{link.name}</a>)}
                    <Button variant="outline" asChild>
                      <a href="/portal/login">Sign In</a>
                    </Button>
                    <Button onClick={onGetStartedClick} className="bg-gradient-brand text-white">Get Your App</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
const HeroSection = ({ content, onGetStartedClick }: { content?: WebsiteContent['hero'], onGetStartedClick: () => void }) => {
  const handleSeeExamples = () => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <section className="relative pt-40 pb-24 md:pt-48 lg:pb-32 text-center overflow-hidden">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-gradient-soft-light dark:bg-gradient-soft-dark"></div>
      <div className="glow-orb w-96 h-96 bg-deep-violet/50 -top-40 -left-40 animate-blob-spin"></div>
      <div className="glow-orb w-96 h-96 bg-electric-blue/50 -bottom-40 -right-40 animate-blob-spin [animation-delay:5s]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <Badge className="py-2 px-4 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-muted text-muted-foreground font-medium shadow-sm hover:border-black/20 dark:hover:border-white/20 hover:text-foreground transition-colors hover:bg-white dark:hover:bg-muted">
              <Wand2 className="mr-2 h-4 w-4" />
              EXPERIENCE
            </Badge>
          </motion.div>
          {content ? (
            <>
              <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: content.headline.replace('Simplified.', '<span class="text-gradient-animated">Simplified.</span>') }}></h1>
              <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground leading-relaxed">{content.subheadline}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-20 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto mt-6" />
            </>
          )}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button onClick={onGetStartedClick} size="lg" className="bg-gradient-brand text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-soft-glow">Get Started</Button>
            <Button onClick={handleSeeExamples} size="lg" variant="ghost" className="px-8 py-3 text-muted-foreground">See Examples</Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
          className="mt-20"
        >
          <div className="relative mx-auto w-full max-w-5xl group [perspective:1000px]">
            <motion.div
              className="relative rounded-xl border shadow-2xl shadow-deep-violet/10 animate-float-subtle"
              whileHover={{ scale: 1.02, rotateX: 5, rotateY: -5, transition: { duration: 0.3 } }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {content ? <img src={content.imageUrl} alt="Dashboard Mockup" className="relative rounded-xl" /> : <Skeleton className="w-full aspect-video rounded-xl" />}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
const HowItWorksSection = ({ content }: { content?: WebsiteContent['howItWorks'] }) => {
  const icons = [Workflow, Cpu, Cloud];
  return (
    <Section id="how-it-works" className="bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionEyebrow>Our Process</SectionEyebrow>
        <SectionHeading>How It Works</SectionHeading>
        <SectionSubheading>A simple 3-step process to get your custom app, designed for clarity and efficiency.</SectionSubheading>
        <div className="mt-20 relative">
          <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {(content || Array(3).fill(null)).map((step, index) => {
              const Icon = icons[index];
              const isEven = index % 2 === 0;
              return (
                <React.Fragment key={index}>
                  <div className={cn("md:col-start-1", isEven ? "" : "md:col-start-2")}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.6 }}
                      className={cn("text-center md:text-left", isEven ? "" : "md:text-right")}
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-brand text-white shadow-lg"><Icon className="w-8 h-8" /></div>
                      {step ? (
                        <>
                          <h3 className="text-2xl font-semibold">{step.title}</h3>
                          <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </>
                      ) : (
                        <>
                          <Skeleton className="h-8 w-40 mx-auto md:mx-0" />
                          <Skeleton className="h-5 w-64 mx-auto md:mx-0 mt-2" />
                        </>
                      )}
                    </motion.div>
                  </div>
                  <div className="hidden md:block relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-deep-violet"></div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};
const WhyChooseUsSection = ({ content }: { content?: WebsiteContent['whyChooseUs'] }) => {
  const icons = [Workflow, Cloud, Scaling, Cpu];
  return (
    <Section id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionEyebrow>Features</SectionEyebrow>
        <SectionHeading>Why Choose AppChahiye?</SectionHeading>
        <SectionSubheading>The perfect solution for your business operations, built with cutting-edge technology.</SectionSubheading>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(content || Array(4).fill(null)).map((feature, index) => {
            const Icon = icons[index];
            return (
              <MotionCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-2xl transition-shadow duration-300 hover:shadow-[0_10px_25px_-5px_rgba(91,46,255,0.2)]"
              >
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-gradient-brand text-white"><Icon className="w-6 h-6" /></div>
                  {feature ? <h3 className="text-xl font-semibold">{feature.title}</h3> : <Skeleton className="h-6 w-40" />}
                  {feature ? <p className="mt-2 text-muted-foreground">{feature.description}</p> : <Skeleton className="h-10 w-full mt-2" />}
                </CardContent>
              </MotionCard>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
const PortfolioSection = ({ content }: { content?: WebsiteContent['portfolio'] }) => (
  <Section id="portfolio" className="bg-muted/40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionEyebrow>Our Work</SectionEyebrow>
      <SectionHeading>See What We've Built</SectionHeading>
      <SectionSubheading>A glimpse into the custom solutions we've crafted for businesses like yours.</SectionSubheading>
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {(content || Array(4).fill(null)).map((project, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
              >
                {project ? (
                  <>
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                      <h3 className="text-white text-2xl font-bold">{project.name}</h3>
                      <p className="text-white/80 mt-1">{project.description || "Custom Web Application"}</p>
                    </div>
                  </>
                ) : <Skeleton className="w-full aspect-video" />}
              </motion.div>
            </DialogTrigger>
            {project && (
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                  <DialogDescription>{project.description || "A custom web application built to streamline business operations."}</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <img src={project.image} alt={project.name} className="w-full rounded-lg border" />
                </div>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>
    </div>
  </Section>
);
const TestimonialsSection = ({ content }: { content?: WebsiteContent['testimonials'] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  return (
    <Section id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionEyebrow>Testimonials</SectionEyebrow>
        <SectionHeading>Loved by Businesses Worldwide</SectionHeading>
        <div className="mt-20 relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {(content || Array(2).fill(null)).map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-full lg:w-1/2 p-4">
                  <Card className="h-full rounded-2xl">
                    <CardContent className="p-8">
                      {testimonial ? (
                        <>
                          <Quote className="w-8 h-8 text-deep-violet/50 mb-4" />
                          <p className="text-lg text-foreground">"{testimonial.text}"</p>
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
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-0 lg:-px-8 pointer-events-none">
            <Button onClick={scrollPrev} variant="outline" size="icon" className="rounded-full h-12 w-12 hidden lg:inline-flex pointer-events-auto"><ChevronLeft /></Button>
            <Button onClick={scrollNext} variant="outline" size="icon" className="rounded-full h-12 w-12 hidden lg:inline-flex pointer-events-auto"><ChevronRight /></Button>
          </div>
        </div>
      </div>
    </Section>
  );
};
const requirementsFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email is required'),
  company: z.string().min(2, 'Company name is required'),
  projectDescription: z.string().min(10, 'Please describe your project in a bit more detail'),
});
type RequirementsFormValues = z.infer<typeof requirementsFormSchema>;
const ContactSection = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RequirementsFormValues>({
    resolver: zodResolver(requirementsFormSchema),
  });
  const onSubmit = async (data: RequirementsFormValues) => {
    try {
      await api('/api/forms/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success('Thank you! Your message has been sent. We will get back to you shortly.');
      reset();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Section id="contact" className="bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="lg:pr-12">
            <SectionEyebrow>Contact Us</SectionEyebrow>
            <SectionHeading>Ready to Simplify Your Business?</SectionHeading>
            <p className="mt-4 text-lg text-muted-foreground">
              Fill out the form to give us a better understanding of your needs. The more detail you provide, the better we can assist you. Let's build something amazing together!
            </p>
          </div>
          <MotionCard className="p-8 md:p-10 rounded-2xl" whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(91, 46, 255, 0.2)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} className="mt-2" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} className="mt-2" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" {...register('company')} className="mt-2" />
                {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
              </div>
              <div>
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea id="projectDescription" {...register('projectDescription')} rows={4} className="mt-2" placeholder="Describe the main purpose and goals of your web app." />
                {errors.projectDescription && <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Your Project'}
              </Button>
            </form>
          </MotionCard>
        </div>
      </div>
    </Section>
  );
};
const Footer = () => (
    <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4 col-span-1 md:col-span-2">
                    <a href="/" aria-label="Homepage"><AppLogo /></a>
                    <p className="text-muted-foreground text-sm max-w-xs">Smart Web Apps for Smarter Businesses</p>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    &copy; {new Date().getFullYear()} AppChahiye. All rights reserved.
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline mx-2">·</span>
                    Islamabad, Pakistan
                </p>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <a href="https://instagram.com/appchahiye" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Instagram className="w-5 h-5" /></a>
                    <a href="https://facebook.com/appchahiye" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
    </footer>
);
export function HomePage() {
  const { content, fetchContent } = useContentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  useDynamicAssets(content?.brandAssets, content?.seoMetadata);
  const handleGetStartedClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <Toaster richColors />
      <GetStartedModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <Header onGetStartedClick={handleGetStartedClick} />
      <main>
        <HeroSection content={content?.hero} onGetStartedClick={handleGetStartedClick} />
        <HowItWorksSection content={content?.howItWorks} />
        <WhyChooseUsSection content={content?.whyChooseUs} />
        <PortfolioSection content={content?.portfolio} />
        <TestimonialsSection content={content?.testimonials} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}