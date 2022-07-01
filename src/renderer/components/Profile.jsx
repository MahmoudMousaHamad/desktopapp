import React from "react";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import UserInformation from "./UserInformation";

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <UserInformation />
    </>

    // <div className="container">
    //   <header className="jumbotron">
    //     <h3>Profile</h3>
    //   </header>
    //   <p>
    //     <strong>Token:</strong> {currentUser.token?.substring(0, 20)} ...{" "}
    //     {currentUser.token?.substr(currentUser.token.length - 20)}
    //   </p>
    //   <p>
    //     <strong>Id:</strong> {currentUser.id}
    //   </p>
    //   <p>
    //     <strong>Email:</strong> {currentUser.email}
    //   </p>
    // </div>
  );
};
export default Profile;
