import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="prose dark:prose-invert mx-auto grid w-full grid-cols-1 bg-repeat p-6 lg:grid-cols-[1fr_4fr_1fr]">
      <div></div>
      <div className="space-y-24">
        <section className="text-center">
          <h1>{t("homepage.hero.title")}</h1>
          <p>{t("homepage.hero.subtitle")}</p>
          <Button>{t("homepage.hero.cta")}</Button>
        </section>

        <section>
          <p className="!mb-0 !pb-0 !text-slate-500">
            {t("homepage.logos.title")}
          </p>
          <div className="marquee-wrapper">
            <div className="marquee grid grid-cols-6 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <img
                  key={`a-${i}`}
                  src={`/clientsLogo/${i + 1}.png`}
                  alt={`client ${i + 1}`}
                  className="inline-block w-auto grayscale transition hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2>{t("homepage.problems.title")}</h2>
          <Problems />
        </section>

        <section>
          <h2>{t("homepage.features.title")}</h2>
          <Features />
        </section>

        <section className="text-center">
          <h2>{t("homepage.cta.title")}</h2>
          <p>{t("homepage.cta.subtitle")}</p>
          <Button>{t("homepage.cta.button")}</Button>
        </section>

        <section>
          <h2>{t("homepage.packages.title")}</h2>
          <div className="grid gap-1 md:grid-cols-2" id="pricing">
            {t.raw("homepage.packages.items").map((pkg) => (
              <div
                key={pkg.name}
                className="flex h-full flex-col justify-between bg-slate-200/60 p-6"
              >
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-200/60">
                    {pkg.name}
                  </h3>
                  <p className="font-medium text-slate-600 dark:text-slate-300">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-4 flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-200/60">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="dark:bg-slate-800/80">
                      {feature}
                    </div>
                  ))}

                  <div className="mt-auto">
                    <p className="mt-8 !mb-0">A partir de </p>
                    <span className="text-2xl font-semibold">
                      {pkg.price}
                    </span>{" "}
                    <span>{pkg.par}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Projects />

        <section>
          <h2>{t("homepage.faq.title")}</h2>
          <div className="flex flex-col gap-1">
            {t.raw("homepage.faq.items").map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-0 bg-slate-200/60 p-4"
              >
                <h3 className="!m-0 !p-0">{item.question}</h3>
                <p className="!m-0 !p-0">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2>{t("homepage.cta.title")}</h2>
          <p>{t("homepage.cta.subtitle")}</p>
          <Button>{t("homepage.cta.button")}</Button>
        </section>
      </div>
      <div></div>
    </div>
  );
}

const Problems = () => {
  const t = useTranslations();
  const items = t.raw("homepage.problems.items") || [];

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="flex flex-col">
          <Image
            width={400}
            height={300}
            src={item.image ?? `/homepage/${item.img}`}
            alt={item.pain ?? `item-${idx}`}
            className="mb-3 bg-slate-200/60"
          />
          <h3 className="mb-2 text-left text-lg font-semibold text-slate-900 dark:text-slate-200/60">
            {item.pain}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {item.solution}
          </p>
        </div>
      ))}
    </div>
  );
};

const Features = () => {
  const t = useTranslations();
  const items = t.raw("homepage.features.items") || [];

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-1">
        <div className="flex flex-col gap-2 bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[0].pain}</h3>
            <p className="text-sm">{items[0].solution}</p>
          </div>
          <img src="homepage/offer.png" alt="" className="px-16 pb-8" />
        </div>

        <div className="flex flex-col gap-2 bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[2].pain}</h3>
            <p className="text-sm">{items[2].solution}</p>
          </div>
          <img src="homepage/stripe.png" alt="" className="px-8 py-12" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <div className="p- flex flex-col justify-between bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[3].pain}</h3>
            <p className="text-sm">{items[3].solution}</p>
          </div>
          <img src="homepage/chart.png" alt="" />
        </div>

        <div className="bg-slate-200/60 p-4">
          <h3 className="text-lg font-semibold">{items[1].pain}</h3>
          <p className="text-sm">{items[1].solution}</p>
          <img src="homepage/avis.png" alt="" className="px-20 py-8" />
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const t = useTranslations();

  return (
    <div className="flex h-48 flex-row gap-1 bg-slate-200/60 p-6">
      <div className="group relative top-[-70px] overflow-visible">
        {/* images layer */}
        <div className="pointer-events-none absolute z-10 h-[220px] w-[320px]">
          <div className="relative h-full w-full">
            <img
              src="homepage/av.png"
              className="absolute top-8 left-4 h-32 w-42 rounded shadow-lg transition-transform duration-150 group-hover:-translate-x-2 group-hover:-translate-y-8 group-hover:-rotate-3"
            />
            <img
              src="homepage/te.png"
              className="absolute top-6 left-8 h-32 w-42 rounded shadow-lg transition-transform duration-150 group-hover:-translate-y-8"
            />
            <img
              src="homepage/mp.png"
              className="group:hover:translate-x-2 absolute top-12 left-15 h-32 w-42 rounded shadow-lg transition-transform duration-150 group-hover:translate-x-2 group-hover:-translate-y-8 group-hover:rotate-4"
            />
          </div>
        </div>

        {/* folder layer */}
        <div>
          <svg
            viewBox="0 0 1657 878"
            xmlns="http://www.w3.org/2000/svg"
            className="relative top-20 z-20 h-32 w-auto"
          >
            <path
              d="M553.2 0H24C10.7452 0 0 10.7451 0 24V853.028C0 866.283 10.7452 877.028 24 877.028H1632.61C1645.86 877.028 1656.61 866.283 1656.61 853.028V165.443C1656.61 152.189 1645.86 141.443 1632.61 141.443H750.242C744.875 141.443 739.662 139.644 735.438 136.333L568.004 5.11018C563.78 1.79924 558.567 0 553.2 0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="ml-4 flex h-full flex-col justify-end">
        <h2 className="!mb-0">{t("homepage.completed.title")}</h2>
        <p>{t("homepage.completed.subtitle")}</p>
      </div>
    </div>
  );
};

type ZoomImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

export const ZoomImage = ({
  src = "/homepage/Europe.png",
  alt = "Zoomed Image",
  width = 1200,
  height = 800,
  className = "",
}: ZoomImageProps) => {
  return (
    <div className="flex h-full w-full justify-center overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ transformOrigin: "29% 67%" }}
        className={`h-56 w-56 rounded-lg object-cover transition-transform duration-300 ease-in-out hover:scale-250 ${className}`}
      />
    </div>
  );
};
