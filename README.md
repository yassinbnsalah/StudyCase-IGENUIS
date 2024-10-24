
# ⭐ Express API Project ⭐
# ⭐ Project Overview
This project is an Express.js API that serves as a backend for managing courses, lessons, and modules. It supports creating, updating, reading, and deleting resources, along with assigning lessons to modules. The API also integrates with Swagger for API documentation and uses JSON Server for data persistence.


## ⭐ Features

- CRUD operations for Courses, Lessons, and Modules.
- Integration with Swagger for automatic API documentation.
- Error handling and validation for API requests.
- Modular structure to handle routes and controllers separately.
- Mocking and unit testing using Jest and Supertest.
- Lightweight and easy-to-extend data storage using JSON Server.

## ⭐ Technologies 
- Node.js: JavaScript runtime environment.
- Express.js: Fast, unopinionated, minimalist web framework for Node.js.
- TypeScript: Typed superset of JavaScript.
- JSON Server: Simple data storage using JSON files.
- Swagger: API documentation and exploration tool.
- Jest & Supertest: Testing framework for unit and integration tests.

## ⭐ Installation

Install StudyCase-IGENUIS  

```bash
    git clone https://github.com/yassinbnsalah/StudyCase-IGENUIS.git
    cd StudyCase-IGENUIS
```
Install dependencies:

```bash
    npm install
```

Run Server

```bash
    npm run dev
```

# ⭐ Usage
Swagger Documentation

Swagger is integrated into this project. You can access the API documentation by navigating to:
```bash
    http://localhost:3000/api-docs
```


# ⭐ API Endpoints

Below are some example routes and methods available in the API:

Courses

    GET /api/cours - Get all courses.
    POST /api/cours - Create a new course.
    GET /api/cours/:id - Get a specific course by ID.
    PUT /api/cours/:id - Update a specific course.
    DELETE /api/cours/:id - Delete a specific course.

Lessons

    GET /lessons - Get all lessons.
    POST /lessons/:id - Create a new lesson and assign it to a module.
    PUT /lessons/:id - Update a specific lesson.
    DELETE /lessons/:id - Delete a specific lesson.

Modules

    GET /api-modules/modules - Get all modules.
    POST /api-modules/modules/:id - Create a new module and assign it to a course
    GET /api-modules/modules/:id - Get a specific module by ID.
    PUT /api-modules/modules/:id - Update a specific module.
    DELETE /api-modules/modules/:id - Delete a specific module.


# ⭐ Tests
This project uses Jest for testing.

Run all tests:
```bash
    npm test

```

