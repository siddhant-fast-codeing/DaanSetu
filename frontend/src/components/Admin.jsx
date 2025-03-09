import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../db/firebase";
import * as XLSX from "xlsx";

const Admin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState({ field: "", value: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let q = collection(db, "users");

        if (filters.field && filters.value) {
          q = query(q, where(filters.field, "==", filters.value));
        }

        const querySnapshot = await getDocs(q);
        let items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fieldsToRemove = [
          "registrationCertificateUrl",
          "ngo_logo_url",
          "confirmPassword",
          "issuesAddressed",
          "ngo_image_url",
          "password",
          "addressProofUrl",
          "ngo_description",
        ];

        items = items.map((item) => {
          fieldsToRemove.forEach((field) => delete item[field]);
          return item;
        });

        setData(items);
        if (items.length > 0) {
          setColumns(["userId", ...Object.keys(items[0]).filter(col => col !== "userId" )]);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filterByUserType = (type) => {
    setFilters({ field: "userType", value: type });
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Firestore Data Table</h2>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => filterByUserType("ngo")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          NGO Table
        </button>
        <button
          onClick={() => filterByUserType("normal")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          User Table
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          name="field"
          placeholder="Filter Field"
          value={filters.field}
          onChange={handleFilterChange}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="text"
          name="value"
          placeholder="Filter Value"
          value={filters.value}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
      </div>
      <button
        onClick={downloadExcel}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded"
      >
        Download as Excel
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                {columns.map((col) => (
                  <th key={col} className="border px-4 py-1">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border">
                  {columns.map((col) => (
                    <td key={col} className="border px-4 py-1">
                      {item[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
