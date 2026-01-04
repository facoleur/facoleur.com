import { ChevronRight } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="flex w-full flex-col gap-1 md:w-2/3">
      {items.map((item, index) => (
        <details
          key={index}
          className="group bg-slate-200/60 transition-transform duration-75 hover:translate-x-2"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
            <h3 className="!m-0 text-base font-semibold">{item.question}</h3>
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-90" />
          </summary>

          <div className="px-4 pb-4">
            <p className="!m-0 text-sm text-slate-700">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
