import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { DepartmentFormPage } from './pages/DepartmentFormPage'
import SettingsPage from './pages/SettingsPage'
import { AdminTasksPage } from './pages/AdminTasksPage'
import { UserTasksPage } from './pages/UserTasksPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />

            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<EmployeeFormPage />} />
            <Route path="/employees/edit/:id" element={<EmployeeFormPage />} />

            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/new" element={<DepartmentFormPage />} />
            <Route path="/departments/edit/:id" element={<DepartmentFormPage />} />

            <Route path="/settings" element={<SettingsPage />} />

            {/* Step 6 — Admin task management */}
            <Route path="/tasks" element={<AdminTasksPage />} />

            {/* Step 7 — User to-dos */}
            <Route path="/my-tasks" element={<UserTasksPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}