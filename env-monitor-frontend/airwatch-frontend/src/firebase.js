// // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";

// const firebaseConfig = {
//     apiKey: "AIzaSyBlhJA_Eia2QhHDFyYEPUVC05X6YxyPFoo",
//     authDomain: "airwatch-1908.firebaseapp.com",
//     databaseURL: "https://airwatch-1908-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "airwatch-1908",
//     storageBucket: "airwatch-1908.firebasestorage.app",
//     messagingSenderId: "303940901807",
//     appId: "1:303940901807:web:f2eb5ecd8e947cc8676d5a",
//     measurementId: "G-LJDPWY8M4E"
// }
//  // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database=getDatabase(app)

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiFPkqOyS35LjtvSrS4JykF7LWmd8lAfQ",
  authDomain: "vayusena-b6cb9.firebaseapp.com",
  databaseURL: "https://vayusena-b6cb9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vayusena-b6cb9",
  storageBucket: "vayusena-b6cb9.firebasestorage.app",
  messagingSenderId: "58656284226",
  appId: "1:58656284226:web:8638021bc6d95a7964d7db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database=getDatabase(app)
export {database}