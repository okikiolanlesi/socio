import React, { useState, useContext } from "react";
import axios from "axios";
// import { FcGoogle } from "react-icons";
import styled from "styled-components";
import { UserContext } from "../contexts/UserContext";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { setUser } = useContext(UserContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/users/login",
        data,
        {
          withCredentials: true,
        }
      );
      setUser(res.data.data.user);
    } catch (err) {
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
      <LoginWrap>
        <LoginForm
          onSubmit={handleSubmit}
          className="max-w-xl flex justify-center align-center flex-col min-w-max	"
        >
          <label htmlFor="email">Email</label>
          <input
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
          <label htmlFor="password">Password</label>
          <input
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
          <button>Submit</button>
        </LoginForm>
        <GoogleSignInButton>Sign in with Google</GoogleSignInButton>
      </LoginWrap>
    </div>
  );
};

export default Login;

const LoginForm = styled.form`
  border: 1px solid red;
  label {
    font-size: 1.1rem;
    font-weight: 400;
    margin-bottom: 0.5rem;
    color: #333;
    width: 100%;
  }
  input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    outline: none;
  }
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    background-color: #ece3f0;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease-in-out;
    &:hover {
      background-color: #d3bbdd;
    }
  }
`;

const GoogleSignInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #ece3f0;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  margin-top: 1rem;
  width: 100%;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: #d3bbdd;
  }
`;

const LoginWrap = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  min-width: 12rem;
  max-width: 45rem;
  min-height: 20rem;
`;
