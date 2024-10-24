import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import { deleteCourse, findCourseById, readCoursesWithModules, updateCourse, writeCourses } from "../controller/cours";
import { Course } from "../models/course.interface";
dotenv.config();
import { courseSchema } from "../validators/cours.validators";
import { validateRequest } from "../middleware/validateRequest";
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Courses  
 *   description: Cours management and operations
 */

/**
 * @swagger
 * /api/cours:
 *   get:
 *     summary: Retrieve a list of courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The course ID
 *                   title:
 *                     type: string
 *                     description: The course title
 *                   description:
 *                     type: string
 *                     description: A brief description of the course
 *       500:
 *         description: Error fetching courses
 */
router.get("/cours", async (req: Request, res: Response) => {
    try {
        const courses = await readCoursesWithModules();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
    }
});

/**
 * @swagger
 * /api/cours/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     description: Retrieve a course from the system by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Successfully retrieved the course.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Introduction to Programming"
 *                 description:
 *                   type: string
 *                   example: "A basic course on programming concepts."
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
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving course."
 *                 error:
 *                   type: string
 */
router.get("/cours/:id", async (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const course = await findCourseById(courseId);

        if (!course) {
             res.status(404).json({ message: "Course not found." });
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving course", error });
    }
});

/**
 * @swagger
 * /api/cours:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the course
 *                 example: "Entre Course Title"
 *               description:
 *                 type: string
 *                 description: A brief description of the course
 *                 example: "Entre a Description ."
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created course
 *                 title:
 *                   type: string
 *                   description: The title of the course
 *                 description:
 *                   type: string
 *                   description: A brief description of the course
 *       400:
 *         description: Title and description are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Title and description are required."
 *       500:
 *         description: Error creating course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: string
 *                   description: Detailed error information
 */
router.post("/cours", async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: "Title and description are required." });
        } else {
            const newCourse: Course = { id: 0, title, description }; 
            const courseAdded = await writeCourses(newCourse);
            res.status(201).json(courseAdded);
        }

    } catch (error) {
        res.status(500).json({ message: "Error creating course", error });
    }
})

/**
 * @swagger
 * /api/cours/{id}:
 *   put:
 *     summary: Update an existing course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the course
 *               description:
 *                 type: string
 *                 description: The description of the course
 *     responses:
 *       200:
 *         description: The updated course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Title and description are required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Error updating course
 */
router.put("/cours/:id", async (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.id);
        const updatedData = req.body;

        
        if (!updatedData.title || !updatedData.description) {
             res.status(400).json({ message: "Title and description are required." });
        }else{
            const updatedCourse = await updateCourse(courseId, updatedData);

            if (!updatedCourse) {
                res.status(404).json({ message: "Course not found." });
            }else{
                res.status(200).json(updatedCourse);
            }
        }

        
    } catch (error) {
         res.status(500).json({ message: "Error updating course", error });
    }
});

/**
 * @swagger
 * /api/cours/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the course to delete
 *     responses:
 *       200:
 *         description: Course successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course successfully deleted."
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course not found."
 *       500:
 *         description: Error deleting course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting course"
 *                 error:
 *                   type: object
 *                   description: Detailed error information
 */
router.delete("/cours/:id", async (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        const deletedCourse = await deleteCourse(courseId);
        if (!deletedCourse) {
             res.status(404).json({ message: "Course not found." });
        }else{
            res.status(200).json({ message: "Course successfully deleted." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
    }
});

export default router;
