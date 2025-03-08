import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Searchbox({ ngos }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredNgos = ngos.filter((ngo) =>
    ngo.ngoName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNgos.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 p-4">
      <h1 className="flex flex-row justify-center text-5xl font-bold  m-[10vh]">
        Open&nbsp;<p className="text-cyan-700">Donations</p>
      </h1>
      <div className="relative mr-[15vh] m-[5vh] ml-[15vh]">
        <input
          type="text"
          placeholder="Find NGOs..."
          className="w-full pl-11 p-5 pr-11 shadow-md focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-cyan-700 focus:shadow-none rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute mr-[3vh] inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
      </div>

      <div className="m-[10vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-9">
        {currentItems.map((ngo, index) => (
          <div
            key={ngo.id}
            className="bg-white  rounded-xl overflow-hidden border  border-gray-200"
          >
            <img
              src={ngo.ngo_image_url}
              alt={ngo.ngoName}
              className="w-full h-[35vh] object-cover"
            />
            <div className="p-4 h-[full]">
              <div className="flex flex-row justify-between  items-center">
                <p className="text-gray-600 m-2 ml-0 text-base">
                  {ngo.officeAddress}
                </p>
                <span className="text-green-600 text-base m-2 mr-0 font-bold">
                  {ngo.requirement.length} requirements
                </span>
              </div>
              <p className="text-2xl font-bold m-2 ml-0">{ngo.ngoName}</p>

              <p className="text-gray-700 m-4 ml-0 mt-1 text-xl line-clamp-2">
                {ngo.ngo_description}
              </p>

              <button
                onClick={(e) => {
                  if (!localStorage.getItem("user")) {
                    navigate("/signin");
                    return;
                  }
                  navigate("/about?id=" + index, { state: { ngoData: ngo } });
                }}
                className="bg-transparent border-2 text-xl font-bold border-cyan-700 text-cyan-700 mt-5 px-[11vh] py-4 rounded-xl hover:bg-cyan-100  "
              >
                {" "}
                Donate Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center my-4">
        <button
          className={`bg-transparent border-2 text-xl font-bold border-cyan-700 text-cyan-700 px-4 py-2 rounded-full hover:bg-cyan-100 mr-2 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <svg
            className="h-5 w-5 text-cyan-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-xl font-bold mx-4">Page {currentPage}</span>
        <button
          className={`bg-transparent border-2 text-xl font-bold border-cyan-700 text-cyan-700 px-4 py-2 rounded-full hover:bg-cyan-100 mr-2 ${
            indexOfLastItem >= filteredNgos.length
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleNextPage}
          disabled={indexOfLastItem >= filteredNgos.length}
        >
          <svg
            className="h-5 w-5 text-cyan-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Searchbox;
