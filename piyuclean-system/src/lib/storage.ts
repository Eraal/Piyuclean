// Local storage service for offline data persistence

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'Administrator' | 'Teacher' | 'Class Adviser';
  lastLogin?: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  classSection: string;
  status: 'active' | 'inactive';
  password?: string; // For student login
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
  completedAt?: string;
  comments?: string;
}

// Extended Assignment interface for individual student tasks
export interface Assignment {
  id: string;
  date: string;
  classroomId: string;
  classroomName: string;
  studentId: string;
  studentName: string;
  taskId: string;
  taskName: string;
  status: 'assigned' | 'completed' | 'pending' | 'overdue';
  completedAt?: string;
  comments?: string;
}

const STORAGE_KEYS = {
  ADMIN_USERS: 'ccms_admin_users',
  STUDENTS: 'ccms_students',
  CLASSROOMS: 'ccms_classrooms',
  TASKS: 'ccms_tasks',
  CHECKLISTS: 'ccms_checklists',
  ASSIGNMENTS: 'ccms_assignments',
  CURRENT_USER: 'ccms_current_user',
};

// Initialize default admin user and test student
const initializeDefaultAdmin = () => {
  const users = getAdminUsers();
  if (users.length === 0) {
    const defaultAdmin: AdminUser = {
      id: '1',
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      fullName: 'System Administrator',
      role: 'Administrator',
      status: 'active',
    };
    setItem(STORAGE_KEYS.ADMIN_USERS, [defaultAdmin]);
  }
  
  // Initialize test students
  const students = getStudents();
  if (students.length === 0) {
    const testStudents: Student[] = [
      {
        id: 'student-1',
        studentId: 'student',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        classSection: 'BSIT 1A',
        status: 'active',
        password: 'student123',
      },
      {
        id: 'student-2',
        studentId: '2024001',
        firstName: 'Maria',
        lastName: 'Santos',
        classSection: 'BSIT 1B',
        status: 'active',
        password: 'student123',
      },
      {
        id: 'student-3',
        studentId: '2024002',
        firstName: 'John',
        lastName: 'Smith',
        classSection: 'BSIT 2A',
        status: 'active',
        password: 'student123',
      },
      {
        id: 'student-4',
        studentId: '2024003',
        firstName: 'Ana',
        lastName: 'Garcia',
        classSection: 'BSIT 3A AMG',
        status: 'active',
        password: 'student123',
      },
      {
        id: 'student-5',
        studentId: '2024004',
        firstName: 'Carlos',
        lastName: 'Lopez',
        classSection: 'BSIT 4D NETAD',
        status: 'active',
        password: 'student123',
      },
    ];
    setItem(STORAGE_KEYS.STUDENTS, testStudents);
  }
  
  // Initialize sample classrooms
  const classrooms = getClassrooms();
  if (classrooms.length === 0) {
    const sampleClassrooms: Classroom[] = [
      {
        id: 'classroom-1',
        classroomId: 'ROOM-101',
        name: 'Computer Lab 1',
        description: 'Main computer laboratory',
      },
      {
        id: 'classroom-2',
        classroomId: 'ROOM-102',
        name: 'Computer Lab 2',
        description: 'Secondary computer laboratory',
      },
      {
        id: 'classroom-3',
        classroomId: 'ROOM-201',
        name: 'Lecture Hall A',
        description: 'Large lecture hall for presentations',
      },
    ];
    setItem(STORAGE_KEYS.CLASSROOMS, sampleClassrooms);
  }
  
  // Initialize sample tasks
  const tasks = getTasks();
  if (tasks.length === 0) {
    const sampleTasks: CleaningTask[] = [
      {
        id: 'task-1',
        name: 'Sweep the floor',
        description: 'Clean and sweep the entire floor area',
      },
      {
        id: 'task-2',
        name: 'Arrange chairs',
        description: 'Organize chairs in proper rows',
      },
      {
        id: 'task-3',
        name: 'Clean whiteboard',
        description: 'Wipe and clean the whiteboard',
      },
      {
        id: 'task-4',
        name: 'Empty trash bins',
        description: 'Remove and replace trash bag liners',
      },
    ];
    setItem(STORAGE_KEYS.TASKS, sampleTasks);
  }
  
  // Initialize sample checklists
  const checklists = getChecklists();
  if (checklists.length === 0) {
    const sampleChecklists: Checklist[] = [
      {
        id: 'checklist-1',
        name: 'Daily Classroom Cleaning',
        description: 'Basic daily cleaning tasks for classrooms',
        taskIds: ['task-1', 'task-2', 'task-3'],
      },
      {
        id: 'checklist-2',
        name: 'Weekly Deep Clean',
        description: 'Comprehensive weekly cleaning tasks',
        taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
      },
    ];
    setItem(STORAGE_KEYS.CHECKLISTS, sampleChecklists);
  }
};

// Generic storage helpers
const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Admin Users
export const getAdminUsers = (): AdminUser[] => {
  return getItem<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS) || [];
};

export const saveAdminUser = (user: AdminUser): void => {
  const users = getAdminUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setItem(STORAGE_KEYS.ADMIN_USERS, users);
};

export const deleteAdminUser = (id: string): void => {
  const users = getAdminUsers().filter((u) => u.id !== id);
  setItem(STORAGE_KEYS.ADMIN_USERS, users);
};

// Authentication
export const login = (username: string, password: string): AdminUser | null => {
  const users = getAdminUsers();
  const user = users.find((u) => u.username === username && u.password === password && u.status === 'active');
  if (user) {
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    saveAdminUser(updatedUser);
    setItem(STORAGE_KEYS.CURRENT_USER, updatedUser);
    return updatedUser;
  }
  return null;
};

// Student Authentication
export const studentLogin = (studentId: string, password: string): Student | null => {
  const students = getStudents();
  const student = students.find(
    (s) => s.studentId === studentId && s.password === password && s.status === 'active'
  );
  if (student) {
    setItem(STORAGE_KEYS.CURRENT_USER, { ...student, role: 'Student' });
    return student;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): (AdminUser | (Student & { role: string })) | null => {
  return getItem<AdminUser | (Student & { role: string })>(STORAGE_KEYS.CURRENT_USER);
};

// Students
export const getStudents = (): Student[] => {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS) || [];
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === student.id);
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  setItem(STORAGE_KEYS.STUDENTS, students);
};

export const deleteStudent = (id: string): void => {
  const students = getStudents().filter((s) => s.id !== id);
  setItem(STORAGE_KEYS.STUDENTS, students);
};

// Alias for adding new students (same as saveStudent but more semantic)
export const addStudent = (student: Student): void => {
  saveStudent(student);
};

// Classrooms
export const getClassrooms = (): Classroom[] => {
  return getItem<Classroom[]>(STORAGE_KEYS.CLASSROOMS) || [];
};

export const saveClassroom = (classroom: Classroom): void => {
  const classrooms = getClassrooms();
  const index = classrooms.findIndex((c) => c.id === classroom.id);
  if (index >= 0) {
    classrooms[index] = classroom;
  } else {
    classrooms.push(classroom);
  }
  setItem(STORAGE_KEYS.CLASSROOMS, classrooms);
};

export const deleteClassroom = (id: string): void => {
  const classrooms = getClassrooms().filter((c) => c.id !== id);
  setItem(STORAGE_KEYS.CLASSROOMS, classrooms);
};

// Tasks
export const getTasks = (): CleaningTask[] => {
  return getItem<CleaningTask[]>(STORAGE_KEYS.TASKS) || [];
};

export const saveTask = (task: CleaningTask): void => {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }
  setItem(STORAGE_KEYS.TASKS, tasks);
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks().filter((t) => t.id !== id);
  setItem(STORAGE_KEYS.TASKS, tasks);
};

// Checklists
export const getChecklists = (): Checklist[] => {
  return getItem<Checklist[]>(STORAGE_KEYS.CHECKLISTS) || [];
};

export const saveChecklist = (checklist: Checklist): void => {
  const checklists = getChecklists();
  const index = checklists.findIndex((c) => c.id === checklist.id);
  if (index >= 0) {
    checklists[index] = checklist;
  } else {
    checklists.push(checklist);
  }
  setItem(STORAGE_KEYS.CHECKLISTS, checklists);
};

export const deleteChecklist = (id: string): void => {
  const checklists = getChecklists().filter((c) => c.id !== id);
  setItem(STORAGE_KEYS.CHECKLISTS, checklists);
};

// Assignments (Extended format for student view)
export const getAssignments = (): Assignment[] => {
  // Convert TaskAssignments to individual student Assignments
  const taskAssignments = getItem<TaskAssignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];
  const students = getStudents();
  const classrooms = getClassrooms();
  const tasks = getTasks();
  const checklists = getChecklists();

  const assignments: Assignment[] = [];
  
  taskAssignments.forEach((ta) => {
    const classroom = classrooms.find((c) => c.id === ta.classroomId);
    const checklist = checklists.find((c) => c.id === ta.checklistId);
    
    if (!classroom || !checklist) return;
    
    ta.studentIds.forEach((studentId) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      
      checklist.taskIds.forEach((taskId, index) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        
        assignments.push({
          id: `${ta.id}-${studentId}-${taskId}`,
          date: ta.date,
          classroomId: ta.classroomId,
          classroomName: classroom.name,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          taskId: task.id,
          taskName: task.name,
          status: ta.status,
          completedAt: ta.completedAt,
          comments: ta.comments,
        });
      });
    });
  });
  
  return assignments;
};

export const updateAssignment = (assignment: Assignment): void => {
  // Update the underlying TaskAssignment
  const taskAssignments = getItem<TaskAssignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];
  const parts = assignment.id.split('-');
  const taskAssignmentId = parts[0];
  
  const index = taskAssignments.findIndex((a) => a.id === taskAssignmentId);
  if (index >= 0) {
    taskAssignments[index] = {
      ...taskAssignments[index],
      status: assignment.status,
      completedAt: assignment.completedAt,
      comments: assignment.comments,
    };
    setItem(STORAGE_KEYS.ASSIGNMENTS, taskAssignments);
  }
};

export const saveAssignment = (assignment: TaskAssignment): void => {
  const assignments = getItem<TaskAssignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];
  const index = assignments.findIndex((a) => a.id === assignment.id);
  if (index >= 0) {
    assignments[index] = assignment;
  } else {
    assignments.push(assignment);
  }
  setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
};

export const deleteAssignment = (id: string): void => {
  const assignments = getItem<TaskAssignment[]>(STORAGE_KEYS.ASSIGNMENTS) || [];
  const filtered = assignments.filter((a) => a.id !== id);
  setItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
};

// Initialize on load
initializeDefaultAdmin();
