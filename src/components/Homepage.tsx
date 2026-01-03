import { useTranslations } from "next-intl";
import Image from "next/image";

export const Problems = () => {
  const t = useTranslations();
  const items = t.raw("homepage.problems.items") || [];

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
      {/* @ts-expect-error suppress any warning */}
      {items.map((item, idx: number) => (
        <div key={idx} className="flex flex-col">
          <Image
            width={400}
            height={300}
            src={item.image ?? `/homepage/${item.img}`}
            alt={item.pain ?? `item-${idx}`}
            className="mb-3 bg-slate-200/60"
          />
          <h3 className="mb-2 pr-2 text-left text-lg font-semibold text-slate-900 dark:text-slate-200/60">
            {item.pain}
          </h3>
          <p className="pr-2 text-sm text-slate-600 dark:text-slate-300">
            {item.solution}
          </p>
        </div>
      ))}
    </div>
  );
};

export const Features = () => {
  const t = useTranslations();
  const items = t.raw("homepage.features.items") || [];

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        <div className="flex flex-col gap-2 bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[0].pain}</h3>
            <p className="text-sm">{items[0].solution}</p>
          </div>
          <Image
            width={700}
            height={500}
            src="/homepage/offer.png"
            alt=""
            className="px-10 pb-8 md:px-32"
          />
        </div>

        <div className="flex flex-col gap-2 bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[2].pain}</h3>
            <p className="text-sm">{items[2].solution}</p>
          </div>
          <Image
            width={700}
            height={500}
            src="/homepage/stripe.png"
            alt=""
            className="px-10 py-8 md:px-16 md:py-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        <div className="p- flex flex-col justify-between bg-slate-200/60">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{items[3].pain}</h3>
            <p className="text-sm">{items[3].solution}</p>
          </div>
          <Image width={700} height={500} src="/homepage/chart.png" alt="" />
        </div>

        <div className="bg-slate-200/60 p-4">
          <h3 className="text-lg font-semibold">{items[1].pain}</h3>
          <p className="text-sm">{items[1].solution}</p>
          <Image
            width={700}
            height={300}
            src="/homepage/avis.png"
            alt=""
            className="px-10 py-8 md:px-32"
          />
        </div>
      </div>
    </div>
  );
};

export const Projects = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 bg-slate-200/60 p-6 md:h-48 md:flex-row">
      <div className="group invisible relative overflow-visible md:visible md:top-[-70px]">
        {/* images layer */}
        <div className="pointer-events-none absolute z-10 h-[220px] w-[320px] md:h-[220px] md:w-[320px]">
          <div className="relative h-full w-full">
            <Image
              width={400}
              height={300}
              src="/homepage/av.png"
              alt="Alpes vivantes project"
              className="absolute top-8 left-4 h-32 w-42 rounded shadow-lg transition-transform duration-150 group-hover:-translate-x-2 group-hover:-translate-y-8 group-hover:-rotate-3"
            />
            <Image
              width={400}
              height={300}
              src="/homepage/te.png"
              alt="themis project"
              className="absolute top-6 left-8 h-32 w-42 rounded shadow-lg transition-transform duration-150 group-hover:-translate-y-8"
            />
            <Image
              width={400}
              height={300}
              src="/homepage/mp.png"
              alt="Mipasa project"
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

      <div className="ml-0 flex h-full flex-col justify-end md:ml-4">
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
