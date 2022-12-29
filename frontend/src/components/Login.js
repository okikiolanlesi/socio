import React, { useState } from "react";
// import { FcGoogle } from "react-icons";
import styled from "styled-components";
import Alert from "./Alert";
import axios from "../axiosLib";
import Button from "./Button";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [signInButtonText, setSignInButtonText] = useState("Sign in");
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    setSignInButtonText("Signing in...");
    try {
      const res = await axios.post("/users/login", data);
      if (res.data.status === "success") {
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        setShowAlert((prev) => {
          return {
            ...prev,
            show: true,
            message: "Login Successful",
            type: "success",
          };
        });

        await setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      setShowAlert((prev) => {
        return {
          ...prev,
          show: true,
          message: "Login Unsuccessful",
          type: "error",
        };
      });
      setSignInButtonText("Sign in");
      setTimeout(() => {
        setShowAlert((prev) => {
          return { ...prev, show: false, message: "", type: "success" };
        });
      }, 2000);
      console.log(err);
    }
  };

  return (
    <div
      className="flex justify-center items-center flex-col h-screen "
      style={{
        backgroundImage: `url("assets/milad-fakurian-PGdW_bHDbpI-unsplash.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "1rem",
      }}
    >
      {showAlert.show && (
        <Alert message={showAlert.message} type={showAlert.type} />
      )}
      <LoginWrap className="px-8 max-w-xl flex justify-center rounded-3xl align-center flex-col min-w-max w-full min-h-max py-16 bg-mainColor">
        <LoginForm
          onSubmit={handleSubmit}
          className="flex flex-col justify-center"
        >
          <label htmlFor="email" className="text-gray-500 text-base  mb-3">
            Email
          </label>
          <input
            className=" p-3 mb-6 rounded-md"
            placeholder="example@email.com"
            id="email"
            type="text"
            value={data.email}
            name="email"
            onChange={(e) =>
              setData((prevData) => {
                return { ...prevData, email: e.target.value };
              })
            }
          />
          <label className="text-gray-500 text-base  mb-3" htmlFor="password">
            Password
          </label>
          <input
            className=" p-3 mb-6 rounded-md"
            placeholder="Input your password"
            id="password"
            type="password"
            value={data.password}
            name="password"
            onChange={(e) =>
              setData((prevData) => {
                return { ...prevData, password: e.target.value };
              })
            }
          />
          <div className="flex justify-center mb-5">
            <Button text={signInButtonText} />
          </div>
        </LoginForm>
        <div className="flex justify-center mt-3">
          <Button text="Sign in with Google" />
        </div>
      </LoginWrap>
    </div>
  );
};

export default Login;

const LoginForm = styled.form``;
// const LoginForm = styled.form`
//   border: 1px solid red;
//   label {
//     font-size: 1.1rem;
//     font-weight: 400;
//     margin-bottom: 0.5rem;
//     color: #333;
//     width: 100%;
//   }
//   input {
//     width: 100%;
//     padding: 0.5rem;
//     margin-bottom: 1rem;
//     border: 1px solid #ccc;
//     border-radius: 0.5rem;
//     outline: none;
//   }
//   button {
//     padding: 0.5rem 1rem;
//     border: none;
//     border-radius: 0.5rem;
//     background-color: #ece3f0;
//     font-size: 1.1rem;
//     font-weight: 500;
//     cursor: pointer;
//     outline: none;
//     transition: all 0.2s ease-in-out;
//     &:hover {
//       background-color: #d3bbdd;
//     }
//   }
// `;

const LoginWrap = styled.div``;
// const LoginWrap = styled.div`
//   display: flex;
//   flex-direction: column;
//   background-color: rgba(255, 255, 255, 0.9);
//   padding: 2rem;
//   border-radius: 0.5rem;
//   width: 100%;
//   min-width: 12rem;
//   max-width: 45rem;
//   min-height: 20rem;
// `;
