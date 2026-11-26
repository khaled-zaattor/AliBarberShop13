import { BUSINESS } from "@/data/business";

/**
 * Stands in for the booking widget wherever the widget itself isn't there yet:
 * in the prerendered HTML, while its chunk loads, and if it fails. Keeps the
 * `#booking` anchor real so every "Book" link lands somewhere, and always gives
 * the visitor a way to book by phone.
 */
const BookingFallback = ({ failed = false }: { failed?: boolean }) => (
  <section id="booking" className="py-24 section-padding bg-primary">
    <div className="max-w-[1400px] mx-auto text-center">
      <h2 className="font-display text-primary-foreground text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight">
        Book Your Appointment
      </h2>
      <p className="font-body text-primary-foreground/60 mt-4">
        {failed
          ? "The booking calendar didn't load."
          : "Loading the booking calendar…"}{" "}
        You can also call or text{" "}
        <a href={BUSINESS.phone.href} className="underline text-primary-foreground">
          {BUSINESS.phone.display}
        </a>{" "}
        to book.
      </p>
      {failed && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 font-body text-sm font-semibold uppercase tracking-widest bg-accent text-accent-foreground px-6 py-3 hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      )}
    </div>
  </section>
);

export default BookingFallback;
