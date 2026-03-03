# server API documentation

Base URL: https://api-phone-dream.onrender.com

This document summarizes the server routes implemented in `src/routes` and the controllers that handle them. It lists the available endpoints, expected request shapes, authentication requirements, and notes about file uploads.

## Common notes

- All routes in `src/routes` are mounted under the base path `/api` (see `server.ts`).
- Protected routes require a Bearer token in the `Authorization` header. The project issues JWTs (see `src/utils/utils.ts`).
- The server sets a `refreshToken` cookie (HTTP-only, secure) on signup/signin when those controllers are used.
- For multipart/form-data uploads the server uses multer (see `src/configs/multer.ts`).

## App (public) routes

These are mounted directly at `/api` (from `src/routes/app.route.ts`).

- GET /api/
  - Description: health / root endpoint. Returns plain text `hi`.
  - Auth: none

- GET /api/get-leaderboard
  - Description: Returns top users with xp, career, name and country.
  - Auth: none
  - Response: { message, users: [...] }

- GET /api/get-dream-boards
  - Description: Returns dream board entries.
  - Auth: none
  - Response: { message, dreamBoards: [...] }

- GET /api/get-recipients
  - Query: optionally `deviceType` to filter by need (e.g., `smartphone`).
  - Auth: none
  - Response: { message, filteredRecipients }

- GET /api/get-tasks
  - Description: Returns available tasks; marks tasks done for authenticated user if token provided.
  - Auth: optional (token influences `done` flag)

## Admin routes

Mounted at `/api/admin` and protected by `authenticateAdmin` middleware (`src/middlewares/auth.middleware.ts`). The admin routes currently mirror the same read endpoints as the public app routes:

- GET /api/admin/
- GET /api/admin/get-leaderboard
- GET /api/admin/get-dream-boards
- GET /api/admin/get-recipients
- GET /api/admin/get-tasks

Auth: Bearer token (admin token). Middleware will reject requests missing a valid `Authorization: Bearer <token>` header.

## Donor routes

Mounted at `/api/donor` and protected by `authenticateDonor` middleware.

- GET /api/donor/dashboard
  - Description: Get donor dashboard data (donor profile, cash donated, devices donated, recipients helped).
  - Auth: required (donor JWT)

- POST /api/donor/mint-badge
    - Body: `badgeId` (id of badge to mark as completed) and `tokenId` the tokenId gotten from the smart contract.
  - Auth: required (user JWT)

- GET /api/donor/profile/:id
  - Description: Public donor profile by id. Returns aggregated public fields and minted badges.
  - Auth: none

- PUT /api/donor/update-donor
  - Description: Update donor profile. Accepts multipart/form-data with optional `profilePic` file.
  - Body: multipart/form-data fields map to donor model fields. If a file is uploaded, multer exposes it as `req.file` and the controller will upload it and set `profilePic`.
  data: {
  
  }
  - Auth: required (donor JWT)

- POST /api/donor/create-donation
  - Description: Create a donation (device or cash). Uses multipart/form-data for images.
  - Body (multipart/form-data):
    - `section`: "device" or "cash" (determines validation)
    - For device donations expected fields validated by `validateDeviceDonationData` in `src/utils/utils.ts` (i.e. amount, frontImage, backImage, deviceVideo, willPayForRefurbish, condition ("new", "good condition", "refurbished"), deviceType ("smartphone", "tablet", "desktop pc", "other", "laptop", "monitor", "keyboard", "external drive", "printer"), specifications (optional), imeiNumber (optional), recipient (optional - the id of the recipient)).
    - File fields (as defined in route): `frontImage` (max 1), `backImage` (max 1). The controller reads these from `req.files`.
  - Auth: required (donor JWT)

## Recipient (user) routes

Mounted at `/api/recipient` and protected by `authenticateUser` middleware.

- GET /api/recipient/dashboard
  - Description: Fetch full user dashboard (profile, projects, awards, courses, employment history, events, recommendations, skills).
  - Auth: required (user JWT)

- GET /api/recipient/profile/:id
  - Description: Public user profile by id. Returns aggregated public fields and minted badges.
  - Auth: none

- POST /api/recipient/perform-task
  - Query: `taskId` (id of task to mark as completed)
  - Auth: required (user JWT)

- POST /api/recipient/mint-badge
    - Body: `badgeId` (id of badge to mark as completed) and `tokenId` the tokenId gotten from the smart contract.
  - Auth: required (user JWT)

- POST /api/recipient/create-dream-board
  - Body: JSON validated by `validateDreamBoardCreateData` (see `src/utils/utils.ts`). Required fields include: `fullName`, `state`, `country` (enum), `career`, `backgroundStory`, `recommendationLetter`, `careerStatus` (enum), `references` (array of at least 2 objects with name/contact/relationship), `goals` (array; min 3), `needs` (enum), optional `refurbished` boolean.
  - Auth: required

- POST /api/recipient/add-project
  - Body: JSON validated by `validateProjectData`: `projectName`, `description`, `techStack`, `wasDeviceDonated` (boolean), `projectFeatured` (boolean), `status` (enum), `urls` object with optional `github` and `liveUrl`.
  - Response: 201 Created on success
  - Auth: required

- POST /api/recipient/add-skill
  - Body validated by `validateSkillData`: `skillName`, `progress` (number), `category` (enum), `proficiencyLevel` (enum)
  - Auth: required

- POST /api/recipient/add-course
  - Body validated by `validateCourseData`: `courseName`, `provider`, `certificateUrl`, `status`, `progress`
  - Auth: required

- POST /api/recipient/add-event
  - Accepts multipart/form-data with optional `eventPic` file and fields validated by `validateEventData` (e.g., `eventName`, `date`, `location`, `category`, `description`, optional `skillsGained`).
  - Auth: required

- POST /api/recipient/add-recommendation
  - Body validated by `validateRecommendationData`: `text`, `quest`, optional `link`.
  - Auth: required

- POST /api/recipient/add-employment-history
  - Body validated by `validateEmploymentHistoryData`: `companyName`, `jobTitle`, `startDate`, `endDate`, `description`, `currentlyWorkThere` (boolean)
  - Auth: required

- POST /api/recipient/add-award
  - Body validated by `validateAwardData`: `awardName`, `issuingOrganization`, `dateReceived`, `description`, `awardLink`.
  - Auth: required

- DELETE /api/recipient/delete-profile
  - Description: Deletes the authenticated user's profile
  - Auth: required

- POST /api/recipient/update-user
  - Description: Update user profile. Accepts multipart/form-data with optional `profilePic` file.
  - Auth: required

## Authentication controllers 

- `src/controllers/auth.controller.ts` implements:
  - POST /api/auth/sign-up: validates body via `validateUserSignUpData` (expects `fullName`, `email`, `password`, `page`), creates a user or donor record depending on `page`, issues an access token and sets a refresh token cookie.
  - POST /api/auth/sig-in: expects `email`, `password`, `page`; validates credentials for `user` or `donor`, issues access token and sets refresh cookie.

## Headers and auth

- For protected endpoints include header: `Authorization: Bearer <accessToken>`.
- The server also sets a cookie `refreshToken` on signup/signin. That cookie is `httpOnly` and `secure`.

## Error handling

- Controllers use HTTP status codes defined in `src/utils/status.utils`. Typical error shapes are `{ error: "message" }`.

## Examples

- Sign in 
  ```ts
  POST /api/auth/sign-in

  Request JSON body:
  {
    "email": "alice@example.com",
    "password": "password123",
    "page": "user" // or "donor"
  }

  Successful response: 200
  {
    "message": "user signed in!",
    "accessToken": "<jwt>"
  }
  ```

- Create project (authenticated):
  ```ts
  POST /api/recipient/add-project
  Headers: Authorization: Bearer <token>
  Body JSON (example):

  {
    "projectName": "Portfolio site",
    "description": "A personal portfolio",
    "techStack": "React, Node",
    "wasDeviceDonated": false,
    "projectFeatured": false,
    "status": "in progress",
    "urls": { "github": "https://github.com/..." }
  }
  ```

---
