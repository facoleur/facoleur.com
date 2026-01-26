import { CallBanner } from "@/components/CallBanner";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Features, Problems, Projects } from "@/components/Homepage";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations();
  const essentialsRaw = t.raw("homepage.essentials.items");
  const essentials = Array.isArray(essentialsRaw)
    ? (essentialsRaw as { src: string; title: string; desc: string }[])
    : [];
  const faqItemsRaw = t.raw("homepage.faq.items");
  const faqItems = Array.isArray(faqItemsRaw)
    ? (faqItemsRaw as { question: string; answer: string }[])
    : [];
  const problemsRaw = t.raw("homepage.problems.items");
  const problems = Array.isArray(problemsRaw)
    ? (problemsRaw as {
        pain: string;
        solution: string;
        image?: string;
        img?: string;
      }[])
    : [];
  const featuresRaw = t.raw("homepage.features.items");
  const features = Array.isArray(featuresRaw)
    ? (featuresRaw as { pain: string; solution: string }[])
    : [];

  return (
    <div className="prose mx-auto grid w-full grid-cols-1 bg-repeat py-6 md:px-4">
      <div className="space-y-36">
        <section className="flex flex-col items-center gap-2 text-center">
          <span className="w-fit p-1 px-3 font-medium text-slate-600">
            {t("homepage.hero.agency")}
          </span>
          <h1>{t("homepage.hero.title")}</h1>
          {/* <p>{t("homepage.hero.subtitle")}</p> */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/free-audit">
              <Button>{t("homepage.hero.cta.audit")}</Button>
            </Link>
            <a href="https://app.cal.eu/facoleur/strategie30">
              <Button variant={"ghost"}>{t("homepage.hero.cta.call")}</Button>
            </a>
          </div>
        </section>

        <section>
          <p className="!mb-0 !pb-0 !text-slate-500">
            {t("homepage.logos.title")}
          </p>
          <div className="marquee-wrapper">
            <div className="marquee grid grid-cols-3 gap-1 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Image
                  key={i}
                  width={400}
                  height={300}
                  src={`/clientsLogo/${i + 1}.png`}
                  alt={`client ${i + 1}`}
                  className="inline-block w-auto grayscale transition hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="!mb-12 !text-4xl">{t("homepage.problems.title")}</h2>
          <Problems items={problems} />
        </section>

        <section>
          <h2 className="!mb-12 !text-4xl">
            {t("homepage.essentials.title", {
              year: String(new Date().getFullYear()),
            })}
          </h2>
          <div className="grid gap-1 md:grid-cols-3">
            {essentials.map((item, i) => (
              <div key={i} className="flex flex-col gap-3 bg-slate-200/60 p-6">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={320}
                  height={200}
                  className="w-12 max-w-xs object-contain py-4"
                />
                <h3 className="!m-0 !text-xl font-semibold">{item.title}</h3>
                <p className="!m-0 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="solutions">
          <h2 className="!mb-12 !text-4xl">{t("homepage.features.title")}</h2>
          <Features items={features} />
        </section>

        <section>
          <h2 className="!mb-12 !text-4xl">{t("homepage.process.title")}</h2>
          <div className="flex flex-col gap-1">
            {t
              .raw("homepage.process.items")
              .map(
                (step: { title: string; description: string }, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between gap-4 rounded bg-slate-200/60 p-6 md:flex-row md:gap-2"
                  >
                    <div className="text-2xl font-semibold text-slate-900 md:min-w-16 dark:text-slate-100">
                      0{i + 1}.
                    </div>
                    <h3 className="!m-0 mt-2 w-full !p-0 !text-left font-medium md:w-1/2">
                      {step.title}
                    </h3>
                    <p className="!mt-auto w-full text-sm text-slate-600 md:w-96 dark:text-slate-300">
                      {step.description}
                    </p>
                  </div>
                ),
              )}
          </div>
        </section>

        <section className="text-center">
          <h2 className="!text-4xl">{t("homepage.cta1.title")}</h2>
          <p>{t("homepage.cta1.subtitle")}</p>
          <Button>{t("homepage.cta1.button")}</Button>
        </section>

        <section>
          <h2 className="!mb-12 !text-4xl">{t("homepage.packages.title")}</h2>
          <div className="grid gap-1 md:grid-cols-2" id="pricing">
            {t
              .raw("homepage.packages.items")
              .map(
                (pkg: {
                  name: string;
                  description: string;
                  features: string[];
                  price: string;
                  par: string;
                }) => (
                  <div
                    key={pkg.name}
                    className="flex h-full flex-col justify-between bg-slate-200/60 p-6"
                  >
                    <div>
                      <h3 className="mb-2 !text-2xl font-semibold text-slate-900 dark:text-slate-200">
                        {pkg.name}
                      </h3>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="my-4 flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                      {pkg.features.map((feature, i) => (
                        <div key={i} className="dark:bg-slate-800/80">
                          {feature}
                        </div>
                      ))}

                      <a className="!pt-4" href="https://app.cal.eu/facoleur/strategie30">
                        <Button>Réserver un appel</Button>
                      </a>
                      {/* <div className="mt-auto">
                        <p className="mt-8 !mb-0">A partir de</p>
                        <span className="text-2xl font-semibold">
                          {pkg.price}
                        </span>{" "}
                        <span>{pkg.par}</span>
                      </div> */}
                    </div>
                  </div>
                ),
              )}
          </div>
        </section>

        <Projects
          title={t("homepage.completed.title")}
          subtitle={t("homepage.completed.subtitle")}
        />

        <section className="flex flex-col gap-2 md:flex-row md:items-start">
          <h2 className="top-24 !mb-12 w-full !text-4xl md:sticky md:w-1/3 md:self-start">
            {t("homepage.faq.title")}
          </h2>
          <FaqAccordion items={faqItems} />
        </section>

        <CallBanner
          title={t("homepage.cta2.title")}
          subtitle={t("homepage.cta2.subtitle")}
          buttonLabel={t("homepage.cta2.button")}
        />
      </div>
    </div>
  );
}
