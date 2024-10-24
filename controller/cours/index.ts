import fs from 'fs';
import path from 'path';
import { Course } from '../../models/course.interface';
import { readModules } from '../modules';
import fs2 from 'fs/promises';
import { readLessons } from '../lessons';
import { Lessons } from '../../models/lessons.interface';

const coursesFilePath = path.join('database/cours.json');

const readCourses = async () => {
    return new Promise<Course[]>((resolve, reject) => {
        fs.readFile(coursesFilePath, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData.cours || []);
            } catch (parseError) {
                reject(new Error("Failed to parse JSON data"));
            }
        });
    });
};


export const findCourseById = async (courseId: number): Promise<Course | null> => {
    const coursesData = await readCourses();
    const course = coursesData.find((course: Course) => course.id === courseId);
    return course || null;
};

const readCoursesWithModules = async (): Promise<Course[]> => {
    const coursesData = await readCourses();
    const modulesData = await readModules();
    const lessonsData = await readLessons();

    const expandedCourses = coursesData.map(course => {
        if (course.modules && course.modules.length > 0) {
            course.modules = course.modules.map(moduleRef => {
                const fullModule = modulesData.find(m => m.id === moduleRef.id);
                console.log('Full Module:', fullModule);

                if (fullModule) {
                    const lessonsList = fullModule.lessons?.map(lessonID => {
                        const fullLesson = lessonsData.find((l: Lessons) => l.id === lessonID.id);
                        console.log('Full Lesson:', fullLesson);
                        return fullLesson;
                    });
                    return {
                        id: fullModule.id,
                        title: fullModule.title,
                        lessons: lessonsList || []
                    };
                }
                return moduleRef;
            });
        }
        return course;
    });


    return expandedCourses;
};

const writeCourses = async (newCourse: { title: string; description: string }): Promise<Course> => {
    const coursesData = await readCourses();
    let newId = 1;
    if (coursesData.length) {
        newId = coursesData[coursesData.length - 1].id + 1
    } else {
        newId = 1
    }
    const courseToAdd: Course = { id: newId, ...newCourse };
    courseToAdd.id = newId
    courseToAdd.modules = []
    coursesData.push(courseToAdd);
    return new Promise<Course>((resolve, reject) => {
        fs.writeFile(coursesFilePath, JSON.stringify({ cours: coursesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(courseToAdd);
        });
    });
};

const writeCoursesV2 = async (newCourses: { title: string; description: string }[]): Promise<Course[]> => {
    const coursesData = await readCourses();
    let newCoursesWithId: Course[] = [];
    for (const newCourse of newCourses) {
        let newId = 1;
        if (coursesData.length) {
            newId = coursesData[coursesData.length - 1].id + 1;
        }
        const courseToAdd: Course = { id: newId, ...newCourse, modules: [] };
        newCoursesWithId.push(courseToAdd);
        coursesData.push(courseToAdd);
    }

    return new Promise<Course[]>((resolve, reject) => {
        fs.writeFile(coursesFilePath, JSON.stringify({ cours: coursesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(newCoursesWithId);
        });
    });
};

const updateCourse = async (id: number, updatedCourse: { title?: string; description?: string, modules?: { id: number }[] }): Promise<Course | null> => {
    const coursesData = await readCourses();

    const courseIndex = coursesData.findIndex(course => course.id === id);

    if (courseIndex === -1) {
        return null;
    }
    coursesData[courseIndex] = {
        ...coursesData[courseIndex],
        title: updatedCourse.title ?? coursesData[courseIndex].title,
        description: updatedCourse.description ?? coursesData[courseIndex].description,
        modules: updatedCourse.modules ?? coursesData[courseIndex].modules
    };
    await fs2.writeFile(coursesFilePath, JSON.stringify({ cours: coursesData }, null, 2));
    return coursesData[courseIndex];
};


const deleteCourse = async (id: number): Promise<boolean> => {
    const coursesData = await readCourses();
    const courseIndex = coursesData.findIndex(course => course.id === id);
    if (courseIndex === -1) {
        return false;
    }
    coursesData.splice(courseIndex, 1);
    return new Promise((resolve, reject) => {
        fs.writeFile(coursesFilePath, JSON.stringify({ cours: coursesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
};

export { readCourses, writeCourses, updateCourse, deleteCourse, readCoursesWithModules, writeCoursesV2 };
