"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background w-full">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-serif font-bold text-primary tracking-tight">
              Mike Loves Dogs
            </span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-bold text-foreground">
            <Link href="#about" className="hover:text-primary transition-colors">ABOUT</Link>
            <Link href="#services" className="hover:text-primary transition-colors">SERVICES</Link>
            <Link href="#clients" className="hover:text-primary transition-colors">OUR CLIENTS</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">CONTACT</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/app">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-lg transition-transform active:scale-95 shadow-md">
                Client Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh] md:min-h-[80vh]">
          {/* Left Side: Image */}
          <div className="relative min-h-[40vh] md:min-h-full">
            <Image
              src="/assets/dogwalker.png"
              alt="Dog walker"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {/* Right Side: Blue Banner */}
          <div className="bg-primary text-white flex flex-col justify-center items-center text-center p-12 md:p-24">
            <h1 className="text-4xl md:text-5xl font-serif font-normal leading-[1.3]">
              Hi! I’m Mike,<br/>
              an expert dog walker<br/>
              based in downtown<br/>
              Toronto
            </h1>
            <div className="mt-12">
              <Link href="#contact">
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary rounded-none px-10 py-6 text-xs tracking-widest uppercase transition-colors">
                  CONTACT ME
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-background text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-sans tracking-[0.2em] uppercase mb-8">A LITTLE BIT ABOUT ME</h2>
            <div className="w-12 h-px bg-primary/30 mx-auto mb-10" />
            <p className="text-lg text-foreground/80 leading-relaxed font-serif">
              I'm a paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me to add your own content and make changes to the font. Feel free to drag and drop me anywhere you like on your page. I’m a great place for you to tell a story and let your users know a little more about you.
            </p>
          </div>
        </section>

        {/* Parallax Image Section — fixed on desktop, scroll on iOS/touch */}
        <section className="parallax-section w-full h-[60vh]" />

        {/* Services & Fees */}
        <section id="services" className="py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-xs font-sans tracking-[0.2em] uppercase mb-8">SERVICES AND FEES</h2>
              <div className="w-12 h-px bg-primary/30 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "DOG WALKING", price: "30 mins $21.00 | 60 mins $36.00" },
                { title: "PUPPY CARE", price: "30 mins $21.00 | 60 mins $36.00" },
                { title: "VACATION PET SITTING", price: "30 mins $21.00 | 60 mins $36.00" }
              ].map((service, i) => (
                <div key={i} className="bg-background p-10 text-center border border-primary/20">
                  <h6 className="text-xs font-sans tracking-[0.1em] uppercase text-foreground mb-6">{service.title}</h6>
                  <p className="text-foreground/80 mb-8 font-serif leading-relaxed text-[15px]">
                    I'm a paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me to add your own content and make changes to the font. I’m a great place for you to tell a story and let your users know a little more about you.
                  </p>
                  <p className="text-primary text-[15px]">{service.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Happy Clients Banner */}
        <section className="bg-primary text-white py-16 text-center">
          <h2 className="text-xs font-sans tracking-[0.2em] uppercase">SOME HAPPY CLIENTS</h2>
        </section>

        {/* Happy Clients Grid */}
        <section id="clients" className="w-full bg-background">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
             {[
               { id: 1, name: "Charlie", color: "#c5a880", img: "/assets/charlie.jpg" },
               { id: 2, name: "Luke", color: "#f5a623", img: "/assets/luke.jpg" },
               { id: 3, name: "Mikey", color: "#4a90e2", img: "/assets/mikey.jpg" },
               { id: 4, name: "Spot", color: "#e4a7b7", img: "/assets/spot.jpg" }
             ].map((dog) => (
               <div key={dog.id} className="aspect-square relative group overflow-hidden bg-white">
                 <Image 
                   src={dog.img} 
                   alt={`${dog.name} the happy client`} 
                   fill 
                   className="object-cover" 
                   unoptimized
                 />
                 {/* Hover Overlay � backgroundColor is dynamic per-dog data, inline style is required */}
                 {/* eslint-disable-next-line react/forbid-component-props */}
                 <div 
                   className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ backgroundColor: dog.color }}
                 >
                   <h3 className="text-white font-serif text-2xl mb-4">{dog.name}</h3>
                   <p className="text-white font-serif text-sm leading-relaxed">
                     "I'm a testimonial. Click to edit me and add text that says something nice about you and your services. Let your customers review you and tell their friends how great you are."
                   </p>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* Contact Split Section */}
        <section id="contact" className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
          {/* Left Side: Contact Image */}
          <div className="relative min-h-[40vh] md:min-h-full">
             <Image 
               src="/assets/bottomdog.png" 
               alt="Dogs on a path" 
               fill 
               className="object-cover" 
               unoptimized
             />
          </div>
          {/* Right Side: Contact Info and Form */}
          <div className="bg-white p-12 md:p-24 flex flex-col items-center justify-center text-center border-t border-border md:border-t-0">
            <h2 className="text-xs font-sans tracking-[0.2em] uppercase mb-8">CONTACT ME</h2>
            <div className="flex gap-4 justify-center mb-8">
              {['f', 't', 'in', 'ig'].map(icon => (
                <div key={icon} className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-white text-xs font-sans uppercase">
                  {icon}
                </div>
              ))}
            </div>
            <div className="mb-12 font-serif text-lg text-foreground/80">
              <p>1-800-000-0000</p>
              <p>info@mysite.com</p>
            </div>
            
            {/* Simple Form Layout */}
            <form className="w-full max-w-md space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-[11px] uppercase tracking-wider text-foreground/60 block">First name *</label>
                  <input id="firstName" type="text" className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-[11px] uppercase tracking-wider text-foreground/60 block">Last name *</label>
                  <input id="lastName" type="text" className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[11px] uppercase tracking-wider text-foreground/60 block">Email *</label>
                <input id="email" type="email" className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-[11px] uppercase tracking-wider text-foreground/60 block">Message *</label>
                <textarea id="message" className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary transition-colors resize-none h-10"></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-foreground text-white hover:bg-foreground/90 rounded-none px-8 font-sans">Let's Chat!</Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background border-t border-border text-center text-sm font-bold text-foreground/60">
        <p>© 2035 by Mike Loves Dogs.</p>
      </footer>
    </div>
  );
}
