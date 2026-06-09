export default function LegalPageLayout({ title, children }) {
  return (
    <div className="animate-fade-in-up py-24 px-4 max-w-[800px] mx-auto w-full font-main text-bodyText leading-relaxed">
      <p className="eyebrow text-center">LEGAL</p>
      <h1 className="text-[40px] font-bold text-ink mt-4 text-center mb-10 leading-tight">
        {title}
      </h1>
      {children}
      <hr className="border-borderCustom my-10" />
      <p className="text-[12px] text-mutedText text-center">
        Terakhir diperbarui: Juni 2026
      </p>
    </div>
  );
}
