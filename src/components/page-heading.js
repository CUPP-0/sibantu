export default function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-[720px]">
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">{eyebrow}</p>}
      <h1 className="mt-3 text-[34px] font-bold leading-tight tracking-[-0.06em] text-[#202033] sm:text-[44px]">{title}</h1>
      {description && <p className="mt-3 text-[14px] leading-7 text-[#77778a]">{description}</p>}
    </div>
  );
}
