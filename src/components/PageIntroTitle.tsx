export default function PageIntroTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-50 mb-2">
        {title}
      </h1>
      <p className="text-center md:max-w-3xl text-base md:text-lg font-normal mx-auto text-gray-300">
        {subtitle}
      </p>
    </div>
  );
}
