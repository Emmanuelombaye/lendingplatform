import React from "react";
import { formatDateTZ } from "../../lib/locale";

const Profile = ({ user }: { user: any }) => {
  if (!user) return <div className="p-8 text-center">Inapakia...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 modern-container bg-white rounded-xl shadow-lg flex flex-col gap-6 sm:gap-8">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">Wasifu</h2>
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl sm:text-3xl font-bold">
          {user.fullName ? user.fullName[0] : "U"}
        </div>
        <div>
          <div className="text-base sm:text-lg font-semibold">{user.fullName}</div>
          <div className="text-xs sm:text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:gap-3">
        <div><span className="font-medium">Simu:</span> {user.phone || "-"}</div>
        <div><span className="font-medium">Jukumu:</span> {user.role || "Mwanachama"}</div>
        <div><span className="font-medium">Hali ya KYC:</span> {user.kycStatus || "Inasubiri"}</div>
        <div><span className="font-medium">Imethibitishwa:</span> {user.isVerified ? "Ndiyo" : "Hapana"}</div>
        <div><span className="font-medium">Alama ya Mkopo:</span> {user.creditScore || "Haipo"}</div>
        <div><span className="font-medium">Amejiunga:</span> {user.createdAt ? formatDateTZ(user.createdAt) : "-"}</div>
      </div>
      {/* Add more professional details or actions here */}
    </div>
  );
};

export default Profile;
