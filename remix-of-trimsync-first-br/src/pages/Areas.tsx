import SiteLayout from "@/components/SiteLayout";
import { BUSINESS, addressLine } from "@/data/business";
import { AREAS, areaPath } from "@/data/areas";

/** Hub for the nearby-area pages. Links every one so none is an orphan. */
const Areas = () => (
  <SiteLayout
    title="Areas We Serve"
    intro={
      <p>
        {BUSINESS.name} has one location: {addressLine()}. These are the nearby
        areas clients come from most, each with directions and drive times.
      </p>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: "Areas We Serve", url: "/areas/" },
    ]}
  >
    <section className="py-20 section-padding bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/"
            className="block border border-accent p-6 hover:bg-secondary transition-colors"
          >
            <p className="font-body text-xs uppercase tracking-widest text-accent">
              The shop is here
            </p>
            <h2 className="font-display text-foreground text-2xl uppercase tracking-wide mt-2">
              Pinellas Park
            </h2>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mt-3">
              4201 62nd Ave N, Unit 9. Free parking right outside, walk-ins
              welcome, open seven days.
            </p>
          </a>

          {AREAS.map((a) => (
            <a
              key={a.slug}
              href={areaPath(a)}
              className="block border border-border p-6 hover:border-accent hover:bg-secondary transition-colors"
            >
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                {a.direction} · {a.driveTime}
              </p>
              <h2 className="font-display text-foreground text-2xl uppercase tracking-wide mt-2">
                {a.name}
              </h2>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mt-3">
                {a.summary}
              </p>
              <span className="inline-block font-body text-sm text-accent mt-4">
                Directions from {a.name} →
              </span>
            </a>
          ))}
        </div>

        <p className="font-body text-muted-foreground leading-relaxed mt-12 max-w-3xl">
          The shop is also an easy drive from Gulfport, South Pasadena, Gateway
          and Feather Sound, and from the beaches, including Treasure Island,
          Madeira Beach and the Redingtons. Wherever you're coming from, book
          online and your chair will be ready when you arrive.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 font-body text-sm">
          <a href="/#booking" className="text-accent hover:underline">
            Book an appointment →
          </a>
          <a href="/contact/" className="text-accent hover:underline">
            Contact &amp; directions →
          </a>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default Areas;
