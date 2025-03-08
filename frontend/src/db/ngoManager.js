import { getDocs } from "firebase/firestore";
import { ngoCollection, ngoRequirementsCollection } from "./firebase";

const fetchNgoData = async () => {
  try {
    //test
    const ngosSnapshot = await getDocs(ngoCollection);

    const ngosData = ngosSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requirement: [],
      }))
      .filter((doc) => doc.userType === "ngo");

    const requirementsSnapshot = await getDocs(ngoRequirementsCollection);
    const requirementsData = requirementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    for (let req of requirementsData) {
      if (req.ngo_ref) {
        const ngoId = req.ngo_ref.path.split("/")[1];

        const ngoIndex = ngosData.findIndex((ngo) => ngo.id === ngoId);
        if (ngoIndex !== -1) {
          ngosData[ngoIndex].requirement.push({
            id: req.id,
            name: req.name,
            description: req.description,
            additionalInfo: req.additionalInfo,
          });
        }
      }
    }

    return ngosData;
  } catch (error) {
    console.error("Error fetching NGO data:", error);
  }
};

export { fetchNgoData };
