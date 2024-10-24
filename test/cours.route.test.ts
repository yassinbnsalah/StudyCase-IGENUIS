import request from "supertest";
import express from "express";
import coursRoutes from "../routes/cours.route";
import * as coursController from '../controller/cours';
import { Course } from "../models/course.interface";
const app = express();
app.use(express.json());
app.use("/api", coursRoutes);
jest.mock("../controller/cours");
describe("Courses API", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cours", () => {
    it("should return a list of courses", async () => {
      const mockCourses: Course[] = [
        { id: 1, title: "Course 1", description: "Description 1" },
        { id: 2, title: "Course 2", description: "Description 2" },
      ];

      (coursController.readCoursesWithModules as jest.Mock).mockResolvedValue(mockCourses);

      const response = await request(app).get("/api/cours");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCourses);
    });

    it("should return a 500 if there is an error fetching courses", async () => {
      (coursController.readCoursesWithModules as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/cours");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Error fetching courses");
    });
  });

  describe("POST /api/cours", () => {
    it("should create a new course", async () => {
      const mockCourse: Course = { id: 1, title: "Course 1", description: "Description 1" };

      (coursController.writeCourses as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app)
        .post("/api/cours")
        .send({ title: "Course 1", description: "Description 1" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCourse);
    });

    it("should return 400 if title or description is missing", async () => {
      const response = await request(app)
        .post("/api/cours")
        .send({ title: "Course 1" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and description are required.");
    });

    it("should return 500 if there is an error creating a course", async () => {
      (coursController.writeCourses as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/cours")
        .send({ title: "Course 1", description: "Description 1" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Error creating course");
    });
  });

  describe("PUT /api/cours/:id", () => {
    it("should update an existing course", async () => {
      const mockCourse: Course = { id: 1, title: "Updated Course", description: "Updated Description" };

      (coursController.updateCourse as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app)
        .put("/api/cours/1")
        .send({ title: "Updated Course", description: "Updated Description" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCourse);
    });

    it("should return 404 if course is not found", async () => {
      (coursController.updateCourse as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/api/cours/999")
        .send({ title: "Updated Course", description: "Updated Description" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Course not found.");
    });

    it("should return 400 if title or description is missing", async () => {
      const response = await request(app)
        .put("/api/cours/1")
        .send({ description: "Updated Description" }); // Missing title

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and description are required.");
    });

    it("should return 500 if there is an error updating the course", async () => {
      (coursController.updateCourse as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/cours/1")
        .send({ title: "Updated Course", description: "Updated Description" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Error updating course");
    });
  });
  describe("DELETE /api/cours/:id", () => {
    it("should delete a course by ID", async () => {
      (coursController.deleteCourse as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete("/api/cours/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Course successfully deleted.");
    });

    it("should return 404 if course is not found", async () => {
      (coursController.deleteCourse as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete("/api/cours/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Course not found.");
    });

    it("should return 500 if there is an error deleting the course", async () => {
      (coursController.deleteCourse as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/cours/1");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Error deleting course");
    });
  });
})
