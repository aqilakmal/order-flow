import { Button } from "./ui/button";

export interface OrderPadProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
  mode?: "number" | "text";
  maxLength?: number;
}

export function OrderPad({
  value,
  onChange,
  onComplete,
  mode = "number",
  maxLength,
}: OrderPadProps) {
  const handleNumberClick = (num: string) => {
    if (maxLength && value.length >= maxLength) return;
    onChange(value + num);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleEnter = () => {
    if (value) onComplete();
  };

  const isSubmitDisabled = mode === "number" && maxLength ? value.length !== maxLength : !value;

  return (
    <div className="grid grid-cols-3 gap-2">
      {mode === "number" ? (
        // Number pad layout
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              onClick={() => handleNumberClick(num.toString())}
              className="h-10 text-base font-medium"
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={handleBackspace}
            className="h-10 text-base font-medium"
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNumberClick("0")}
            className="h-10 text-base font-medium"
          >
            0
          </Button>
          <Button
            variant="outline"
            onClick={handleEnter}
            disabled={isSubmitDisabled}
            className="h-10 bg-brand-500 text-base font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↵
          </Button>
        </>
      ) : (
        // Text pad layout
        <div className="col-span-3 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-2.5 text-base leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Ketik nama..."
            autoFocus
          />
          <Button
            onClick={handleEnter}
            className="h-10 w-full bg-brand-500 text-base font-medium text-white hover:bg-brand-600"
          >
            Lanjut
          </Button>
        </div>
      )}
    </div>
  );
}
