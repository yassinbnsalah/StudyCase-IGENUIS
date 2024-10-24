import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import { Lessons } from "../models/lessons.interface";
import { AffectModuleToLessons, createLesson, deleteLesson, readLessons, writeLesson, writeLessons } from "../controller/lessons";
import { findModuleById } from "../controller/modules";
dotenv.config();

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Lessons  
 *   description: Lessons management and operations
 */
/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: List of lessons
 *       500:
 *         description: Error fetching lessons
 */

router.get("/lessons", async (req: Request, res: Response) => {
    try {
        const lessons = await readLessons();
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: "Error fetching lessons", error });
    }
});

/**
 * @swagger
 * /lessons/{id}:
 *   post:
 *     summary: Create a lesson in a specific module
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the module to associate the lesson with
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     data:
 *                       type: string
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Missing Data
 *       404:
 *         description: Module not found
 *       500:
 *         description: Failed to create lesson
 */
router.post('/lessons/:id', async (req: Request, res: Response) => {
    try {
        const lessonData: Lessons = req.body;
        const moduleId = parseInt(req.params.id);

        if (!lessonData) {
            res.status(400).json({ message: "Missing Data." });
        } else {
            const module = await findModuleById(moduleId);
            if (!module) {
                res.status(404).json({ message: "Module not found." });
            } else {
                const updatedLessons = await writeLesson(lessonData);
                if (!updatedLessons) {
                    res.status(500).json({ message: "Failed to create lesson." });
                } else {
                    const newModule = await AffectModuleToLessons(moduleId, updatedLessons.id);
                    res.status(201).json({
                        message: "Lesson created successfully",
                        lessons: updatedLessons,
                        module: newModule
                    });
                }
            }
        }
    } catch (error) {
        console.log("Error creating lesson:", error);
        res.status(500).json({ message: "Failed to create lesson" });
    }
});


/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the lesson to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     data:
 *                       type: string
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       400:
 *         description: Missing Data
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Failed to update lesson
 */
router.put('/lessons/:id', async (req: Request, res: Response) => {
    try {
        const lessonData: Lessons = req.body;
        const lessonId = parseInt(req.params.id);
        if (!lessonData) {
            res.status(400).json({ message: "Missing Data." });
        }
        const existingLessons = await readLessons();
        const existingLesson = existingLessons.find(lesson => lesson.id === lessonId);

        if (!existingLesson) {
            res.status(404).json({ message: "Lesson not found." });
        } else {
            Object.assign(existingLesson, lessonData);
            await writeLessons(existingLessons);
            res.status(200).json({
                message: "Lesson updated successfully",
                lesson: existingLesson
            });
        }
    } catch (error) {
        console.error("Error updating lesson:", error);
        res.status(500).json({ message: "Failed to update lesson", error: error });
    }
});
/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the lesson to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Failed to delete lesson
 */
router.delete('/lessons/:id', async (req, res) => {
    try {
        const lessonId = parseInt(req.params.id, 10);
        if (isNaN(lessonId) || lessonId < 1) {
             res.status(400).json({ message: "Invalid lesson ID provided." });
        }else{

            const success = await deleteLesson(lessonId);

            if (success) {
                res.status(200).json({ message: "Lesson deleted successfully." });
            } else {
                res.status(404).json({ message: "Lesson not found." });
            }
        }
    } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).json({ message: "An error occurred while deleting the lesson.", error: error });
    }
});
export default router;

