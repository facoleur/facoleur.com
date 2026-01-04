import { Button } from "@/components/ui/button";

type CallBannerProps = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  href?: string;
};

export const CallBanner = ({
  title,
  subtitle,
  buttonLabel,
  href = "https://app.cal.eu/facoleur/strategie30",
}: CallBannerProps) => {
  return (
    <section className="bg-slate-200/60 bg-[url('/homepage/bg.png')] bg-[length:150%_auto] px-4 py-12 text-center">
      <h2 className="!text-4xl">{title}</h2>
      <p className="!text-lg">{subtitle}</p>
      <a href={href}>
        <Button>{buttonLabel}</Button>
      </a>
    </section>
  );
};
