import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { dataTypeConverter } from "../middlewares/dataTypeConverter.js";
import { createProject, deleteProject, getProjectId, listProjects, updateProject } from "../controller/projectController.js";

const router = express.Router(); 


router.post("/", authMiddleware, dataTypeConverter, createProject)


router.get('/', authMiddleware, listProjects)


router.get("/:id", authMiddleware, getProjectId)


router.put("/:id", authMiddleware, dataTypeConverter, updateProject)


router.delete("/:id", authMiddleware, deleteProject)

export default router;