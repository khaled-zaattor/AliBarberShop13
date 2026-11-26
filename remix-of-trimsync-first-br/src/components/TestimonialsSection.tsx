import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";
import ClientOnly from "@/components/ClientOnly";

type Testimonial = (typeof TESTIMONIALS)[number];

const Card = ({ t, hidden = false }: { t: Testimonial; hidden?: boolean }) => (
  <div
    aria-hidden={hidden || undefined}
    className="w-[340px] shrink-0 bg-primary-foreground/10 border border-primary-foreground/15 p-8 flex flex-col justify-between"
  >
    <div>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} size={14} className="fill-accent text-accent" />
        ))}
      </div>
      <p className="font-body text-primary-foreground text-sm leading-relaxed italic">
        "{t.text}"
      </p>
    </div>
    <p className="font-display text-primary-foreground/60 text-lg uppercase tracking-wider mt-6">
      {t.name}
    </p>
  </div>
);

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 bg-primary overflow-hidden">
    <div className="section-padding mb-12">
      <h2 className="font-display text-primary-foreground text-5xl md:text-7xl uppercase tracking-tight text-center">
        What They Say
      </h2>
    </div>

    <div className="relative">
      <div className="flex animate-marquee gap-6 w-max">
        {TESTIMONIALS.map((t, i) => (
          <Card key={i} t={t} />
        ))}
        {/* The marquee loops by scrolling a second copy into view. That copy is
            visual only: it's added in the browser and hidden from screen
            readers, so the prerendered HTML lists each review once. */}
        <ClientOnly>
          {TESTIMONIALS.map((t, i) => (
            <Card key={`dup-${i}`} t={t} hidden />
          ))}
        </ClientOnly>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
