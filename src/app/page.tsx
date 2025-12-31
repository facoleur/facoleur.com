import { Features, Problems, Projects } from "@/components/Homepage";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="prose dark:prose-invert mx-auto grid w-full grid-cols-1 bg-repeat py-6">
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
                <Image
                  width={400}
                  height={300}
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
            {/* @ts-expect-error suppress any warning */}
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
                  {/* @ts-expect-error suppress any warning */}
                  {pkg.features.map((feature, i: number) => (
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
            {/* @ts-expect-error suppress any warning */}
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
