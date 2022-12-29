import React from "react";

const Button = ({ text, bgColor }) => {
  return (
    <button
      className={`${
        bgColor ? `bg-${bgColor}` : "bg-secondary"
      } text-gray-600 cursor-pointer hover:text-primary  rounded-md hover:bg-primary hover:shadow-md min-w-max w-28 transition ease-out duration-200 px-5 py-2`}
    >
      {text}
    </button>
  );
};

export default Button;
