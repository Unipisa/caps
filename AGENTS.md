# CAPS Application Structure

This document describes the structure of the CAPS (Curriculum and Proposal System) application, which is a CakePHP-based system for managing study proposals and form submissions.

## Overview

CAPS is a web application that allows students to submit study proposals and for secretaries to evaluate them. It also handles submission of generic forms. The application has two main interfaces:
- User-facing interface built with React
- Administration interface built with CakePHP's classical MVC pattern

## Project Structure

```
.
├── backend/                 # CakePHP backend application
│   ├── src/                 # Source code
│   │   ├── Controller/      # MVC Controllers
│   │   ├── Model/           # MVC Models (Entities and Tables)
│   │   ├── View/            # MVC Views
│   │   ├── Form/            # Form classes
│   │   ├── Authentication/  # Authentication components
│   │   ├── Command/         # CLI commands
│   │   └── Utility/         # Utility classes
│   ├── templates/           # View templates
│   ├── config/              # Configuration files
│   ├── webroot/             # Web root directory
│   └── tests/               # Test files
├── frontend/                # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── controllers/     # Controller logic
│   │   ├── modules/         # Utility modules
│   │   └── ...
│   ├── scss/                # Stylesheets
│   └── ...
├── docker/                  # Docker configuration
├── scripts/                 # Utility scripts
└── docs/                    # Documentation

## Backend Components

### Controllers
The backend uses CakePHP's MVC pattern with controllers handling HTTP requests and responses. Key controllers include:
- Api/v1/ - API controllers for the APIs (used by React frontend)
- ProposalsController.php - Controller for study proposal management
- FormsController.php - Controller for form submissions
- UsersController.php - Controller for user management
- DegreesController.php - Controller for degree management
- CurriculaController.php - Controller for curriculum management
- ExamsController.php - Controller for exam management

### Models
The application uses CakePHP's ORM with entities and tables:
- Entities: Represent individual records (User, Proposal, Form, Exam, etc.)
- Tables: Handle database operations for entities
- Behaviors: Additional functionality for models

### Forms
Form classes are used for validation and data handling:
- FormsFilterForm.php - Filter forms for data retrieval
- Various entity-specific forms

### Authentication
- AdminTokenAuthenticator.php - Authentication for admin tokens
- UnipiAuthenticate.php - Authentication for UNIPI LDAP

### Commands
- GrantAdminCommand.php - CLI command for granting admin privileges

## Frontend Components

The frontend is built with React and includes:
- Components for UI elements (Attachment, ProposalEdit, Dashboard, etc.)
- Controllers for managing application logic
- Modules for utility functions (API calls, date handling, etc.)
- SCSS stylesheets for styling

## Data Models

The application manages several key entities:
- Users: Student and administrator accounts
- Proposals: Study plan proposals submitted by students
- Forms: Generic form submissions
- Degrees: Academic degrees
- Curricula: Academic curricula
- Exams: Academic exams
- Groups: Exam groups
- Attachments: File attachments
- Documents: Document storage
- Settings: Application settings
- Logs: System logs

## API Endpoints

The application exposes RESTful API endpoints through the Api/v1/ controllers:
- /api/v1/forms - Manage form submissions
- /api/v1/proposals - Manage study proposals
- /api/v1/degrees - Manage academic degrees
- /api/v1/curricula - Manage curricula
- /api/v1/exams - Manage exams
- /api/v1/users - Manage users
- /api/v1/documents - Manage documents
- /api/v1/form-templates - Manage form templates
- /api/v1/groups - Manage exam groups
- /api/v1/logs - Manage system logs

## API Authentication

The application supports administrative token authentication. If the instance configures `CAPS_ADMIN_TOKEN` and `CAPS_ADMIN_TOKEN_USER`, all APIs can be invoked with administrative privileges by passing the token in the HTTP header `Authorization`:

```http
Authorization: Bearer <CAPS_ADMIN_TOKEN>
```

`CAPS_ADMIN_TOKEN_USER` must be the username of an existing user in the database. The user is used to attribute operations, logs, and records created; administrative privileges are applied only to the token-authenticated request. The token is not accepted in the query string and must be used exclusively via HTTPS.

## API Methods

API controllers in `backend/src/Controller/Api/v1/` support HTTP methods GET, POST, PATCH, and DELETE. Not all endpoints are implemented yet. Examples include:
* `GET /proposals/?user_id=996&limit=10&offset=20` returns a paginated version of proposals
* `DELETE /proposals/1800` deletes the proposal with id=1800
* `GET /forms` returns all forms in the system
* `POST /forms` creates a new form based on the JSON payload passed (not implemented)
* `PATCH /forms/45` updates a form based on the new JSON payload passed

Most PUT and POST methods are not yet implemented.

## API Response Format

Data is returned inside a `data` field of the JSON response, which also contains `code` and `message` fields - respectively the HTTP code (also returned as HTTP code by the method) and an optional success or error message.

Examples:
```
GET /proposals/?user=996&_limit=1

{
  "data": [
    {
      "id": 1846,
      "user_id": 996,
      "modified": "2022-02-24T08:41:46+00:00",
      "curriculum_id": 95,
      "state": "submitted",
      "submitted_date": "2022-02-24T08:41:46+00:00",
      "approved_date": null,
      "auths": [],
      "attachments": [],
      "curriculum": {
        [...]
      }
    }
  ],
  "code": 200,
  "message": "OK"
}
```

```
DELETE /api/v1/forms/23

{ 
  "data": null,
  "code": 200,
  "message": "OK"
}
```

```
GET /api/v1/proposals/1823

{
  "data": null,
  "code": 404,
  "message": "Proposal not found"
}
```

## Configuration

The application uses CakePHP's configuration system with:
- config/app.php - Main application configuration
- config/bootstrap.php - Bootstrap configuration
- Various migration files for database schema management

## Database Schema

The application uses a relational database with the following main entities:
- Attachment [attachments]
- ChosenExam [chosen_exams]
- ChosenFreeChoiceExam [chosen_free_choice_exams]
- CompulsoryExam [compulsory_exams]
- CompulsoryGroup [compulsory_groups]
- Curriculum [curricula]
- Degree [degrees]
- Documents
- Exam [exams]
- FreeChoiceExam [free_choice_exams]
- Form [forms]
- FormAttachment [form_attachments]
- FormTemplate [form_templates]
- Group [groups]
- ProposalAuth [proposal_auths]
- Proposal
- Settings [settings]
- Tag [tags]
