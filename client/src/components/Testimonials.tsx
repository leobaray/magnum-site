import { useState, useCallback, useEffect } from "react";
import { testimonials } from "@/data/testimonials";
import { Star, StarHalf, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Update selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="depoimentos" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 bg-gradient-to-br from-white via-gray-50 to-slate-50 overflow-hidden">
      {/* Background decorative elements - consistent with other sections */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-400/3 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Geometric patterns for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3">
        <div className="w-full h-full border border-primary/30 rotate-12 rounded-2xl"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 opacity-3">
        <div className="w-full h-full border border-gray-400/30 rotate-45 rounded-full"></div>
      </div>
      
      {/* Floating dots pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 right-40 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-48 left-24 w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-24 left-40 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary mr-2" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Depoimentos</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-montserrat relative leading-tight">
            O Que Nossos 
            <span className="text-primary relative block sm:inline">
              {" "}Clientes Dizem
              {/* Subtle underline accent */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-primary to-gray-300 rounded-full transform scale-x-75"></div>
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Conheça as experiências reais de quem já utilizou nossos serviços e comprovou nossa qualidade excepcional.
          </p>
        </div>
        
        {/* Testimonials Carousel */}
        <div className="testimonials-container relative max-w-7xl mx-auto group">
          <div className="embla overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="embla__container flex -ml-6">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6"
                >
                  {/* Clean and elegant testimonial card */}
                  <div className="bg-white rounded-2xl p-8 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-gray-100 relative overflow-hidden h-full group/card select-none">
                    {/* Simple decorative accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover/card:bg-primary/8 transition-colors duration-300"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Simple rating display */}
                      <div className="flex items-center justify-between mb-6">
                        <Quote className="text-primary h-8 w-8 opacity-60" />
                        <div className="flex items-center space-x-1">
                          {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                          {testimonial.rating % 1 !== 0 && (
                            <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Clean testimonial content */}
                      <blockquote className="text-gray-700 mb-8 leading-relaxed flex-grow text-lg italic">
                        "{testimonial.content}"
                      </blockquote>
                      
                      {/* Simple author section */}
                      <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
                        <div className="w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-gray-200 group-hover/card:ring-primary/30 transition-all duration-300 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          <span className="text-white font-bold text-lg font-montserrat">{testimonial.initials}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 font-montserrat">{testimonial.name}</h4>
                          <p className="text-gray-500 text-sm">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Navigation buttons */}
          <button
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-2xl rounded-full p-4 z-20 transition-all duration-300 opacity-80 md:opacity-0 md:group-hover:opacity-90 hover:scale-110 active:scale-95 border border-white/50 group/btn"
            onClick={scrollPrev}
            aria-label="Depoimento anterior"
            data-testid="testimonials-prev-button"
          >
            <ChevronLeft className="w-5 h-5 text-primary group-hover/btn:text-primary transition-colors duration-200" />
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300"></div>
          </button>
          
          <button
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-2xl rounded-full p-4 z-20 transition-all duration-300 opacity-80 md:opacity-0 md:group-hover:opacity-90 hover:scale-110 active:scale-95 border border-white/50 group/btn"
            onClick={scrollNext}
            aria-label="Próximo depoimento"
            data-testid="testimonials-next-button"
          >
            <ChevronRight className="w-5 h-5 text-primary group-hover/btn:text-primary transition-colors duration-200" />
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300"></div>
          </button>
          
          {/* Simple and clean dots indicator */}
          <div className="flex justify-center items-center space-x-2 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Ver depoimento ${index + 1}`}
                data-testid={`testimonials-dot-${index}`}
              />
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}