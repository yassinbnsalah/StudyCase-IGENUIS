import fs from 'fs';
import path from 'path';
import { Lessons } from '../../models/lessons.interface';
import { Modules } from '../../models/modules.interface';
import { readModules, updateModule } from '../modules';

const LessonsFilePath = path.join('database/lessons.json');

export const readLessons = async (): Promise<Lessons[]> => {
    return new Promise<Lessons[]>((resolve, reject) => {
        fs.readFile(LessonsFilePath, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData.lessons || []); 
            } catch (parseError) {
                reject(new Error("Failed to parse JSON data"));
            }
        });
    });
};



export const writeLessons = async (lessons: Lessons[]): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(LessonsFilePath, JSON.stringify({ lessons }, null, 2), 'utf-8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

export const writeLesson = async (newLesson: {
    id?: number,
    title: string,
    description: string,
    topics: string[],
    content: {
        type: string,
        data: string,
    }[];
}): Promise<Lessons> => {
    console.log("test");
    
    const LessonsData = await readLessons();
    let newId = 1;
    if (LessonsData.length) {
        newId = LessonsData[LessonsData.length - 1].id + 1
    } else {
        newId = 1
    }
    const LessonToAdd: Lessons = { id: newId, ...newLesson };
    LessonToAdd.id = newId
    LessonsData.push(LessonToAdd);

    return new Promise<Lessons>((resolve, reject) => {
        fs.writeFile(LessonsFilePath, JSON.stringify({ lessons: LessonsData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(LessonToAdd);
        });
    });
};


export const createLesson = async (newLesson: Lessons): Promise<Lessons> => {
    try {
        const lessons = await readLessons();
        const newId = lessons.length > 0 ? lessons[lessons.length - 1].id + 1 : 1;
        newLesson.id = newId;
        lessons.push(newLesson);
        await writeLessons(lessons);
        return newLesson;
    } catch (error) {
        throw new Error('Failed to create the lesson:');
    }
};


export const AffectModuleToLessons = async (moduleId: number, lessonID: number): Promise<Modules | null> => {
    const moduleData = await readModules();
    const module = moduleData.find((module: Modules) => module.id === moduleId);

    if (!module) {
        return null;
    }
    if (!module.lessons) {
        module.lessons = [];
    }
    const isModuleAlreadyAssigned = module.lessons.find(lesson => lesson.id === lessonID);
    if (!isModuleAlreadyAssigned) {
        module.lessons.push({ id: lessonID });
    }

    await updateModule(module.id, module)
    return module;
};


export const deleteLesson = async (lessonId: number): Promise<boolean> => {
    const lessonsData = await readLessons(); 
    const updatedLessons = lessonsData.filter(lesson => lesson.id !== lessonId);

   
    await removeLessonFromModules(lessonId);

    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(LessonsFilePath, JSON.stringify({ lessons: updatedLessons }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
};


const ModulesFilePath = path.join('database/Modules.json');


export const removeLessonFromModules = async (lessonId: number): Promise<void> => {
    const modulesData = await readModules();

   
    modulesData.forEach(module => {
        if (module.lessons) {
            module.lessons = module.lessons.filter(lesson => lesson.id !== lessonId);
        }
    });

    return new Promise<void>((resolve, reject) => {
        fs.writeFile(ModulesFilePath, JSON.stringify({ modules: modulesData }, null, 2), (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};