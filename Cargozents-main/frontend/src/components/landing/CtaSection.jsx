const CtaSection = () => {
  return (
    <section className="px-6 py-28 md:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
          Stop paying for empty kilometers.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[#5B7A70]">
          Join as a shipper, driver, or buyer \u2014 the network works better the moment you're on it.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-accent px-7 py-3 font-semibold text-primary transition hover:shadow-glow"
          >
            Create your account
          </a>
          <a
            href="/contact"
            className="rounded-lg border border-primary/20 px-7 py-3 font-semibold text-primary transition hover:border-primary/50"
          >
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
