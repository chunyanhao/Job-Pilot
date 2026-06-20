import type { ReactElement } from "react";

type Props = {
  title: string;
  items: string[];
};

export function JobDetailList({ title, items }: Props): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase leading-5 text-text-secondary">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-3 size-1.5 shrink-0 rounded-full bg-text-secondary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
