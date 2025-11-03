import React from "react";

type Props = {
  text: string | JSX.Element;
  action?: () => any | void;
  fitWidth?: boolean;
  width?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>; // Extend native button props

const Button = (props: Props) => {
  const {
    text,
    action,
    fitWidth,
    width,
    className,
    type = "button", // Default to "button" if not provided
    ...restProps
  } = props;

  return (
    <button
      className={`${
        width
          ? width // Use custom width if provided
          : fitWidth
          ? "w-fit" // Use w-fit if fitWidth is true
          : "w-full" // Default to w-full
      } disabled:bg-gray-500 bg-primary hover:bg-primary/80 duration-300 mb-3 text-black px-2 rounded-[15px] py-4 font-bold disabled:cursor-not-allowed ${
        className || ""
      }`}
      onClick={action}
      type={type}
      {...restProps} // Spread all other button props
    >
      {text}
    </button>
  );
};

export default Button;
