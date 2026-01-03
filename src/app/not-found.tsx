import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("404");

  return (
    <div className="prose dark:prose-invert mx-auto grid w-full grid-cols-1 bg-repeat py-6">
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
