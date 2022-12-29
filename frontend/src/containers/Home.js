import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { AiFillCloseCircle } from "react-icons/ai";
import { SideBar, UserProfile } from "../components";
import { UserContext } from "../contexts/UserContext";
import logo from "../assets/socio-color.png";
import Posts from "./Posts";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [toggleSideBar, setToggleSideBar] = useState(true);

  const userInfo =
    JSON.parse(localStorage.getItem("user")) !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : localStorage.clear();

  useEffect(() => {
    if (!userInfo) {
      window.location.href = "/login";
    }
    setUser(userInfo);
    console.log(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRef = useRef(null);

  return (
    <div className="flex bg-gray-50 md:flex-row h-screen transition-height flex-col ease-out duration-75">
      <div className="hidden md:flex h:screen flex-initial">
        <SideBar
          user={user && user}
          closeToggle={() => setToggleSideBar(false)}
        />
      </div>
      <div className="flex md:hidden flex-row">
        <HiMenu
          fontSize={40}
          className="cursor-pointer"
          onClick={() => setToggleSideBar(true)}
        />
        <Link to="/">
          <img src={logo} alt="logo" className="w-28" />
        </Link>
        <Link to={`user-profile/${user ? "._id" : null}`}>
          <img
            src={user ? user.photo : null}
            alt="user profile"
            className="w-28"
          />
        </Link>
      </div>
      {toggleSideBar && (
        <div className="fixed w-4/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in">
          <div className="absolute w-full flex justify-end items-center p-2 ">
            <AiFillCloseCircle
              fontSize={40}
              className="cursor-pointer"
              onClick={() => setToggleSideBar(false)}
            />
            <SideBar
              user={user && user}
              closeToggle={() => setToggleSideBar(false)}
            />
          </div>
        </div>
      )}
      <div className="pb-2 flex-1 h-screen overflow-y-scroll" ref={scrollRef}>
        <Routes>
          <Route
            path="/user-profile/:userId"
            element={<UserProfile user={user && user} />}
          />
          <Route path="/*" element={<Posts user={user && user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;
