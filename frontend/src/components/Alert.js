import React from "react";

const Alert = ({ type, message }) => {
  return (
    <div
      className={`fixed top-10 flex justify-center px-7 rounded-xl items-center ${
        type === "error" ? "bg-red-600" : "bg-green-500"
      } text-white p-3`}
    >
      {message}
    </div>
  );
};

export default Alert;
