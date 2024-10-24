import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import { AffectCourseToModule, deleteModule, findModuleById, readModules, removeModuleFromCourse, updateModule, writeModule } from "../controller/modules";
import { Modules } from "../models/modules.interface";
import { findCourseById } from "../controller/cours";
import { moduleSchema, updateModuleSchema } from "../validators/modules.validators";
import { validateRequest } from "../middleware/validateRequest";

dotenv.config();

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Modules  
 *   description: Modules management and operations
 */

/**
 * @swagger
 * /api-modules/modules:
 *   get:
 *     summary: Retrieve a list of all modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: A list of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The module ID
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: The module title
 *                     example: "Title module here"
 *                   description:
 *                     type: string
 *                     description: The module description
 *                     example: "Learn the fundamentals of web development, covering HTML, CSS, and JavaScript."
 *       500:
 *         description: Error fetching modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching modules"
 *                 error:
 *                   type: object
 *                   description: Detailed error information
 */
router.get("/modules", async (req: Request, res: Response) => {
    try {
        const modules = await readModules(); 
        res.status(200).json(modules); 
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
    }
});

/**
 * @swagger
 * /api-modules/modules/create/{id}:
 *   post:
 *     summary: Create a new module and associate it with a course.
 *     description: This endpoint creates a new module and associates it with an existing course.
 *     tags:
 *       - Modules
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the course to associate the module with.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Module object that needs to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the new module.
 *                 example: "New Module"
 *     responses:
 *       201:
 *         description: Module created and associated with the course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "New Module"
 *                 course:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Course Title"
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *       400:
 *         description: Bad Request - Title is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title is required."
 *       404:
 *         description: Course not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating module"
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/modules/create/:id", validateRequest(moduleSchema , "body") ,async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const courseId = parseInt(req.params.id);
        if (!title) {
            res.status(400).json({ message: "Title is required." });
        } else {
            const course = await findCourseById(courseId);
            if (!course) {
                res.status(404).json({ message: "Course not found." });
            } else {
                const newModule: Modules = { id: 0, title };
                const ModuleAdded = await writeModule(newModule);
                const updatedCourse = await AffectCourseToModule(ModuleAdded.id, courseId);
                res.status(201).json({ module: ModuleAdded, course: updatedCourse });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating module", error: "Server error" });
    }
});



/**
 * @swagger
 * /api-modules/modules/{id}:
 *   put:
 *     summary: Update an existing module.
 *     description: This endpoint updates an existing module by ID.
 *     tags:
 *       - Modules
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the module to be updated.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Updated module object.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title of the module.
 *                 example: "Updated Module Title"
 *     responses:
 *       200:
 *         description: Module updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Updated Module Title"
 *       404:
 *         description: Module not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Module not found."
 *       400:
 *         description: Bad Request - Invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title is required."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating module"
 */
router.put("/modules/:id",validateRequest(updateModuleSchema , "body") , async (req: Request, res: Response) => {
    try {
        const moduleId = parseInt(req.params.id, 10);
        const { title } = req.body;
        if (!title) {
            res.status(400).json({ message: "Title is required." });
        } else {
            const updatedModule = await updateModule(moduleId, { title });
            if (!updatedModule) {
                res.status(404).json({ message: "Module not found." });
            } else {
                res.status(200).json({ module: updatedModule });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating module", error });
    }
});
/**
 * @swagger
 * /api-modules/modules/delete/{id}:
 *   delete:
 *     summary: Delete a module by ID.
 *     description: This endpoint deletes a module by ID and removes it from the associated course.
 *     tags:
 *       - Modules
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the module to be deleted.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Module deleted successfully."
 *                 course:
 *                   type: object
 *                   description: Updated course after the module was removed.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Course Title"
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           title:
 *                             type: string
 *                             example: "Module Title"
 *       404:
 *         description: Module or associated course not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Module not found."
 *       500:
 *         description: Server error while deleting the module.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete module."
 *                 error:
 *                   type: string
 *                   example: "Server error."
 */
router.delete("/modules/delete/:id", async (req: Request, res: Response) => {
    try {

        const moduleId = parseInt(req.params.id);
        const module = await findModuleById(moduleId);
        console.log("delete " + module);
        if (!module) {
            res.status(404).json({ message: "Module not found." });
        } else {
            const moduleDeleted = await deleteModule(moduleId);
            if (!moduleDeleted) {
                res.status(500).json({ message: "Failed to delete module." });
                return;
            }
            const updatedCourse = await removeModuleFromCourse(moduleId);
            res.status(200).json({ message: "Module deleted successfully.", course: updatedCourse });
            return;
        }
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ message: "Server error.", error });
    }
});

export default router;

