import React from "react";
import { useNavigate } from "react-router-dom";

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * TeamCard
 * كارت عرض عضو فريق واحد: صورة، اسم، وظيفة، بريد إلكتروني، وأيقونة
 * تعديل بتودي لفورم Add/Edit Team Member معبّى ببيانات العضو ده.
 */
export default function TeamCard({ id, name, role, email, image }) {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <button
        onClick={() => navigate(`/team/edit/${id}`)}
        aria-label={`Edit ${name}`}
        className="absolute top-4 ltr:right-4 rtl:left-4 w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-blue-500 transition-colors"
      >
        <EditIcon />
      </button>

      <img
        src={image}
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-gray-100"
      />
      <h3 className="font-semibold text-gray-900">{name}</h3>
      <p className="text-sm text-gray-400 mt-0.5">{role}</p>
      <p className="text-sm text-blue-500 mt-2 truncate max-w-full">{email}</p>
    </div>
  );
}
