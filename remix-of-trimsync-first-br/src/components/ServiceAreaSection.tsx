import { BUSINESS } from "@/data/business";
import { AREAS, areaPath } from "@/data/areas";

// Pinellas Park is the primary location relationship — the shop is physically
// there, and distance is one of the three factors Google names for local
// ranking. The others are genuine nearby areas described honestly as places
// clients travel from, each linking to its own directions page. The copy lives
// in src/data/areas.ts so this section and those pages can't disagree.

const ServiceAreaSection = () => {
  return (
    <section id="service-area" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Serving Pinellas Park &amp; Nearby
        </h2>
        <p className="font-body text-muted-foreground mt-4 max-w-2xl">
          The shop is in Pinellas Park, Florida, at 4201 62nd Ave N with free
          parking right outside. These nearby areas are a short drive away.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {AREAS.map((a) => (
            <div key={a.slug} className="border-t border-accent pt-4">
              <h3 className="font-display text-secondary-foreground text-xl uppercase tracking-wide">
                <a href={areaPath(a)} className="hover:text-accent transition-colors">
                  {a.name}
                </a>
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mt-2">
                {a.summary}
              </p>
              <a
                href={areaPath(a)}
                className="inline-block font-body text-sm text-accent hover:underline mt-2"
              >
                Barber near {a.name} →
              </a>
            </div>
          ))}
        </div>

        <p className="font-body text-muted-foreground text-sm mt-12 flex flex-wrap gap-6">
          <a href="/areas/" className="text-accent hover:underline">
            All areas we serve →
          </a>
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Get directions on Google Maps →
          </a>
        </p>
      </div>
    </section>
  );
};

export default ServiceAreaSection;
