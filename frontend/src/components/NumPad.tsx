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
    <div className="mx-auto grid w-full grid-cols-3 gap-3 px-4">
      {buttons.map((button) => (
        <Button
          key={button}
          className={`h-16 text-2xl leading-none ${
            button === "enter"
              ? value.length === 3
                ? "bg-green-600 hover:bg-green-700"
                : "cursor-not-allowed opacity-50"
              : ""
          }`}
          onClick={() => handleClick(button)}
          disabled={button === "enter" && value.length !== 3}
        >
          {button === "enter" ? <span className="leading-none">Enter</span> : button}
        </Button>
      ))}
    </div>
  );
}
