import fs from 'fs';
import path from 'path';
import { Modules } from '../../models/modules.interface';
import { readCourses, updateCourse } from '../cours';
import { Course } from '../../models/course.interface';

const ModulesFilePath = path.join('database/modules.json');

const readModules = async () => {
    return new Promise<Modules[]>((resolve, reject) => {
        fs.readFile(ModulesFilePath, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData.modules || []);
            } catch (parseError) {
                reject(new Error("Failed to parse JSON data"));
            }
        });
    });
};

const writeModule = async (newModule: { id?: any, title: string }): Promise<Modules> => {
    const modulesData = await readModules();
    let newId = 1;
    if (modulesData.length) {
        newId = modulesData[modulesData.length - 1].id + 1
    } else {
        newId = 1
    }
    const ModuleToAdd: Modules = { id: newId, ...newModule };
    ModuleToAdd.id = newId
    modulesData.push(ModuleToAdd);

    return new Promise<Modules>((resolve, reject) => {
        fs.writeFile(ModulesFilePath, JSON.stringify({ modules: modulesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(ModuleToAdd);
        });
    });
};


export const AffectCourseToModule = async (moduleId: number, courseId: number): Promise<Course | null> => {
    const coursesData = await readCourses();
    const course = coursesData.find((course: Course) => course.id === courseId);

    if (!course) {
        return null;
    }
    if (!course.modules) {
        course.modules = [];
    }
    const isModuleAlreadyAssigned = course.modules.find(module => module.id === moduleId);
    if (!isModuleAlreadyAssigned) {
        course.modules.push({ id: moduleId });
    }
    await updateCourse(course.id, course)
    return course;
};

const updateModule = async (id: number, updatedModule: { title?: string, lessons?: { id: number }[] }): Promise<Modules | null> => {
    const modulesData = await readModules();
    console.log(updatedModule);


    const moduleIndex = modulesData.findIndex(module => module.id === id);

    if (moduleIndex === -1) {

        return null;
    }


    const moduleToUpdate = modulesData[moduleIndex];
    modulesData[moduleIndex] = {
        ...moduleToUpdate,
        title: updatedModule.title || moduleToUpdate.title,
        lessons: updatedModule.lessons ?? modulesData[moduleIndex].lessons
    };


    return new Promise<Modules>((resolve, reject) => {
        fs.writeFile(ModulesFilePath, JSON.stringify({ modules: modulesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(modulesData[moduleIndex]);
        });
    });
};



const findModuleById = async (id: number): Promise<Modules | null> => {
    const modulesData = await readModules();

    const module = modulesData.find(module => module.id === id);


    return module || null;
};


const deleteModule = async (moduleId: number): Promise<boolean> => {
    const modulesData = await readModules();
    console.log(modulesData);

    const updatedModules = modulesData.filter(module => module.id !== moduleId);

    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(ModulesFilePath, JSON.stringify({ modules: updatedModules }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
};


const coursesFilePath = path.join('database/cours.json');

const removeModuleFromCourse = async (moduleId: number): Promise<Course | null> => {
    const coursesData = await readCourses();
    let updatedCourse: Course | null = null;


    coursesData.forEach((course) => {
        const moduleIndex = course.modules?.findIndex(mod => mod.id === moduleId);
        if (moduleIndex !== -1) {

            course.modules?.splice(moduleIndex!, 1);
            updatedCourse = course;
        }
    });

    if (updatedCourse) {
        return new Promise<Course>((resolve, reject) => {
            fs.writeFile(coursesFilePath, JSON.stringify({ cours: coursesData }, null, 2), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(updatedCourse!);
            });
        });
    } else {
        return null;
    }
};

export { readModules, writeModule, updateModule, findModuleById, deleteModule, removeModuleFromCourse };
