import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("404");

  return (
    <div className="grid grid-cols-[0fr_1fr_0fr] gap-0 sm:grid-cols-[1fr_2fr_1fr] sm:gap-12">
      <div></div>
      <div>
        <h1 className="!mb-12">{t("title")}</h1>

        {t
          .raw("texts")
          .map((text: { heading: string; desc: string }, index: number) => (
            <div className="mb-8" key={index}>
              <h2>{text.heading}</h2>
              <p>{text.desc}</p>
            </div>
          ))}
      </div>

      <div></div>
    </div>
  );
};

export default Page;
