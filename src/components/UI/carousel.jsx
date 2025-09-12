import React, { useState, useEffect, useCallback } from "react";

const CarouselContext = React.createContext();

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
};

const Carousel = ({ className, children, setApi, autoPlay = true, ...props }) => {
  const [current, setCurrent] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const scrollTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  const scrollPrev = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  }, [slideCount]);

  const scrollNext = useCallback(() => {
    setCurrent((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  }, [slideCount]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const interval = setInterval(() => {
      scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, scrollNext, slideCount]);

  // Set up the API for external control
  useEffect(() => {
    if (setApi) {
      setApi({
        scrollTo,
        scrollPrev,
        scrollNext,
        selectedScrollSnap: () => current,
        canScrollPrev: () => current !== 0,
        canScrollNext: () => current !== slideCount - 1,
      });
    }
  }, [setApi, scrollTo, scrollPrev, scrollNext, current, slideCount]);

  const contextValue = {
    current,
    scrollTo,
    scrollPrev,
    scrollNext,
    setSlideCount,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <div className={`relative ${className}`} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

const CarouselContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { current, setSlideCount } = useCarousel();
  
  useEffect(() => {
    setSlideCount(React.Children.count(children));
  }, [children, setSlideCount]);

  return (
    <div ref={ref} className={`overflow-hidden h-full ${className}`} {...props}>
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex-[0_0_100%] h-full ${className}`}
      {...props}
    />
  );
});

const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
  const { scrollPrev, current } = useCarousel();
  const canScrollPrev = current !== 0;

  return (
    <button
      ref={ref}
      className={`absolute top-1/2 transform -translate-y-1/2 z-30 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all duration-300 ${className}`}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      <span className="sr-only">Previous slide</span>
    </button>
  );
});

const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
  const { scrollNext, current, slideCount } = useCarousel();
  const canScrollNext = current !== slideCount - 1;

  return (
    <button
      ref={ref}
      className={`absolute top-1/2 right-4 transform -translate-y-1/2 z-30 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all duration-300 ${className}`}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span className="sr-only">Next slide</span>
    </button>
  );
});

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};