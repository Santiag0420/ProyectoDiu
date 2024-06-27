const { uploadFileToFireStorage, createCourse, deleteCourse, deleteFileFromFireStorage } = require("./firebase/config");
const { v4 } = require("uuid");

require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Función para limitar el tamaño del archivo
const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Función para hacer consultas a la base de datos

/**
 *
 * @param {*} query
 * @param {*} params
 * @returns returns the response of the query
 */
const queryDatabase = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

/**
 * @api {get} /users Get Users
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess {Array} users An array of user objects.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "username": "username",
 *         "id": 1
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Error message"
 *     }
 */

app.get("/users", (req, res) => {
  const sql =
    "SELECT username, id FROM users WHERE rol != 'Admin' AND rol != 'Teacher'";

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post(
  "/courses/activities/weightingMax",
  upload.none(),
  async (req, res) => {
    const sqlGetWeightings =
      "SELECT SUM(weighting) FROM activities WHERE courseId = ?";

    try {
      const weightingMax = await new Promise((resolve, reject) => {
        db.query(sqlGetWeightings, req.body.courseId, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      return res.json(
        weightingMax[0]["SUM(weighting)"] != null
          ? weightingMax[0]["SUM(weighting)"]
          : 0
      );
    } catch (error) {
      res.status(500).json({ error: "Error al intentar tomar el ponderado" });
    }
  }
);

/**
 * @api {get} /courses/getActivities/:courseId Get Activities
 * @apiName GetActivities
 * @apiGroup Courses
 *
 * @apiParam {Number} courseId The ID of the course.
 *
 * @apiSuccess {Array} activities An array of activity objects.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "name": "Activity name",
 *         ...
 *       },
 *       ...
 *     ]
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Error message"
 *     }
 */

app.get(
  "/courses/activities/getActivityContent/:activityId/:userId?/:userRol",
  async (req, res) => {
    try {
      const { activityId, userId, userRol } = req.params;
      let queryGetInfoActivity = "";
      let params = [];

      if (userRol === "Student") {
        queryGetInfoActivity = `SELECT activities.tittle, activities.content, activities.startDate, activities.closingDate ,activities.description, resolutionsActivities.GPA, resolutionsactivities.resolution, resolutionsactivities.dateResolution FROM activities JOIN resolutionsActivities WHERE resolutionsactivities.activityId = ? AND userId = ?`;
        params = [activityId, userId];
      } else {
        queryGetInfoActivity = `SELECT 
        tittle, 
        content, 
        startDate, 
        closingDate,
        description
        FROM activities 
        WHERE 
        id = ?`;
        params = [activityId];
      }
      const activityResolutions = await queryDatabase(
        queryGetInfoActivity,
        params
      );

      const activityInfo = await queryDatabase(
        queryGetInfoActivity + " LIMIT 1",
        params
      );
      res.json(activityInfo);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  }
);

app.get(`/courses/activities/getResolutions/:activityId`, async (req, res) => {
  try {
    const queryGetResolutions =
      "SELECT users.username, users.id, resolutionsactivities.resolution, resolutionsactivities.dateResolution, resolutionsactivities.GPA FROM users JOIN resolutionsactivities ON users.id = resolutionsactivities.userId WHERE activityId = ?";
    const response = await queryDatabase(
      queryGetResolutions,
      req.params.activityId
    );
    console.log(response);
    return res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener los datos" });
  }
});

app.get(`/courses/activities/getActivities/:courseId`, async (req, res) => {
  try {
    const queryGetActivities = "SELECT * FROM activities WHERE courseId = ?";
    const response = await queryDatabase(
      queryGetActivities,
      req.params.courseId
    );
    return res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener la solicitud" });
  }
});

app.post(
  "/courses/activities/addActivity",
  multerMiddleware.array("File"),
  async (req, res) => {
    try {
      const {
        week,
        type,
        tittle,
        weighting,
        startDate,
        closingDate,
        courseId,
        teacherId,
        description,
      } = req.body;
      const filesAccepted = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
      ];
      let responseUploadFile = "";
      if (req.files.length > 0) {
        if (!filesAccepted.includes(req.files[0].mimetype)) {
          return res
            .status(500)
            .json({ message: "The file selected is not valid" });
        }
        const idFile = v4()
        responseUploadFile = await uploadFileToFireStorage(req.files[0], idFile, "filesContentActivities");
        responseUploadFile = `${responseUploadFile?.fileRef}nameFile:${responseUploadFile?.fileName}`;
      }
      // Insertar actividad
      const queryAddActivity =
        "INSERT INTO activities (week, type, tittle, description, content, weighting, startDate, closingDate, courseId) VALUES (?,?,?,?,?,?,?,?,?)";
      await queryDatabase(queryAddActivity, [
        week,
        type,
        tittle,
        description,
        responseUploadFile,
        weighting,
        startDate,
        closingDate + ":00",
        courseId,
      ]);

      // Obtener ID de la actividad
      const getIdActivity = "SELECT LAST_INSERT_ID() as id;";
      const resultGetIdActivity = await queryDatabase(getIdActivity);
      const activityId = resultGetIdActivity[0].id;

      // Obtener usuarios registrados
      const getUsersRegisterId =
        "SELECT userId FROM registration WHERE courseId = ? AND userId != ?";
      const resultGetUsersRegisterId = await queryDatabase(getUsersRegisterId, [
        courseId,
        teacherId,
      ]);

      // Distribuir actividades
      const queryDistributeActivities =
        "INSERT INTO resolutionsactivities (activityId, userId, courseId) VALUES (?,?,?)";
      const promises = resultGetUsersRegisterId.map((userRegistered) => {
        return queryDatabase(queryDistributeActivities, [
          activityId,
          userRegistered.userId,
          courseId,
        ]);
      });

      //await Promise.all(promises);
      res.status(201).json({ message: "ADD_ACTIVITY_SUCCESFULLY" });
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .json({ error: "ERROR_ADD_ACTIVITY", message: error.message });
    }
  }
);

app.delete(
  "/courses/activities/deleteActivity",
  upload.none(),
  async (req, res) => {
    try {
      const { activityId, courseId } = req.body;
      //const queryGetFiles = 'SELECT '
      const queryDeleteResolutionsActivities =
        "DELETE FROM resolutionsactivities WHERE courseId = ? and activityId = ?";
      const resultQueryDeleteResolutionsActivities = await queryDatabase(
        queryDeleteResolutionsActivities,
        [courseId, activityId]
      );

      const queryDeleteActivity = "DELETE FROM activities WHERE id = ?";
      const resultQueryDeleteActivity = await queryDatabase(
        queryDeleteActivity,
        activityId
      );

      return res.status(200).json({ message: "DELETE_ACTIVITY_SUCCESSFULLY" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_DELETE_ACTIVITY", message: error.message });
    }
  }
);

app.patch(
  "/courses/activities/editActivity/:id",
  upload.none,
  async (req, res) => {
    try {
      const dataUpdated = { ...req.body };
      console.log(dataUpdated);
      const queryUpdateActivity = "UPDATE activities SET ? WHERE id = ?";
      const responseUpdateActivity = queryDatabase(queryUpdateActivity, [
        dataUpdated,
        idActivity,
      ]);
      return res.status(200).json({ message: "EDIT_ACTIVITY_SUCCESSFULLY" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_EDIT_ACTIVITY", message: error.message });
    }
  }
);

app.patch(
  "/courses/activities/deleteResource/:activityId",
  upload.none(),
  async (req, res) => {
    try {
      const activityId = req.params.activityId;
      const queryGetRefFile = "SELECT content FROM activities WHERE id = ?"
      const refFile = await queryDatabase(queryGetRefFile, [activityId])
      console.log((refFile[0].content).split('nameFile:')[0])
      /* const deleteFileToFire = await deleteFileFromFireStorage(refFile)
      const queryDeleteResource = "UPDATE activities set content = '' WHERE activityId = ?"
      const responseDeleteResource = await queryDatabase(queryDeleteResource, [activityId]) */
      return res.status(200).json({ message: "RESOURCE_DELETE_SUCCESFULLY" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_GRADE_ACTIVITY", message: error.message });
    }
  }
);

app.patch(
  "/courses/activities/gradeActivity/:userId/:activityId",
  upload.none(),
  async (req, res) => {
    try {
      const { userId, activityId } = req.params;
      const dataUpdated = req.body;
      const queryGradeActivity =
        "UPDATE resolutionsactivities SET ? WHERE activityId = ? AND userId = ?";
      const responseGradeteActivity = queryDatabase(queryGradeActivity, [
        dataUpdated,
        activityId,
        userId,
      ]);
      return res.status(200).json({ message: "GRADE_ACTIVITY_SUCCESFULLY" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_GRADE_ACTIVITY", message: error.message });
    }
  }
);

app.get(
  "/courses/activities/getActivitiesGrades/:activityId/:userId",
  upload.none(),
  async (req, res) => {
    try {
      const { activityId, userId } = req.params;
      const queryGetActivitiesGrades =
        "SELECT activities.tittle, activities.weighting, resolutionsactivities.GPA FROM activities JOIN resolutionsactivities ON activities.id = resolutionsactivities.activityId WHERE activities.courseId = ? AND resolutionsactivities.userId = ?;";
      const responseGradeteActivity = await queryDatabase(queryGetActivitiesGrades, [
        activityId,
        userId
      ]);

      return res.status(200).json({ message: "GRADE_ACTIVITY_SUCCESFULLY", data: responseGradeteActivity });
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_GRADE_ACTIVITY", message: error.message });
    }
  }
);

app.post(
  "/courses/activities/addResource/:activityId",
  multerMiddleware.array("File"),
  async (req, res) => {
    try {
      const { activityId } = req.params;
      const filesAccepted = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
      ];
      let responseUploadFile = "";
      if (req.files.length > 0) {
        if (!filesAccepted.includes(req.files[0].mimetype)) {
          return res
            .status(500)
            .json({ message: "The file selected is not valid" });
        }
        const idFile = v4()
        responseUploadFile = await uploadFileToFireStorage(req.files[0], idFile, "filesContentActivities");
        responseUploadFile = `${responseUploadFile?.fileRef}nameFile:${responseUploadFile?.fileName}`;
      }

      const queryGradeActivity =
        "UPDATE activities SET content = ? WHERE id = ?";
      const responseGradeteActivity = queryDatabase(queryGradeActivity, [
        responseUploadFile,
        activityId,
      ]);
      console.log(responseUploadFile.split("nameFile:")[0])
      return res.status(200).json( responseUploadFile );
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_GRADE_ACTIVITY", message: error.message });
    }
  }
);

app.delete(
  "/courses/activities/deleteResource/:activityId",
  upload.none(),
  async (req, res) => {
    try {
      const { activityId } = req.params;
      const queryDeleteResource =
        "UPDATE activities SET content = '' WHERE id = ?";
      const responseGradeteActivity = queryDatabase(queryDeleteResource, [
        activityId,
      ]);
      return res.status(200).json({ message: "DELETE_ACTIVITY_SUCCESFULLY" }  );
    } catch (error) {
      res
        .status(500)
        .json({ error: "ERROR_DELETE_ACTIVITY", message: error.message });
    }
  }
);

/**
 * @api {get} /courses/addCourse/:name/:courseCode/:participants/:idTeacher Add Course
 * @apiName AddCourse
 * @apiGroup Courses
 *
 * @apiParam {String} name The name of the course.
 * @apiParam {String} courseCode The code of the course.
 * @apiParam {String} participants A JSON string of user IDs who are participants of the course.
 * @apiParam {String} idTeacher The ID of the teacher of the course.
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "PROCCESS_SUCCESFULLY"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Error message"
 *     }
 */

app.get(
  "/courses/addCourse/:name/:courseCode/:participants/:idTeacher",
  async (req, res) => {
    try {
      const sql1 =
        "INSERT INTO courses (name, courseCode, imgCourse) VALUES (?,?,?)";
      const imgRamdom = Math.floor(Math.random() * 4) + 1;
      const addCourse = await new Promise((resolve, reject) => {
        db.query(
          sql1,
          [req.params.name, req.params.courseCode, imgRamdom],
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      });

      const sqlIdCourses = "SELECT id FROM courses WHERE courseCode = ?";
      const courseId = await new Promise((resolve, reject) => {
        db.query(sqlIdCourses, req.params.courseCode, (err, data) => {
          if (err) reject(err);
          else resolve(data[0].id);
        });
      });

      /**
       * Create a relation between the given userID and couurseCreated only if the user provides an array of users to register.
       * @var {participantsArray} Array of participants
       */
      var participantsArray = JSON.parse(req.params.participants);

      /**
       * Create a relation between the given userID and couurseCreated only if the user provides an array of users to register.
       * @var {userToRegister} Array of user realations with their course assignments
       * @returns {Map} return map of relations between the given userID and the courseID
       */
      var userToRegister = [
        [parseInt(req.params.idTeacher), courseId],
        ...participantsArray.map((userId) => {
          return [userId, courseId];
        }),
      ];

      const sql2 = "INSERT INTO registration (userId, courseId) VALUES (?,?)";
      for (const users of userToRegister) {
        await new Promise((resolve, reject) => {
          db.query(sql2, users, (err, data) => {
            if (err) reject(err);
            else resolve("ADD_SUCCESSFULLY");
          });
        });
      }
      res.json("PROCCESS_SUCCESFULLY");
    } catch (err) {
      res.json(err);
    }
  }
);

/**
 * @api {delete} /courses/deleteCourse/:id Delete Course
 * @apiName DeleteCourse
 * @apiGroup Courses
 *
 * @apiParam {Number} id The ID of the course.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Object} course The deleted course object.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Curso eliminado con éxito",
 *       "course": {}
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Error al eliminar el curso"
 *     }
 */

app.delete("/courses/deleteCourse/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ error: "ID del curso no proporcionado" });
    }
    
    const queryDeleteResolutionActivities =
      "DELETE FROM resolutionsactivities where courseId = ?";
    const resultQueryDeleteResolutionActivities = await queryDatabase(
      queryDeleteResolutionActivities,
      courseId
    );

    const queryDeleteActivities = "DELETE FROM activities where courseId = ?";
    const resultQueryDeleteActivities = await queryDatabase(
      queryDeleteActivities,
      courseId
    );
    
    const queryDeleteRegistrations = `DELETE from registration WHERE courseId = ?`;
    const resultQueryDeleteRegistrations = await queryDatabase(
      queryDeleteRegistrations,
      courseId
    );

    const queryDeleteCourse = `DELETE from courses WHERE id = ? RETURNING name as nameCourse`;
    const resultQueryDeleteCourse = await queryDatabase(
      queryDeleteCourse,
      courseId
    );

    const deleteCourseDirs = await deleteCourse(resultQueryDeleteCourse[0])

    res.json({ message: "Curso eliminado con éxito", course: courseId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
});

app.post("/courses/editCourse", upload.none(), async (req, res) => {
  try {
    const course = req.body;

    const queyEditCourse =
      "UPDATE COURSES SET name = ?, courseCode = ? WHERE id = ?";

    await new Promise((resolve, reject) => {
      db.query(
        queyEditCourse,
        [course.name, course.code, course.id],
        (err, data) => {
          if (err) reject(err);
          else resolve("SUCCES");
        }
      );
    });

    return res.json({ message: "Curso editado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al intentar editar el curso" });
  }
});

app.get(
  "/files/download/:activityId/:userId?/:type",
  upload.none(),
  async (req, res) => {
    try {
      const { type, userId, activityId } = req.params;
      const queryGetURL = {
        userResolution: {
          query: `SELECT resolution as file FROM resolutionsactivities WHERE activityId = ? AND userId = ?`,
          params: [activityId, userId],
        },
        contentActivity: {
          query: `SELECT content as file FROM activities WHERE id = ?`,
          params: [activityId],
        },
      };
      console.log(queryGetURL[type].query);
      const responseGetURL = await queryDatabase(
        queryGetURL[type].query,
        queryGetURL[type].params
      );
      return res
        .status(200)
        .json({ message: "GET_URL_SUCCESFULLY", ...responseGetURL[0] });
    } catch (error) {
      res.status(500).json({ message: "GET_URL_ERROR", error: error });
    }
  }
);

app.get("/registration/:id", (req, res) => {
  const sql = `SELECT c.courseCode AS course_code, c.name AS course_name, c.id AS course_id, c.imgCourse AS img_course              
    FROM Registration r
    JOIN courses c ON r.courseId = c.id
    WHERE r.userId = ?;`;
  db.query(sql, req.params.id, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/users/:username/:pass", (req, res) => {
  const sql =
    "SELECT username, id, rol FROM users WHERE username = ? AND pass = ?";
  db.query(sql, [req.params.username, req.params.pass], (err, data) => {
    const server = {};
    if (err) return res.json(err);
    if (data.length > 0) {
      server.name = data[0].username;
      server.id = data[0].id;
      server.rol = data[0].rol;
      server.response = "LOGIN_SUCCESFULLY";
      return res.json(server);
    } else {
      server.response = "USER_OR_PASS_INVALID";
      return res.json(server);
    }
  });
});

app.post("/users/addUser", (req, res) => {
  const username = req.body.username;
  const pass = req.body.password;
  const rol = req.body.rol;

  db.query(
    "SELECT username FROM `users` WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        return res.json(err);
      } else if (result.length > 0) {
        console.log(result);
      }
    }
  );

  db.query(
    "INSERT INTO `users`(`username`, `pass`, `rol`) VALUES (?,?,?)",
    [username, pass, rol],
    (err, result) => {
      if (err) {
        return res.json(err);
      } else {
        return res.json("USER_ADD_SUCCESSFULLY");
      }
    }
  );
});

app.get("/users/getUsers", (req, res) => {
  const sql = "SELECT * FROM `users`";
  db.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en la consulta" });
    }

    return res.json({
      response: "GET_USERS_SUCCESSFULLY",
      users: data,
    });
  });
});

app.delete("/users/deleteUser", (req, res) => {
  const userId = req.body.userId;
  const checkRegistration = "SELECT * FROM `registration` WHERE `userId` = ?";

  function deleteUserFromUsers(userId) {
    const deleteUser = "DELETE FROM `users` WHERE id = ?";
    db.query(deleteUser, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error en la consulta eliminar usuario" });
      } else {
        return res.json({
          response: "USER_SUCCESSFULLY_DELETED",
        });
      }
    });
  }

  db.query(checkRegistration, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return result
        .status(500)
        .json({ error: "Error en la consulta validacion" });
    } else if (result.length > 0) {
      const deleteUserRegistration =
        "DELETE FROM `registration` WHERE `userId` = (SELECT `id` FROM `users` WHERE `id` = ?)";
      db.query(deleteUserRegistration, [userId], (err, result) => {
        if (err) {
          console.error(err);
          return result
            .status(500)
            .json({ error: "Error en la consulta eliminar registro" });
        } else {
          deleteUserFromUsers(userId, res);
        }
      });
    } else {
      deleteUserFromUsers(userId, res);
    }
  });
});

app.put("/users/editUser", (req, res) => {
  const userId = req.body.id;
  const username = req.body.username;
  const pass = req.body.password;
  const rol = req.body.rol;

  db.query(
    "UPDATE users SET username = ?, pass = ?, rol = ? WHERE id = ?",
    [username, pass, rol, userId],
    (err, result) => {
      if (err) {
        console.log(result);
        return res.json(err);
      } else {
        return res.json("USER_EDIT_SUCCESSFULLY");
      }
    }
  );
});

app.get("/users/getQuantityUsers", (req, res) => {
  const getQuantityUsers = "SELECT rol, COUNT(*) FROM users GROUP BY rol";

  db.query(getQuantityUsers, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error en la consulta" });
    } else {
      return res.json({
        response: "AMOUNT_OF_USER_SUCCESSFULLY_OBTAINED",
        numberOfUsers: data,
      });
    }
  });
});

app.get("/users/getQuantityRecords", (req, res) => {
  const getQuantityRecords =
    "SELECT c.name, COUNT(r.userId) AS 'countUsers'FROM courses c JOIN registration r ON c.id = r.courseId GROUP BY c.name";
    db.query(getQuantityRecords, (err, data) => {
      if(err){
        return res.status(500).json({ error: "Error en la consulta" });
      }else{
        return res.json({
          response: "SUCCESSFULLY_OBTAINED_RECORDS",
          numberOfRecords: data
        })
      }
    })
});

app.get("/", (re, res) => {
  return res.json("hello from backend side");
});

app.listen(8081, () => {
  console.log("listening");
});
