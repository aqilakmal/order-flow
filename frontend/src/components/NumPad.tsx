import { Button } from "./ui/button";
import { X as BackspaceIcon } from "lucide-react";

interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}

export function NumPad({ value, onChange, onEnter }: NumPadProps) {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', '0', 'enter'];

  const handleClick = (button: string) => {
    if (button === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (button === 'enter') {
      onEnter();
    } else {
      onChange(value + button);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4 w-full max-w-md mx-auto">
      {buttons.map((button) => (
        <Button
          key={button}
          className={`h-20 text-3xl ${
            button === 'enter' ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
          onClick={() => handleClick(button)}
        >
          {button === 'backspace' ? (
            <BackspaceIcon className="h-8 w-8" />
          ) : button === 'enter' ? (
            'Enter'
          ) : (
            button
          )}
        </Button>
      ))}
    </div>
  );
} 