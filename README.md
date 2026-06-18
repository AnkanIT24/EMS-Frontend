# EMS Frontend — React + Vite

A responsive, role-aware frontend for an Employee Management System built with React 19 and Vite. Communicates with a Spring Boot REST API backend secured by JWT. Deployed on Vercel.

**Live URL:** `https://ems-frontend-efue.vercel.app`  
**Backend API:** `https://ems-backend-h422.onrender.com`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── assets/                        # Static images (profile photo, hero)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx     # Redirects unauthenticated users to /login
│   ├── departments/
│   │   ├── DepartmentList.jsx     # Searchable department table with edit/delete
│   │   └── DepartmentForm.jsx     # Create/edit department form
│   ├── employees/
│   │   ├── EmployeeList.jsx       # Searchable, paginated employee table
│   │   └── EmployeeForm.jsx       # Create/edit employee form with department dropdown
│   ├── layout/
│   │   ├── AppShell.jsx           # Main layout wrapper (sidebar + header + outlet)
│   │   ├── Sidebar.jsx            # Role-aware navigation (ADMIN vs USER nav items)
│   │   └── Header.jsx             # Top bar with user info
│   └── ui/
│       ├── Badge.jsx              # Colour-coded status/type badges
│       ├── Button.jsx             # Button with loading state and variants
│       ├── Card.jsx               # Card, CardHeader, CardBody
│       ├── ConfirmDialog.jsx      # Delete confirmation modal
│       ├── Input.jsx              # Labelled input with icon and error display
│       ├── Pagination.jsx         # Page navigation component
│       ├── Select.jsx             # Styled select dropdown
│       ├── Skeleton.jsx           # Loading skeleton placeholder
│       └── StatCard.jsx           # Animated metric card for dashboards
├── hooks/
│   └── AuthContext.jsx            # Auth state (user, login, logout, isAuthenticated)
├── lib/
│   └── utils.js                   # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── LoginPage.jsx              # Login form with validation
│   ├── RegisterPage.jsx           # Register form (role + department selection)
│   ├── DashboardPage.jsx          # Role-specific dashboard with stats
│   ├── EmployeesPage.jsx          # ADMIN: employee list page
│   ├── EmployeeFormPage.jsx       # ADMIN: add/edit employee page
│   ├── DepartmentsPage.jsx        # ADMIN: department list page
│   ├── DepartmentFormPage.jsx     # ADMIN: add/edit department page
│   ├── AdminTasksPage.jsx         # ADMIN: assign and manage tasks
│   ├── UserTasksPage.jsx          # USER: view and complete own tasks
│   └── SettingsPage.jsx           # Profile info + change password
├── services/
│   └── api.js                     # Axios instance + all service calls
├── App.jsx                        # Route definitions
└── main.jsx                       # App entry point with AuthProvider
```

---

## Routing

| Path | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | All authenticated |
| `/employees` | Employee List | ADMIN |
| `/employees/new` | Add Employee | ADMIN |
| `/employees/edit/:id` | Edit Employee | ADMIN |
| `/departments` | Department List | ADMIN |
| `/departments/new` | Add Department | ADMIN |
| `/departments/edit/:id` | Edit Department | ADMIN |
| `/tasks` | Assigned Tasks (admin view) | ADMIN |
| `/my-tasks` | My To-Dos (user view) | USER |
| `/settings` | Settings | All authenticated |

All routes under `/` are wrapped in `ProtectedRoute` — unauthenticated users are redirected to `/login` with the original path saved in location state.

---

## Auth Flow

1. User registers or logs in → receives `{ token, fullName, email, role }` from backend
2. `AuthContext.login()` calls `authService.saveSession()` → stores token in `localStorage` as `ems_token` and user info as `ems_user`
3. Every Axios request automatically attaches `Authorization: Bearer <token>` via a request interceptor
4. On any `401` response, the interceptor clears `localStorage` and redirects to `/login`
5. `AuthContext` reads from `localStorage` on page load — session persists across refreshes
6. `AuthContext.logout()` clears storage and resets user state

---

## API Service Layer

All backend communication is handled through `src/services/api.js`. The base URL is set once and all services use relative paths:

```js
const BASE_URL = 'https://ems-backend-h422.onrender.com/api'
```

### Available Services

```js
// Auth
authService.register(data)         // POST /auth/register
authService.login(data)            // POST /auth/login
authService.changePassword(data)   // PUT  /auth/change-password
authService.saveSession(response)  // saves token + user to localStorage
authService.clearSession()         // removes token + user from localStorage
authService.getUser()              // returns parsed user object
authService.isAuthenticated()      // returns Boolean

// Employees
employeeService.getAll()           // GET    /employees
employeeService.getById(id)        // GET    /employees/:id
employeeService.create(data)       // POST   /employees
employeeService.update(id, data)   // PUT    /employees/:id
employeeService.delete(id)         // DELETE /employees/:id

// Departments
departmentService.getAll()         // GET    /departments
departmentService.getById(id)      // GET    /departments/:id
departmentService.create(data)     // POST   /departments
departmentService.update(id, data) // PUT    /departments/:id
departmentService.delete(id)       // DELETE /departments/:id

// Tasks
taskService.createTask(data)                    // POST   /tasks
taskService.getAllTasks()                        // GET    /tasks/all
taskService.getMyTasks()                        // GET    /tasks/my
taskService.updateTask(taskId, data)            // PUT    /tasks/:taskId
taskService.deleteTask(taskId)                  // DELETE /tasks/:taskId
taskService.updateStatus(assignmentId, status)  // PUT    /tasks/:assignmentId/status

// Users
userService.getCurrentUser()       // GET /users/me
userService.updateName(data)       // PUT /users/me/name

// Settings
settingsService.get()              // GET /settings
settingsService.update(data)       // PUT /settings
```

---

## Role-Based UI

The sidebar and pages adapt based on the authenticated user's role stored in `AuthContext`.

**ADMIN sees:**
- Dashboard (employee + department stats)
- Employees (full CRUD)
- Departments (full CRUD)
- Assigned Tasks (create, assign, edit, delete tasks)
- Settings

**USER sees:**
- Dashboard (personal task stats + recent tasks)
- To-Dos (view and mark own tasks complete)
- Settings

The sidebar navigation is dynamically built from `adminNavItems` or `userNavItems` arrays in `Sidebar.jsx` based on `user.role`.

---

## Key Features

**Forms** use React Hook Form with Zod schema validation — all fields are validated client-side before any API call is made.

**Pagination** is handled client-side with a page size of 20 items per page.

**Search/Filter** on employee and department lists filters in real time against the locally loaded data.

**Animations** use Framer Motion for page transitions, list item entrances, and form field reveals.

**Toast notifications** (via Sonner) confirm all create, update, and delete operations, and display backend error messages on failure.

**Confirm dialogs** gate all delete operations with a modal before firing the API call.

**Loading states** — buttons show a spinner while async operations are in progress; lists show skeleton placeholders while data loads.

---

## Running Locally

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8080`

### Steps

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`.

Make sure `src/services/api.js` has:
```js
const BASE_URL = 'http://localhost:8080/api'
```

### Build for production
```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

The project includes a `vercel.json` at the root that rewrites all routes to `index.html`, enabling React Router to handle client-side navigation:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Without this, direct URL access to any route other than `/` returns a 404 from Vercel.

### Deploying

1. Push to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite — no build config needed
4. Set environment variable if using `.env`:
   ```
   VITE_API_URL=https://ems-backend-h422.onrender.com/api
   ```

---

## Environment Variables

For local development, create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

Then update `api.js`:
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
```

---

## Related

- **Backend Repository:** [Spring-Boot-Authentication](https://github.com/AnkanIT24/Spring-Boot-Authentication)
- **Live Backend:** `https://ems-backend-h422.onrender.com`
