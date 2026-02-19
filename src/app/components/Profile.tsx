import React from "react";

const Profile = ({ user }: { user: any }) => {
  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Profile</h2>
      <div className="mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold">
          {user.fullName ? user.fullName[0] : "U"}
        </div>
        <div>
          <div className="text-lg font-semibold">{user.fullName}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div><span className="font-medium">Phone:</span> {user.phone || "-"}</div>
        <div><span className="font-medium">Role:</span> {user.role || "Member"}</div>
        <div><span className="font-medium">KYC Status:</span> {user.kycStatus || "Pending"}</div>
        <div><span className="font-medium">Verified:</span> {user.isVerified ? "Yes" : "No"}</div>
        <div><span className="font-medium">Credit Score:</span> {user.creditScore || "N/A"}</div>
        <div><span className="font-medium">Joined:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
      </div>
      {/* Add more professional details or actions here */}
    </div>
  );
};

export default Profile;
