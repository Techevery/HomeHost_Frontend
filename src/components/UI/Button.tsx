import React from "react";

type Props = {
  text: string | JSX.Element;
  action?: () => any | void;
  type: "submit" | "reset" | "button";
  disabled?: boolean;
  fitWidth?: boolean;
  width?: string;
};

const Button = (props: Props) => {
  return (
    <>
       <button
        className={`${
          props.width
            ? props.width // Use custom width if provided
            : props.fitWidth
            ? "w-fit" // Use w-full if fullWidth is true
            : "w-full" // Default to w-fit if neither width nor fullWidth is provided
        } disabled:bg-gray-500 bg-primary hover:bg-primary/80 duration-300 mb-3 text-white px-2 rounded-[15px] py-4 font-bold disabled:cursor-not-allowed`}
        onClick={props.action}
        type={props.type}
        disabled={props.disabled}
      >
        {props.text}
      </button>
    </>
  );
};

export default Button;
