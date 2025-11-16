import React from "react";

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user?.firstName} {user?.lastName}</p>
      <p>Email: {user?.email}</p>
      <p>Phone: {user?.phone}</p>
    </div>
  );
};

export default UserProfile;
