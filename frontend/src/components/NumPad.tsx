import { Button } from "./ui/button";

interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}

export function NumPad({ value, onChange, onEnter }: NumPadProps) {
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "enter"];

  const handleClick = (button: string) => {
    if (button === "del") {
      onChange(value.slice(0, -1));
    } else if (button === "enter") {
      if (value.length === 3) onEnter();
    } else {
      if (value.length < 3) onChange(value + button);
    }
  };

  return (
    <div className="mx-auto grid w-full grid-cols-3 gap-1.5 px-2 sm:gap-2">
      {buttons.map((button) => (
        <Button
          key={button}
          className={`h-10 text-base text-neutral-900 border border-neutral-300 hover:bg-brand-100 active:bg-brand-200 sm:h-12 sm:text-lg ${
            button === "enter"
              ? value.length === 3
                ? "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700"
                : "cursor-not-allowed opacity-50 text-neutral-500"
              : "bg-white"
          }`}
          onClick={() => handleClick(button)}
          disabled={button === "enter" && value.length !== 3}
        >
          {button === "enter" ? "OK" : button}
        </Button>
      ))}
    </div>
  );
}
