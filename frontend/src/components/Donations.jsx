import { useEffect, useState } from "react";
import { db } from "../db/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellationReasons, setCancellationReasons] = useState({});
  const [showDonorInfo, setShowDonorInfo] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const userUid = user?.uid;
  const userType = user?.userType;

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);

      try {
        if (!userUid || !userType) {
          alert("User information missing. Please log in.");
          setLoading(false);
          return;
        }

        let donationsQuery;
        if (userType === "normal") {
          donationsQuery = query(
            collection(db, "donations"),
            where("user_ref", "==", doc(db, "users", userUid))
          );
        } else if (userType === "ngo") {
          donationsQuery = query(
            collection(db, "donations"),
            where("ngo_ref", "==", doc(db, "users", userUid))
          );
        }

        const donationSnapshots = await getDocs(donationsQuery);
        const donationData = await Promise.all(
          donationSnapshots.docs.map(async (docSnap) => {
            const donation = { id: docSnap.id, ...docSnap.data() };

            const itemDetails = await Promise.all(
              donation.items.map(async (itemRef) => {
                const itemDoc = await getDoc(itemRef);
                return itemDoc.exists() ? itemDoc.data() : null;
              })
            );

            let donorInfo = null;
            if (userType === "ngo") {
              const donorDoc = await getDoc(donation.user_ref);
              if (donorDoc.exists()) {
                donorInfo = donorDoc.data();
              }
            }

            return { ...donation, itemDetails, donorInfo };
          })
        );

        setDonations(donationData);
      } catch (error) {
        console.error("Error fetching donations:", error);
      }

      setLoading(false);
    };

    fetchDonations();
  }, []);

  const handleCancelDonation = async (donationId) => {
    const reason = cancellationReasons[donationId]?.trim();
    if (!reason) {
      alert("Please enter a reason for cancellation.");
      return;
    }

    try {
      await updateDoc(doc(db, "donations", donationId), {
        cancelled: true,
        cancellationReason: reason,
        status: "Cancelled",
      });

      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation.id === donationId
            ? {
                ...donation,
                cancelled: true,
                cancellationReason: reason,
                status: "Cancelled",
              }
            : donation
        )
      );
    } catch (error) {
      console.error("Error cancelling donation:", error);
    }
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    try {
      await updateDoc(doc(db, "donations", donationId), {
        status: newStatus,
      });

      setDonations((prevDonations) =>
        prevDonations.map((donation) =>
          donation.id === donationId
            ? { ...donation, status: newStatus }
            : donation
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return <div>Loading donations...</div>;
  }

  const activeDonations = donations.filter((donation) => !donation.cancelled);
  const cancelledDonations = donations.filter((donation) => donation.cancelled);

  return (
    <div className="p-6">
      <h3 className="text-3xl font-bold mb-6 text-cyan-700">
        {userType === "ngo" ? "Donations Received" : "Your Donations"}
      </h3>

      {activeDonations.length === 0 ? (
        <p>No active donations found.</p>
      ) : (
        <div className="space-y-4">
          {activeDonations.map((donation) => (
            <div
              key={donation.id}
              className="p-4 bg-white shadow-md rounded-md"
            >
              <h4 className="text-xl font-semibold text-teal-600">
                Donation ID: {donation.id}
              </h4>
              <p className="text-gray-600">
                <strong>Timestamp:</strong>{" "}
                {new Date(donation.timestamp.seconds * 1000).toLocaleString()}
              </p>

              <h5 className="mt-3 text-lg font-bold text-gray-800">
                Items Donated:
              </h5>
              <ul className="list-disc ml-5 mt-2 text-gray-700">
                {donation.itemDetails.map((item, index) =>
                  item ? (
                    <li key={index}>
                      <strong>{item.name}</strong> - {item.description} (
                      {item.additionalInfo})
                    </li>
                  ) : (
                    <li key={index} className="text-gray-500">
                      [Item deleted or unavailable]
                    </li>
                  )
                )}
              </ul>

              {/* Status */}
              <p className="mt-4 text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                <span className="font-bold">
                  {donation.status || "In-Progress"}
                </span>
              </p>

              {/* User-controlled cancellation */}
              {userType === "normal" &&
                donation.status != "Completed" &&
                !donation.cancelled && (
                  <div className="mt-4">
                    <textarea
                      placeholder="Enter cancellation reason"
                      className="border p-2 w-full"
                      value={cancellationReasons[donation.id] || ""}
                      onChange={(e) =>
                        setCancellationReasons((prev) => ({
                          ...prev,
                          [donation.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleCancelDonation(donation.id)}
                      className="bg-red-700 text-white px-4 py-2 rounded mt-2 hover:bg-red-800"
                    >
                      Cancel Donation
                    </button>
                  </div>
                )}

              {/* NGO-controlled status update & Contact Donor */}
              {userType === "ngo" && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setShowDonorInfo((prev) => ({
                        ...prev,
                        [donation.id]: !prev[donation.id],
                      }))
                    }
                    className="bg-blue-700 text-white px-4 py-2 rounded mr-2 hover:bg-blue-800"
                  >
                    {showDonorInfo[donation.id]
                      ? "Hide Donor Info"
                      : "Contact Donor"}
                  </button>

                  {showDonorInfo[donation.id] && (
                    <div className="mt-2 p-3 bg-gray-100 rounded">
                      <p>
                        <strong>Name:</strong>{" "}
                        {`${
                          donation.donorInfo?.firstName +
                          " " +
                          donation.donorInfo.lastName
                        }` || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {donation.donorInfo?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {donation.donorInfo?.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Address:</strong>{" "}
                        {donation.donorInfo?.address || "N/A"}
                      </p>
                    </div>
                  )}

                  <select
                    className="border p-2 mt-2"
                    value={donation.status || "In-Progress"}
                    onChange={(e) =>
                      handleUpdateStatus(donation.id, e.target.value)
                    }
                  >
                    <option value="In-Progress">In-Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancelled Donations */}
      {cancelledDonations.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4 text-red-600">
            Cancelled Donations
          </h3>
          {cancelledDonations.map((donation) => (
            <div
              key={donation.id}
              className="p-4 bg-gray-100 shadow-md rounded-md"
            >
              <h4 className="text-xl font-semibold text-gray-800">
                Donation ID: {donation.id}
              </h4>
              <p className="text-red-600 font-bold">
                Cancelled (Reason: {donation.cancellationReason || "N/A"})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
