import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "Capture Every Idea",
      description:
        "Save quotes, notes, and research snippets in one organized space",
      image: "/images/note_list.svg",
    },
    {
      id: 2,
      title: "Smart Organization",
      description:
        "Auto-tag your content and find anything instantly with powerful search",
      image: "/images/search.svg",
    },
    {
      id: 3,
      title: "Always Accessible",
      description: "Your research notebook, available anywhere, anytime",
      image: "/images/file_access.svg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center">
      {/* Carousel Section */}
      <div className="w-full max-w-md px-6">
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="min-w-full flex flex-col items-center text-center px-4"
                >
                  <div className="w-64 h-64 rounded-3xl bg-linear-to-br flex items-center justify-center mb-6 p-8">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-foreground mb-3">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-sm">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 items-center justify-center rounded-full bg-card border border-border hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 items-center justify-center rounded-full bg-card border border-border hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* CTA + Footer  */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full py-3 px-6 rounded-full bg-primary text-primary-foreground font-medium text-base hover:scale-[1.02] transition-all"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full py-3 px-6 rounded-full border border-primary text-primary font-medium text-base hover:bg-primary/5 hover:scale-[1.02] transition-all"
          >
            Login to Account
          </button>

          <p className="pt-3 text-center text-sm text-muted-foreground">
            Your research, organized and accessible
          </p>
        </div>
      </div>
    </div>
  );
}
