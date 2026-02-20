import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Products from "@/components/Products";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function Home() {
  // Força scroll para o topo quando a página carrega
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Products />
        <Partners />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
