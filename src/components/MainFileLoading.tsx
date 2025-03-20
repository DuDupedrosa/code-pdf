export default function MainFileLoading({ text }: { text: string }) {
  return (
    <div className="mx-auto md:max-w-1/2 flex flex-col items-center text-gray-50 mt-16">
      <progress className="progress h-4 w-xs sm:w-lg progress-primary"></progress>

      <span className="text-lg mt-4 font-semibold">Aguarde!</span>
      <p className="text-base text-center max-w-sm">{text}</p>
    </div>
  );
}
