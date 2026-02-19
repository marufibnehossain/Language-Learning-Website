// Data access layer: courses, units, lessons, exercises (DB-backed via Prisma)

import { prisma } from './prisma';
import type { Course, Lesson, Exercise } from './types';

// Legacy seed data (kept for reference, now seeded via prisma/seed.ts)
const _legacySeedData: Course = {
  id: 'course_spanish_101',
  title: 'Spanish for Beginners',
  description: 'Learn the basics of Spanish',
  language: 'Spanish',
  units: [
    {
      id: 'unit_1',
      title: 'Unit 1: Greetings & Basics',
      description: 'Learn how to greet people and introduce yourself',
      courseId: 'course_spanish_101',
      order: 1,
      lessons: [
        {
          id: 'lesson_1_1',
          title: 'Greetings',
          description: 'Learn basic greetings',
          unitId: 'unit_1',
          order: 1,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_1_1_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Good morning',
              options: ['Buenos días', 'Buenas noches', 'Gracias', 'Por favor'],
              answer: 'Buenos días',
              explanation: "'Buenos días' is used in the morning.",
            },
            {
              id: 'ex_1_1_2',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Hello',
              options: ['Hola', 'Adiós', 'Gracias', 'De nada'],
              answer: 'Hola',
              explanation: "'Hola' means hello in Spanish.",
            },
            {
              id: 'ex_1_1_3',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '___ días (Good morning)',
              answer: 'Buenos',
              explanation: "'Buenos días' means good morning.",
            },
            {
              id: 'ex_1_1_4',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Goodbye',
              options: ['Hola', 'Adiós', 'Buenos días', 'Gracias'],
              answer: 'Adiós',
              explanation: "'Adiós' means goodbye.",
            },
            {
              id: 'ex_1_1_5',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '¿Cómo estás? (How are ___)',
              answer: 'you',
              explanation: "'¿Cómo estás?' means 'How are you?'",
            },
            {
              id: 'ex_1_1_6',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Thank you',
              options: ['Por favor', 'Gracias', 'De nada', 'Hola'],
              answer: 'Gracias',
              explanation: "'Gracias' means thank you.",
            },
            {
              id: 'ex_1_1_7',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Mucho ___ (Nice to meet you)',
              answer: 'gusto',
              explanation: "'Mucho gusto' means nice to meet you.",
            },
            {
              id: 'ex_1_1_8',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Please',
              options: ['Gracias', 'Por favor', 'De nada', 'Adiós'],
              answer: 'Por favor',
              explanation: "'Por favor' means please.",
            },
          ],
        },
        {
          id: 'lesson_1_2',
          title: 'Introductions',
          description: 'Learn how to introduce yourself',
          unitId: 'unit_1',
          order: 2,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_1_2_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'My name is',
              options: ['Me llamo', 'Te llamas', 'Se llama', 'Nos llamamos'],
              answer: 'Me llamo',
              explanation: "'Me llamo' means 'My name is'.",
            },
            {
              id: 'ex_1_2_2',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Me ___ Juan (My name is Juan)',
              answer: 'llamo',
              explanation: "'Me llamo' means 'My name is'.",
            },
            {
              id: 'ex_1_2_3',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'What is your name?',
              options: ['¿Cómo te llamas?', '¿Cómo estás?', '¿Qué tal?', '¿De dónde eres?'],
              answer: '¿Cómo te llamas?',
              explanation: "'¿Cómo te llamas?' means 'What is your name?'",
            },
            {
              id: 'ex_1_2_4',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Soy de ___ (I am from)',
              answer: 'España',
              explanation: "'Soy de' means 'I am from'. España is Spain.",
            },
            {
              id: 'ex_1_2_5',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Where are you from?',
              options: ['¿De dónde eres?', '¿Dónde vives?', '¿Cómo estás?', '¿Qué tal?'],
              answer: '¿De dónde eres?',
              explanation: "'¿De dónde eres?' means 'Where are you from?'",
            },
            {
              id: 'ex_1_2_6',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Tengo ___ años (I am ___ years old)',
              answer: 'veinte',
              explanation: "'Tengo' means 'I have'. 'Tengo veinte años' means 'I am twenty years old'.",
            },
            {
              id: 'ex_1_2_7',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Nice to meet you',
              options: ['Mucho gusto', 'Hasta luego', 'Buenos días', 'Gracias'],
              answer: 'Mucho gusto',
              explanation: "'Mucho gusto' means 'Nice to meet you'.",
            },
            {
              id: 'ex_1_2_8',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Encantado de ___ (Pleased to meet you)',
              answer: 'conocerte',
              explanation: "'Encantado de conocerte' means 'Pleased to meet you'.",
            },
          ],
        },
        {
          id: 'lesson_1_3',
          title: 'Numbers 1-10',
          description: 'Learn numbers from one to ten',
          unitId: 'unit_1',
          order: 3,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_1_3_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'One',
              options: ['Uno', 'Dos', 'Tres', 'Cuatro'],
              answer: 'Uno',
            },
            {
              id: 'ex_1_3_2',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Five',
              options: ['Cuatro', 'Cinco', 'Seis', 'Siete'],
              answer: 'Cinco',
            },
            {
              id: 'ex_1_3_3',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Tres más dos es ___ (Three plus two is five)',
              answer: 'cinco',
            },
            {
              id: 'ex_1_3_4',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Ten',
              options: ['Ocho', 'Nueve', 'Diez', 'Once'],
              answer: 'Diez',
            },
            {
              id: 'ex_1_3_5',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Siete menos dos es ___ (Seven minus two is five)',
              answer: 'cinco',
            },
            {
              id: 'ex_1_3_6',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Eight',
              options: ['Seis', 'Siete', 'Ocho', 'Nueve'],
              answer: 'Ocho',
            },
            {
              id: 'ex_1_3_7',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Dos por cuatro es ___ (Two times four is eight)',
              answer: 'ocho',
            },
            {
              id: 'ex_1_3_8',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Nine',
              options: ['Siete', 'Ocho', 'Nueve', 'Diez'],
              answer: 'Nueve',
            },
          ],
        },
        {
          id: 'lesson_1_4',
          title: 'Common Phrases',
          description: 'Learn common everyday phrases',
          unitId: 'unit_1',
          order: 4,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_1_4_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'How are you?',
              options: ['¿Cómo estás?', '¿Qué tal?', '¿Cómo te llamas?', '¿De dónde eres?'],
              answer: '¿Cómo estás?',
            },
            {
              id: 'ex_1_4_2',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Estoy ___ (I am fine)',
              answer: 'bien',
            },
            {
              id: 'ex_1_4_3',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Excuse me',
              options: ['Perdón', 'Gracias', 'Por favor', 'De nada'],
              answer: 'Perdón',
            },
            {
              id: 'ex_1_4_4',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Lo ___ (I am sorry)',
              answer: 'siento',
            },
            {
              id: 'ex_1_4_5',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: "You're welcome",
              options: ['Gracias', 'De nada', 'Por favor', 'Perdón'],
              answer: 'De nada',
            },
            {
              id: 'ex_1_4_6',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'No hay de ___ (You are welcome)',
              answer: 'qué',
            },
            {
              id: 'ex_1_4_7',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'See you later',
              options: ['Hasta luego', 'Hasta mañana', 'Adiós', 'Nos vemos'],
              answer: 'Hasta luego',
            },
            {
              id: 'ex_1_4_8',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Hasta ___ (See you tomorrow)',
              answer: 'mañana',
            },
          ],
        },
        {
          id: 'lesson_1_5',
          title: 'Practice: Review',
          description: 'Review what you learned',
          unitId: 'unit_1',
          order: 5,
          xpReward: 20,
          type: 'practice',
          exercises: [
            {
              id: 'ex_1_5_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Good morning',
              options: ['Buenos días', 'Buenas noches', 'Buenas tardes', 'Hola'],
              answer: 'Buenos días',
            },
            {
              id: 'ex_1_5_2',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Me ___ María (My name is María)',
              answer: 'llamo',
            },
            {
              id: 'ex_1_5_3',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Thank you very much',
              options: ['Muchas gracias', 'De nada', 'Por favor', 'Perdón'],
              answer: 'Muchas gracias',
            },
            {
              id: 'ex_1_5_4',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '¿Cómo ___? (How are you?)',
              answer: 'estás',
            },
            {
              id: 'ex_1_5_5',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Nice to meet you',
              options: ['Mucho gusto', 'Hasta luego', 'Buenos días', 'Gracias'],
              answer: 'Mucho gusto',
            },
            {
              id: 'ex_1_5_6',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Soy de ___ (I am from Mexico)',
              answer: 'México',
            },
            {
              id: 'ex_1_5_7',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'See you later',
              options: ['Hasta luego', 'Hasta mañana', 'Adiós', 'Nos vemos'],
              answer: 'Hasta luego',
            },
            {
              id: 'ex_1_5_8',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Tengo ___ años (I am twenty years old)',
              answer: 'veinte',
            },
          ],
        },
      ],
    },
    {
      id: 'unit_2',
      title: 'Unit 2: Food & Drinks',
      description: 'Learn vocabulary for food and drinks',
      courseId: 'course_spanish_101',
      order: 2,
      lessons: [
        {
          id: 'lesson_2_1',
          title: 'Food Basics',
          description: 'Learn basic food vocabulary',
          unitId: 'unit_2',
          order: 1,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_2_1_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Bread',
              options: ['Pan', 'Agua', 'Leche', 'Queso'],
              answer: 'Pan',
            },
            {
              id: 'ex_2_1_2',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Water',
              options: ['Pan', 'Agua', 'Leche', 'Queso'],
              answer: 'Agua',
            },
            {
              id: 'ex_2_1_3',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Quiero ___ (I want bread)',
              answer: 'pan',
            },
            {
              id: 'ex_2_1_4',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Milk',
              options: ['Pan', 'Agua', 'Leche', 'Queso'],
              answer: 'Leche',
            },
            {
              id: 'ex_2_1_5',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Necesito ___ (I need water)',
              answer: 'agua',
            },
            {
              id: 'ex_2_1_6',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Cheese',
              options: ['Pan', 'Agua', 'Leche', 'Queso'],
              answer: 'Queso',
            },
            {
              id: 'ex_2_1_7',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Me gusta el ___ (I like cheese)',
              answer: 'queso',
            },
            {
              id: 'ex_2_1_8',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Egg',
              options: ['Huevo', 'Carne', 'Pescado', 'Pollo'],
              answer: 'Huevo',
            },
          ],
        },
        {
          id: 'lesson_2_2',
          title: 'Fruits & Vegetables',
          description: 'Learn fruits and vegetables',
          unitId: 'unit_2',
          order: 2,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_2_2_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Apple',
              options: ['Manzana', 'Plátano', 'Naranja', 'Uva'],
              answer: 'Manzana',
            },
            {
              id: 'ex_2_2_2',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Banana',
              options: ['Manzana', 'Plátano', 'Naranja', 'Uva'],
              answer: 'Plátano',
            },
            {
              id: 'ex_2_2_3',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Me gusta la ___ (I like the apple)',
              answer: 'manzana',
            },
            {
              id: 'ex_2_2_4',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Orange',
              options: ['Manzana', 'Plátano', 'Naranja', 'Uva'],
              answer: 'Naranja',
            },
            {
              id: 'ex_2_2_5',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Quiero un ___ (I want a banana)',
              answer: 'plátano',
            },
            {
              id: 'ex_2_2_6',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Tomato',
              options: ['Tomate', 'Lechuga', 'Zanahoria', 'Papa'],
              answer: 'Tomate',
            },
            {
              id: 'ex_2_2_7',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Necesito ___ (I need tomatoes)',
              answer: 'tomates',
            },
            {
              id: 'ex_2_2_8',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Carrot',
              options: ['Tomate', 'Lechuga', 'Zanahoria', 'Papa'],
              answer: 'Zanahoria',
            },
          ],
        },
        {
          id: 'lesson_2_3',
          title: 'Meals',
          description: 'Learn meal vocabulary',
          unitId: 'unit_2',
          order: 3,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_2_3_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Breakfast',
              options: ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'],
              answer: 'Desayuno',
            },
            {
              id: 'ex_2_3_2',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Lunch',
              options: ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'],
              answer: 'Almuerzo',
            },
            {
              id: 'ex_2_3_3',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Voy a ___ (I am going to breakfast)',
              answer: 'desayunar',
            },
            {
              id: 'ex_2_3_4',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Dinner',
              options: ['Desayuno', 'Almuerzo', 'Cena', 'Merienda'],
              answer: 'Cena',
            },
            {
              id: 'ex_2_3_5',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '¿Qué quieres para el ___? (What do you want for lunch?)',
              answer: 'almuerzo',
            },
            {
              id: 'ex_2_3_6',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'I am hungry',
              options: ['Tengo hambre', 'Tengo sed', 'Tengo frío', 'Tengo calor'],
              answer: 'Tengo hambre',
            },
            {
              id: 'ex_2_3_7',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Tengo ___ (I am thirsty)',
              answer: 'sed',
            },
            {
              id: 'ex_2_3_8',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'I want to eat',
              options: ['Quiero comer', 'Quiero beber', 'Quiero dormir', 'Quiero estudiar'],
              answer: 'Quiero comer',
            },
          ],
        },
        {
          id: 'lesson_2_4',
          title: 'Ordering Food',
          description: 'Learn how to order food',
          unitId: 'unit_2',
          order: 4,
          xpReward: 20,
          exercises: [
            {
              id: 'ex_2_4_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'I would like',
              options: ['Quisiera', 'Quiero', 'Necesito', 'Tengo'],
              answer: 'Quisiera',
            },
            {
              id: 'ex_2_4_2',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '___ un café, por favor (I would like a coffee, please)',
              answer: 'Quisiera',
            },
            {
              id: 'ex_2_4_3',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'The check, please',
              options: ['La cuenta, por favor', 'El menú, por favor', 'La mesa, por favor', 'El plato, por favor'],
              answer: 'La cuenta, por favor',
            },
            {
              id: 'ex_2_4_4',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '¿Me puede traer el ___? (Can you bring me the menu?)',
              answer: 'menú',
            },
            {
              id: 'ex_2_4_5',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Table',
              options: ['Mesa', 'Silla', 'Plato', 'Vaso'],
              answer: 'Mesa',
            },
            {
              id: 'ex_2_4_6',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Una ___ para dos, por favor (A table for two, please)',
              answer: 'mesa',
            },
            {
              id: 'ex_2_4_7',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Delicious',
              options: ['Delicioso', 'Rico', 'Bueno', 'Mal'],
              answer: 'Delicioso',
            },
            {
              id: 'ex_2_4_8',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Está muy ___ (It is very delicious)',
              answer: 'rico',
            },
          ],
        },
        {
          id: 'lesson_2_5',
          title: 'Practice: Review',
          description: 'Review food vocabulary',
          unitId: 'unit_2',
          order: 5,
          xpReward: 20,
          type: 'practice',
          exercises: [
            {
              id: 'ex_2_5_1',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Bread',
              options: ['Pan', 'Agua', 'Leche', 'Queso'],
              answer: 'Pan',
            },
            {
              id: 'ex_2_5_2',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Quiero ___ (I want water)',
              answer: 'agua',
            },
            {
              id: 'ex_2_5_3',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'Apple',
              options: ['Manzana', 'Plátano', 'Naranja', 'Uva'],
              answer: 'Manzana',
            },
            {
              id: 'ex_2_5_4',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Me gusta el ___ (I like breakfast)',
              answer: 'desayuno',
            },
            {
              id: 'ex_2_5_5',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'I am hungry',
              options: ['Tengo hambre', 'Tengo sed', 'Tengo frío', 'Tengo calor'],
              answer: 'Tengo hambre',
            },
            {
              id: 'ex_2_5_6',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: '___ un café, por favor (I would like a coffee, please)',
              answer: 'Quisiera',
            },
            {
              id: 'ex_2_5_7',
              type: 'mcq',
              prompt: 'Choose the correct translation:',
              question: 'The check, please',
              options: ['La cuenta, por favor', 'El menú, por favor', 'La mesa, por favor', 'El plato, por favor'],
              answer: 'La cuenta, por favor',
            },
            {
              id: 'ex_2_5_8',
              type: 'fill_blank',
              prompt: 'Complete the sentence:',
              question: 'Está muy ___ (It is very delicious)',
              answer: 'rico',
            },
          ],
        },
      ],
    },
  ],
};

export type CourseListItem = {
  id: string;
  title: string;
  description: string;
  language: string;
};

/**
 * Get list of courses (for language grid)
 */
export async function getCourses(): Promise<CourseListItem[]> {
  try {
    const res = await fetch('/api/courses', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Get full course by ID (for learning path)
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const res = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get first course (legacy – prefer getCourseById for a specific course)
 */
export async function getCourse(): Promise<Course | null> {
  const list = await getCourses();
  if (list.length === 0) return null;
  return getCourseById(list[0].id);
}

/**
 * Get lesson by ID (from API)
 */
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const res = await fetch(`/api/lessons/${lessonId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get next lesson ID (from API)
 */
export async function getNextLessonId(currentLessonId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/lessons/${currentLessonId}/next`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.nextLessonId || null;
  } catch {
    return null;
  }
}
