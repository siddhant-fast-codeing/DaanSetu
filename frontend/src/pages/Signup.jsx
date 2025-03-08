import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { app } from "../db/firebase";
import { useNavigate } from "react-router-dom";

const IMG_BB_API_KEY = import.meta.env.VITE_IMG_BB_API_KEY;

const SignupForm = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [userType, setUserType] = useState("normal");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    ngoName: "",
    ngoType: "",
    registrationDate: "",
    officeAddress: "",
    fcraNumber: "",
    contactNo: "",
    websiteUrl: "",
    bankDetails: "",
    upiDetails: "",
    ngo_description: "",
    ngo_ph_num:"",
  });

  const [addressProof, setAddressProof] = useState(null);
  const [registrationCertificate, setRegistrationCertificate] = useState(null);
  const [ngo_image, setNgoImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "addressProof") {
      setAddressProof(e.target.files[0]);
    } else if (e.target.name === "registrationCertificate") {
      setRegistrationCertificate(e.target.files[0]);
    } else if (e.target.name === "ngo_image") {
      setNgoImage(e.target.files[0]);
    }
  };

  // Function to upload an image to ImgBB
  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      return result.data.url; // Return the image URL
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const allUserData = (await getDocs(collection(db, "users"))).docs;
      console.log(allUserData);

      let addressProofUrl = "";
      let registrationCertificateUrl = "";
      let ngo_image_url = "";
      let userId = "";

      if (userType === "ngo") {
        if (addressProof) {
          addressProofUrl = await uploadToImgBB(addressProof);
        }
        if (ngo_image) {
          ngo_image_url = await uploadToImgBB(ngo_image);
        }
        if (registrationCertificate) {
          registrationCertificateUrl = await uploadToImgBB(
            registrationCertificate
          );
        }
        userId = `DAAN-${allUserData.length + 1}-NGO`;
      } else {
        userId = `DAAN-${allUserData.length + 1}`;
      }

      const userData = {
        userId,
        userType,
        ...formData,
        addressProofUrl: addressProof ? addressProofUrl : undefined,
        registrationCertificateUrl: registrationCertificate
          ? registrationCertificateUrl
          : undefined,
        ngo_image_url: ngo_image ? ngo_image_url : undefined,
      };

      // Remove empty fields from userData
      Object.keys(userData).forEach((key) => {
        if (!userData[key]) delete userData[key];
      });

      await setDoc(doc(db, "users", user.uid), userData);

      alert("Signup successful!");
      navigate("/signin");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-lg p-8 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-yellow-400">
          दान<span className="text-gray-400">$</span>ETU
        </h2>
        <p className="text-center text-gray-400">Sign Up for an account</p>

        {/* Toggle User Type */}
        <div className="flex justify-center my-6">
          <button
            type="button"
            className={`w-1/2 py-2 rounded-l-lg ${userType === "normal"
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-gray-300"
              }`}
            onClick={() => setUserType("normal")}
          >
            Normal User
          </button>
          <button
            type="button"
            className={`w-1/2 py-2 rounded-r-lg ${userType === "ngo"
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-gray-300"
              }`}
            onClick={() => setUserType("ngo")}
          >
            NGO
          </button>
        </div>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          {userType === "normal" && (
            <>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Create Password</label>
              <input
                type="password"
                name="password"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Retype Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Address</label>
              <input
                type="text"
                name="address"
                required
                className="input-field"
                onChange={handleChange}
              />
            </>
          )}

          {userType === "ngo" && (
            <>
              <label>NGO Name</label>
              <input
                type="text"
                name="ngoName"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Create Password</label>
              <input
                type="password"
                name="password"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Retype Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Type of NGO</label>
              <input
                type="text"
                name="ngoType"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Date of Registration</label>
              <input
                type="date"
                name="registrationDate"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Office Address</label>
              <input
                type="text"
                name="officeAddress"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>FCRA Number</label>
              <input
                type="text"
                name="fcraNumber"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>NGO Phone Number</label>
              <input
                type="tel"
                name="ngoPhoneNumber"
                required
                className="input-field"
                onChange={handleChange}
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit phone number"
              />

              <label>Website URL</label>
              <input
                type="url"
                name="websiteUrl"
                required
                className="input-field"
                onChange={handleChange}
                placeholder="https://example.com"
              />

              <label>Description</label>
              <textarea
                name="ngo_description"
                required
                className="input-field"
                onChange={handleChange}
                rows="4"
                placeholder="Enter your description here..."
              ></textarea>

              <label>Bank Details</label>
              <input
                type="text"
                name="bankDetails"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>UPI Details</label>
              <input
                type="text"
                name="upiDetails"
                required
                className="input-field"
                onChange={handleChange}
              />

              <label>Address Proof</label>
              <input
                type="file"
                name="addressProof"
                required
                className="input-field"
                onChange={handleFileChange}
              />

              <label>Registration Certificate</label>
              <input
                type="file"
                name="registrationCertificate"
                required
                className="input-field"
                onChange={handleFileChange}
              />
              <label>Ngo Image</label>
              <input
                type="file"
                name="ngo_image"
                required
                className="input-field"
                onChange={handleFileChange}
              />
            </>
          )}

          <button
            type="submit"
            className="w-full mt-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;

// import logo from "../assets/logo.png";
// import { useState } from "react";
// import { auth, db } from "../db/firebase"; // Corrected import
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";

// export default function Signup() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [reType, setReType] = useState("");
//   const [fname, setFname] = useState("");
//   const [lname, setLname] = useState("");
//   const [ph_num, setPh_Num] = useState("");
//   const [address1, setAddress1] = useState("");
//   const [address2, setAddress2] = useState("");
//   const [city_town, setCityTown] = useState("");
//   const [state, setState] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [userType, setUserType] = useState("Doner");
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     console.log("Email:", email);
//     console.log("Password:", password);
//     console.log("First Name:", fname);

//     setLoading(true); // Set loading state to true to disable submit button and show a loading spinner

//     // Form validation checks
//     if (password !== reType) {
//       toast.error("Passwords do not match", { position: "bottom-center" });
//       setLoading(false);
//       return;
//     }

//     if (
//       !email ||
//       !password ||
//       !fname ||
//       !lname ||
//       !ph_num ||
//       !address1 ||
//       !city_town ||
//       !state ||
//       !pincode
//     ) {
//       toast.error("Please fill in all the required fields", {
//         position: "bottom-center",
//       });
//       setLoading(false);
//       return;
//     }

//     // Basic email format validation
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(email)) {
//       toast.error("Please enter a valid email address", {
//         position: "bottom-center",
//       });
//       setLoading(false);
//       return;
//     }

//     try {
//       // Create user with Firebase Authentication
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       if (user) {
//         // Add user data to Firestore
//         await setDoc(doc(db, "Users", user.uid), {
//           email: user.email,
//           firstName: fname,
//           lastName: lname,
//           phoneNumber: ph_num,
//           address: {
//             address1,
//             address2,
//             city_town,
//             state,
//             pincode,
//           },
//           userType,
//         });
//         console.log("User Registered Successfully");
//         toast.success("User Registered Successfully!", {
//           position: "top-center",
//         });
//         setLoading(false);
//       }
//     } catch (error) {
//       console.error(error); // Log the entire error object for debugging
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex min-h-screen flex-1 bg-black flex-col justify-center px-6 py-12 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-sm">
//           <img alt="DaanSetu" src={logo} className="mx-auto h-10 w-auto" />
//           <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
//             Sign Up for an account
//           </h2>
//         </div>

//         <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
//           <form
//             action="#"
//             method="POST"
//             className="space-y-6"
//             onSubmit={handleRegister}
//           >
//             <div>
//               <label
//                 htmlFor="first-name"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 First Name
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="first-name"
//                   name="first-name"
//                   type="text"
//                   onChange={(e) => setFname(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="last-name"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Last Name
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="last-name"
//                   name="last-name"
//                   type="text"
//                   onChange={(e) => setLname(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Email address
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   autoComplete="email"
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="phone"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Phone Number
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   onChange={(e) => setPh_Num(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Create Password
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   autoComplete="new-password"
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="retype-password"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Retype Password
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="retype-password"
//                   name="retype-password"
//                   type="password"
//                   onChange={(e) => setReType(e.target.value)}
//                   required
//                   autoComplete="new-password"
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="address1"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Address 1
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="address1"
//                   name="address1"
//                   type="text"
//                   onChange={(e) => setAddress1(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="address2"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Address 2
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="address2"
//                   name="address2"
//                   type="text"
//                   onChange={(e) => setAddress2(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="city"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 City/Town
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="city"
//                   name="city"
//                   type="text"
//                   onChange={(e) => setCityTown(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="state"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 State
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="state"
//                   name="state"
//                   type="text"
//                   onChange={(e) => setState(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="pincode"
//                 className="block text-sm/6 font-medium text-white"
//               >
//                 Pincode
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="pincode"
//                   name="pincode"
//                   type="text"
//                   onChange={(e) => setPincode(e.target.value)}
//                   required
//                   className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm/6 font-medium text-white">
//                 User Type
//               </label>
//               <div className="mt-2 flex space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => setUserType("Doner")}
//                   className={`px-3 py-1.5 rounded-md text-sm/6 font-semibold ${
//                     userType === "Doner"
//                       ? "bg-indigo-600 text-white"
//                       : "bg-gray-300 text-black"
//                   }`}
//                 >
//                   Doner
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setUserType("NGO")}
//                   className={`px-3 py-1.5 rounded-md text-sm/6 font-semibold ${
//                     userType === "NGO"
//                       ? "bg-indigo-600 text-white"
//                       : "bg-gray-300 text-black"
//                   }`}
//                 >
//                   NGO
//                 </button>
//               </div>
//             </div>

//             {userType === "NGO" && (
//               <>
//                 <div>
//                   <label
//                     htmlFor="ngo-type"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Type of NGO
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="ngo-type"
//                       name="ngo-type"
//                       type="text"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="registration-date"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Date of Registration
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="registration-date"
//                       name="registration-date"
//                       type="date"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="issued-address"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Issued Address
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="issued-address"
//                       name="issued-address"
//                       type="text"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="fcra-number"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     FCRA Number
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="fcra-number"
//                       name="fcra-number"
//                       type="text"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="alternate-phone"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Alternate Phone No
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="alternate-phone"
//                       name="alternate-phone"
//                       type="tel"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="website"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Website
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="website"
//                       name="website"
//                       type="url"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="address_proof"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Address proof: Utility bill/rental agreement (pdf*)
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="address_proof"
//                       name="address_proof"
//                       type="file"
//                       required
//                       accept="application/pdf"
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="reg_docs"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Registration Certificate (pdf*)
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="reg_docs"
//                       name="reg_docs"
//                       type="file"
//                       required
//                       accept="application/pdf"
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <p className="block text-lg font-medium text-white">
//                     Bank Details{" "}
//                   </p>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="account_no"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     Bank Account Number :
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="account_no"
//                       name="account_no"
//                       type="text"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="ifsc_code"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     IFSC Code :
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="ifsc_code"
//                       name="ifsc_code"
//                       type="text"
//                       required
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="upi_id"
//                     className="block text-sm/6 font-medium text-white"
//                   >
//                     UPI ID (optional)
//                   </label>
//                   <div className="mt-2">
//                     <input
//                       id="upi_id"
//                       name="upi_id"
//                       type="text"
//                       className="block w-full rounded-md bg-black px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                     />
//                   </div>
//                 </div>
//               </>
//             )}

//             <div>
//               <button
//                 type="submit"
//                 className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//               >
//                 Register
//               </button>
//             </div>
//           </form>

//           <p className="mt-10 text-center text-sm/6 text-gray-500">
//             Already have an account?{" "}
//             <a
//               href="/signin"
//               className="font-semibold text-indigo-600 hover:text-indigo-500"
//             >
//               Sign In
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
