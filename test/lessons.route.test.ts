import request from "supertest";
import express from "express";
import lessonsRoute from "../routes/lessons.route";
import { Lessons } from "../models/lessons.interface";
import { Modules } from "../models/modules.interface";
import * as lessonsModule from '../controller/lessons';

const app = express();
app.use(express.json());
app.use("/", lessonsRoute);

jest.mock('../controller/lessons', () => ({
    readLessons: jest.fn(),
    writeLessons: jest.fn(),
    writeLesson: jest.fn(),
    deleteLesson: jest.fn(),
    removeLessonFromModules: jest.fn(),
    AffectModuleToLessons: jest.fn(),
}));
describe('GET /lessons', () => {
    it('should return a list of lessons', async () => {
        const mockLessons = [
            { id: 1, title: 'Lesson 1', description: 'Description of lesson 1' },
            { id: 2, title: 'Lesson 2', description: 'Description of lesson 2' },
        ];

        (lessonsModule.readLessons as jest.Mock).mockResolvedValue(mockLessons);

        const response = await request(app).get('/lessons');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLessons);
    });
});

describe('POST /lessons/:id', () => {
    let mockLesson: Lessons;
    let mockModule: Modules;
    let mockUpdatedModules: Modules;
    beforeEach(() => {

        mockModule = {
            id: 1,
            title: 'Test Course',
            lessons: []
        };

        mockLesson = {
            id: 2,
            title: "Lesson 2",
            description: "Description of lesson 2",
            topics: ["Topic A", "Topic B"],
            content: [
                {
                    type: "text",
                    data: "Lesson 2 content"
                }
            ]
        };
        (lessonsModule.writeLesson as jest.Mock).mockResolvedValue(mockLesson);
        (lessonsModule.AffectModuleToLessons as jest.Mock).mockResolvedValue(mockLesson);
        mockUpdatedModules = {
            ...mockModule,
            lessons: [{ id: mockLesson.id }]
        };
       
    })
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create a lesson and associate it with a module, returning status 201', async () => {

        const res = await request(app)
            .post('/lessons/1')
            .send(mockLesson);
        expect(res.status).toBe(201);

    });

    it('should return status 404 if module does not exist', async () => {
        const mockLessonData = {
            title: "Lesson 2",
            description: "Description of lesson 2",
            topics: ["Topic A", "Topic B"],
            content: [
                {
                    type: "text",
                    data: "Lesson 2 content"
                }
            ]
        };
        const res = await request(app)
            .post('/lessons/1000')
            .send(mockLessonData);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Module not found." });
    });
});

describe('DELETE /lessons/:id', () => {
    it('should delete an existing lesson and return status 200', async () => {
        const mockLessons = [
            { id: 1, title: "Lesson 1" },
            { id: 2, title: "Lesson 2" }
        ];

        (lessonsModule.readLessons as jest.Mock).mockResolvedValue(mockLessons);
        (lessonsModule.writeLessons as jest.Mock).mockResolvedValueOnce(undefined);
        (lessonsModule.removeLessonFromModules as jest.Mock).mockResolvedValueOnce(undefined);
        (lessonsModule.deleteLesson as jest.Mock).mockResolvedValueOnce(true);

        const res = await request(app)
            .delete(`/lessons/1`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Lesson deleted successfully." });
       
    });

    it('should return status 404 if the lesson does not exist', async () => {
        const lessonId = 10000;

        (lessonsModule.readLessons as jest.Mock).mockResolvedValue([]);
        const res = await request(app)
            .delete(`/lessons/${lessonId}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Lesson not found." });
    });
});