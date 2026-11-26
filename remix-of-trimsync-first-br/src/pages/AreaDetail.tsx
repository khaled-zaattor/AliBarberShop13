import SiteLayout from "@/components/SiteLayout";
import ServiceCard from "@/components/ServiceCard";
import FaqSection from "@/components/FaqSection";
import { BUSINESS, addressLine } from "@/data/business";
import { AREAS, areaPath, type AreaPage } from "@/data/areas";
import { getService, type StaticService } from "@/data/services";
import { MapPin, Clock, Car } from "lucide-react";

/**
 * One nearby-area page. All copy comes from src/data/areas.ts — see the rules at
 * the top of that file before adding an area. The page always states plainly
 * that the shop is in Pinellas Park; it's a "how to get here from there" page,
 * not a pretend second location.
 */
const AreaDetail = ({ area }: { area: AreaPage }) => {
  const services = area.featuredServices
    .map(getService)
    .filter((s): s is StaticService => Boolean(s));
  const others = AREAS.filter((a) => a.slug !== area.slug);

  return (
    <SiteLayout
      title={`Barber Near ${area.name}`}
      intro={
        <>
          <p className="text-primary-foreground text-lg">
            {BUSINESS.name} · {addressLine()}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 list-none p-0 text-sm">
            <li className="flex items-center gap-2">
              <Car size={16} className="text-accent" aria-hidden="true" />
              {area.driveTime} from {area.name}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-accent" aria-hidden="true" />
              {area.distance}
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-accent" aria-hidden="true" />
              Open 7 days
            </li>
          </ul>
          <a
            href="/#booking"
            className="inline-block mt-6 bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Book an appointment →
          </a>
        </>
      }
      trail={[
        { name: "Home", url: "/" },
        { name: "Areas We Serve", url: "/areas/" },
        { name: area.name, url: areaPath(area) },
      ]}
    >
      <section className="py-20 section-padding bg-background">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            {area.intro.map((p, i) => (
              <p
                key={i}
                className="font-body text-muted-foreground leading-relaxed mb-5 text-[1.05rem]"
              >
                {p}
              </p>
            ))}

            <h2 className="font-display text-foreground text-3xl uppercase tracking-tight mt-12">
              Getting here from {area.name}
            </h2>
            <ol className="mt-6 space-y-4 list-none p-0">
              {area.directions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-accent text-2xl leading-none w-6 shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-body text-muted-foreground leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 font-body text-sm text-accent hover:underline"
            >
              Open directions in Google Maps →
            </a>
          </div>

          <aside className="border border-border p-8">
            <h2 className="font-display text-foreground text-2xl uppercase tracking-wide">
              The shop
            </h2>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mt-4">
              {BUSINESS.name}
              <br />
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.city}, {BUSINESS.address.region}{" "}
              {BUSINESS.address.postalCode}
              <br />
              <a href={BUSINESS.phone.href} className="text-accent hover:underline">
                {BUSINESS.phone.display}
              </a>
            </p>
            <ul className="font-body text-muted-foreground text-sm mt-6 space-y-1 list-none p-0">
              <li>Mon–Fri: 9:00 AM – 8:00 PM</li>
              <li>Sat: 9:00 AM – 7:00 PM</li>
              <li>Sun: 9:00 AM – 3:00 PM</li>
            </ul>
            <p className="font-body text-muted-foreground text-sm mt-6">
              Free parking · Walk-ins welcome · English &amp; Arabic
            </p>
          </aside>
        </div>
      </section>

      <section className="py-20 section-padding bg-secondary">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-secondary-foreground text-4xl md:text-5xl uppercase tracking-tight">
            Why {area.name} clients make the trip
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {area.reasons.map((r) => (
              <div key={r.title} className="border-t border-accent pt-4">
                <h3 className="font-display text-secondary-foreground text-xl uppercase tracking-wide">
                  {r.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mt-2">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="py-20 section-padding bg-background">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="font-display text-foreground text-3xl md:text-4xl uppercase tracking-tight">
              Popular services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {services.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
            <a
              href="/services/"
              className="inline-block mt-8 font-body text-sm text-accent hover:underline"
            >
              All services and prices →
            </a>
          </div>
        </section>
      )}

      {area.faqs.length > 0 && (
        <FaqSection
          faqs={area.faqs}
          heading={`${area.name} — Questions`}
          className="bg-secondary"
        />
      )}

      <section className="py-20 section-padding bg-background border-t border-border">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-foreground text-2xl uppercase tracking-wide">
            Other nearby areas
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 list-none p-0 font-body text-sm">
            <li>
              <a href="/" className="text-accent hover:underline">
                Pinellas Park (the shop)
              </a>
            </li>
            {others.map((a) => (
              <li key={a.slug}>
                <a href={areaPath(a)} className="text-accent hover:underline">
                  Barber near {a.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
};

export default AreaDetail;
