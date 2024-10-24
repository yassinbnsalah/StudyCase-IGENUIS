import request from "supertest";
import express from "express";
import modulesRoute from "../routes/modules.route";
import * as coursController from '../controller/cours';
import * as moduleController from '../controller/modules';
jest.mock("../controller/modules");
jest.mock("../controller/cours");

const app = express();
app.use(express.json()); 
app.use("/api-modules", modulesRoute);

describe("GET /api-modules/modules", () => {
    it("should return a list of modules", async () => {
      const mockModules = [
        { id: 1, title: "Module 1" },
        { id: 2, title: "Module 2" },
      ];

      (moduleController.readModules as jest.Mock).mockResolvedValue(mockModules);
      const response = await request(app).get("/api-modules/modules");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockModules);
    });

    it("should return 500 if there is an error", async () => {
      (moduleController.readModules as jest.Mock).mockRejectedValue(new Error("Error fetching modules"));
      const response = await request(app).get("/api-modules/modules");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Error fetching courses");
    });
  });

  describe("POST /api-modules/modules/create/:id", () => {
    it("should create a new module and associate it with a course", async () => {
      const courseId = 1;
      const mockCourse = { id: courseId, title: "Course Title", modules: [] };
      const mockNewModule = { id: 1, title: "New Module" };
      const updatedCourse = { ...mockCourse, modules: [mockNewModule] };

      (coursController.findCourseById as jest.Mock).mockResolvedValue(mockCourse);
      (moduleController.writeModule as jest.Mock).mockResolvedValue(mockNewModule);
      (moduleController.AffectCourseToModule as jest.Mock).mockResolvedValue(updatedCourse);
      
      const response = await request(app)
        .post(`/api-modules/modules/create/${courseId}`)
        .send({ title: "New Module" });
      expect(response.status).toBe(201);
      expect(response.body.module).toEqual(mockNewModule);
      expect(response.body.course).toEqual(updatedCourse);
    });

    it("should return 404 if the course is not found", async () => {
      (coursController.findCourseById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api-modules/modules/create/1")
        .send({ title: "New Module" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Course not found.");
    });

    it("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api-modules/modules/create/1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title is required.");
    });
  });


  describe("PUT /api-modules/modules/:id", () => {
    it("should update an existing module", async () => {
      const moduleId = 1;
      const mockUpdatedModule = { id: moduleId, title: "Updated Module Title" };

      (moduleController.updateModule as jest.Mock).mockResolvedValue(mockUpdatedModule);

      const response = await request(app)
        .put(`/api-modules/modules/${moduleId}`)
        .send({ title: "Updated Module Title" });

      expect(response.status).toBe(200);
      expect(response.body.module).toEqual(mockUpdatedModule);
    });

    it("should return 404 if module is not found", async () => {
      (moduleController.updateModule as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/api-modules/modules/999")
        .send({ title: "Updated Module Title" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Module not found.");
    });

    it("should return 400 if title is missing", async () => {
      
      const response = await request(app)
        .put("/api-modules/modules/1")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title is required.");
    });
  });


  describe("DELETE /api-modules/modules/delete/:id", () => {
    it("should delete a module and remove it from the course", async () => {
      const moduleId = 1;
      const mockCourse = { id: 1, title: "Course Title", modules: [] };

      (moduleController.findModuleById as jest.Mock).mockResolvedValue({ id: moduleId, title: "Module to be deleted" });
      (moduleController.deleteModule as jest.Mock).mockResolvedValue(true);
      (moduleController.removeModuleFromCourse as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app).delete(`/api-modules/modules/delete/${moduleId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Module deleted successfully.");
      expect(response.body.course).toEqual(mockCourse);
    });

    it("should return 404 if the module is not found", async () => {
      (moduleController.findModuleById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/api-modules/modules/delete/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Module not found.");
    });
  });