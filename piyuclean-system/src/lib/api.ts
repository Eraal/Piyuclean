// Simple API client for the Flask backend
export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: 'Administrator' | 'Teacher' | 'Class Adviser';
  lastLogin?: string | null;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  classSection: string;
  status: 'active' | 'inactive';
}

export interface Classroom {
  id: string;
  classroomId: string;
  name: string;
  description: string;
}

export interface CleaningTask {
  id: string;
  name: string;
  description: string;
}

export interface Checklist {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
}

export interface TaskAssignment {
  id: string;
  date: string;
  classroomId: string;
  studentIds: string[];
  checklistId: string;
  status: 'assigned' | 'completed' | 'pending' | 'overdue';
  completedAt?: string | null;
  comments?: string | null;
}

export interface AssignmentExpanded {
  id: string;
  assignmentId: string;
  date: string;
  classroomId: string;
  classroomName: string;
  studentId: string;
  studentName: string;
  taskId: string;
  taskName: string;
  status: 'assigned' | 'completed' | 'pending' | 'overdue';
  completedAt?: string | null;
  comments?: string | null;
}

// Reports
export interface WeeklySummaryDay {
  date: string; // YYYY-MM-DD
  assigned: number;
  pending: number;
  completed: number;
  overdue: number;
}

export interface WeeklySummaryResponse {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  days: WeeklySummaryDay[];
}

export interface StudentPerformanceItem {
  id: string; // student ext or numeric id
  studentId: string;
  name: string;
  classSection: string;
  assigned: number;
  completed: number;
  overdue: number;
  completionRate: number; // 0..1
}

export interface StudentPerformanceResponse {
  start: string;
  end: string;
  students: StudentPerformanceItem[];
}

const API_BASE = '/api';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as unknown as T) : res.json();
}

// Auth
export async function login(username: string, password: string): Promise<AdminUser> {
  return http<AdminUser>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}
export async function studentLogin(studentId: string, password: string): Promise<Student & { role: 'Student' } > {
  const s = await http<Student & { role: 'Student' }>('/auth/student-login', { method: 'POST', body: JSON.stringify({ studentId, password }) });
  return s;
}

// Students
export const getStudents = () => http<Student[]>('/students/');
export const createStudent = (s: Omit<Student, 'id'> & { id?: string; password?: string }) =>
  http<{ id: string }>('/students/', { method: 'POST', body: JSON.stringify(s) });
export const updateStudent = (id: string, s: Partial<Student> & { password?: string }) =>
  http<{ id: string }>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(s) });
export const deleteStudent = (id: string) => http('/students/' + id, { method: 'DELETE' });

// Classrooms
export const getClassrooms = () => http<Classroom[]>('/classrooms/');
export const createClassroom = (c: Omit<Classroom, 'id'> & { id?: string }) =>
  http<{ id: string }>('/classrooms/', { method: 'POST', body: JSON.stringify(c) });
export const updateClassroom = (id: string, c: Partial<Classroom>) =>
  http<{ id: string }>(`/classrooms/${id}`, { method: 'PUT', body: JSON.stringify(c) });
export const deleteClassroom = (id: string) => http('/classrooms/' + id, { method: 'DELETE' });

// Tasks
export const getTasks = () => http<CleaningTask[]>('/tasks/');
export const createTask = (t: Omit<CleaningTask, 'id'> & { id?: string }) =>
  http<{ id: string }>('/tasks/', { method: 'POST', body: JSON.stringify(t) });
export const updateTask = (id: string, t: Partial<CleaningTask>) =>
  http<{ id: string }>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(t) });
export const deleteTask = (id: string) => http('/tasks/' + id, { method: 'DELETE' });

// Checklists
export const getChecklists = () => http<Checklist[]>('/checklists/');
export const createChecklist = (c: Omit<Checklist, 'id'> & { id?: string }) =>
  http<{ id: string }>('/checklists/', { method: 'POST', body: JSON.stringify(c) });
export const updateChecklist = (id: string, c: Partial<Checklist>) =>
  http<{ id: string }>(`/checklists/${id}`, { method: 'PUT', body: JSON.stringify(c) });
export const deleteChecklist = (id: string) => http('/checklists/' + id, { method: 'DELETE' });

// Assignments (raw + expanded)
export const getAssignmentsRaw = () => http<TaskAssignment[]>('/assignments/');
export const createAssignment = (a: Omit<TaskAssignment, 'id'> & { id?: string }) =>
  http<{ id: string }>('/assignments/', { method: 'POST', body: JSON.stringify(a) });
export const updateAssignmentRaw = (id: string, a: Partial<TaskAssignment>) =>
  http<{ id: string }>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(a) });
export const deleteAssignmentRaw = (id: string) => http('/assignments/' + id, { method: 'DELETE' });
export const getAssignmentsExpanded = () => http<AssignmentExpanded[]>('/assignments/expanded');

// Reports
export const getWeeklySummary = (start?: string, end?: string) =>
  http<WeeklySummaryResponse>(`/reports/weekly-summary${start && end ? `?start=${start}&end=${end}` : ''}`);

export const getStudentPerformance = (start?: string, end?: string) =>
  http<StudentPerformanceResponse>(`/reports/student-performance${start && end ? `?start=${start}&end=${end}` : ''}`);

// Admin Users
export const getAdminUsers = () => http<AdminUser[]>('/admin-users/');
export const createAdminUser = (u: {
  id?: string;
  username: string;
  password: string;
  fullName: string;
  role: AdminUser['role'];
  status?: 'active' | 'inactive';
}) => http<{ id: string }>('/admin-users/', { method: 'POST', body: JSON.stringify(u) });
export const updateAdminUser = (
  id: string,
  u: Partial<{
    username: string;
    password: string;
    fullName: string;
    role: AdminUser['role'];
    status: 'active' | 'inactive';
  }>
) => http<{ id: string }>(`/admin-users/${id}`, { method: 'PUT', body: JSON.stringify(u) });
export const deleteAdminUser = (id: string) => http(`/admin-users/${id}`, { method: 'DELETE' });
