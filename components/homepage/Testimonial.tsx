import Image from "next/image";

export function Testimonial() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1280px] border-x border-border px-6 py-24 text-center md:px-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Success Stories</p>
        <blockquote className="mx-auto mt-8 max-w-[820px] text-[28px] font-medium leading-[1.35] text-text-slate md:text-[34px]">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously.&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Image src="/images/user-icon.png" alt="Tom Wilson" width={40} height={40} className="rounded-full" />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Tom Wilson</p>
            <p className="text-xs font-medium text-text-muted">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
