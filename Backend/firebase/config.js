// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} = require("firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAN3IG8MCTu1iWmfeHyYNCwJZCiXct4brU",
  authDomain: "bd-guepardex-files.firebaseapp.com",
  projectId: "bd-guepardex-files",
  storageBucket: "bd-guepardex-files.appspot.com",
  messagingSenderId: "859480934276",
  appId: "1:859480934276:web:e09b581e4c10dfd43bffd1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFileToFireStorage(file, uniqueId, dir) {
  return new Promise((resolve, reject) => {
    let RESPONSE = {};
    if (!(uniqueId || dir || file)) {
      reject((RESPONSE = { message: "AN_ID_DIR_FILE_SHOULD_BE_PROVIDED" }));
    }
    const storageRef = ref(
      storage,
      `/${dir}/${uniqueId}.${file.mimetype.split("/")[1]}`
    );
    const metadata = {
      customMetadata: {
        originalName: file.originalname,
      },
    };
    const uploadTask = uploadBytesResumable(storageRef, file.buffer, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        reject((RESPONSE = { message: "ERROR_UPLOADING_FILE", error: error }));
      },
      async () => {
        const fileURL = await getDownloadURL(storageRef);
        resolve(
          (RESPONSE = {
            message: "UPLOAD_SUCCESFULLY",
            fileRef: fileURL,
            fileName: file.originalname,
          })
        );
      }
    );
  });
}

async function deleteFileFromFireStorage(fileRef) {
  return new Promise(async (resolve, reject) => {
    try {
      let RESPONSE = {};
      const file = ref(storage, fileRef);
      //const fileUrl = await deleteObject(file);
      resolve(
        (RESPONSE = {
          message: "DELETE_SUCCESFULLY",
          fileName: file.originalname,
        })
      );
    } catch (error) {
      reject(error);
    }
  });
}


function createCourse(data) {
  return new Promise((resolve, reject) => {
    try {
      let RESPONSE = {};
      if (!data?.nameCourse) {
        reject((RESPONSE = { message: "AN_TYPE_AND_DATA_SHOULD_BE_PROVIDED" }));
      }

      const file = Buffer.from("", "utf-8");
      const createCourseRef = ref(
        storage,
        `/courses/${data.nameCourse}/activities/files/placeholder.txt`
      );
      uploadBytes(createCourseRef, file).then((snapshot) => {
        resolve(
          (RESPONSE = {
            message: "COURSE_CREATED",
          })
        );
      });
    } catch (error) {
      reject(error);
    }
  });
}

function deleteCourse(data) {
  return new Promise((resolve, reject) => {
    try {
      let RESPONSE = {};
      if (!data?.nameCourse) {
        reject((RESPONSE = { message: "AN_TYPE_AND_DATA_SHOULD_BE_PROVIDED" }));
      }
      // Create a reference under which you want to list
      const listRef = ref(
        storage,
        `/courses/${data.nameCourse}/activities/files`
      );

      // Find all the prefixes and items.
      listAll(listRef)
        .then((res) => {
          res.items.forEach((itemRef) => {
            // Delete each item
            deleteObject(itemRef).catch((error) => {
              reject(error);
              console.error(`Error deleting ${itemRef.fullPath}:`, error);
            });
          });
          resolve((RESPONSE = { messagge: "COURSE_ELIMINATED" }));
        })
        .catch((error) => {
          console.error("Error listing items:", error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/*
async function createActivity(data) {
  const dirs = {
    createCourse: `/courses/${data.nameCourse}/activities/placeholder.txt`,
    createActivity: `/courses/${data.nameCourse}/activities/${data.nameActivity}${data.idActivity}/files` 
  }
  const file = new Blob([''], { type: 'text/plain' });
  return new Promise(async (resolve, reject) => {
    try {
      if(!data){
        reject((RESPONSE = { message: "AN_TYPE_AND_DATA_SHOULD_BE_PROVIDED" }))
      }
      uploadBytes(dirs.type, file).then((snapshot) => {
        console.log('Carpeta creada exitosamente!');
      });
      
    } catch (error) {
      
    }
  })
} */

module.exports = {
  uploadFileToFireStorage,
  storage,
  createCourse,
  deleteCourse,
  deleteFileFromFireStorage,
};
