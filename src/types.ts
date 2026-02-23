// import { z } from 'zod';

// export const AdminSchema = z.object({
//   fullName: z.string().optional(),
//   phone: z.number().int().positive(),
//   email: z.string().email(),
//   password: z.string().min(6),
//   isActive: z.boolean().default(true),
// });

// export type Admin = z.infer<typeof AdminSchema> & {
//   adminId: string;
//   createdAt: string;
// };

// export const DepartmentSchema = z.object({
//   departmentType: z.enum(["Software Engineer", "Technical Supporter", "Network Engineer"]),
//   role: z.string().min(1),
//   employeeId: z.number().int().positive(),
//   joiningDate: z.string(),
//   isActive: z.boolean().default(true),
// });

// export type Department = z.infer<typeof DepartmentSchema> & {
//   id: string;
//   adminId: string;
//   employeeName?: string;
//   adminName?: string;
// };

// export const MemorandumSchema = z.object({
//   title: z.string().min(1).max(100),
//   content: z.string().min(1),
// });

// export type Memorandum = z.infer<typeof MemorandumSchema> & {
//   id: string;
//   adminId: string;
//   adminName?: string;
//   createdAt: string;
//   updatedAt: string;
// };

// export const HRSchema = z.object({
//   username: z.string().min(1),
//   fullName: z.string().min(1),
//   email: z.string().email(),
//   phone: z.string().min(1),
//   password: z.string().min(6),
//   address: z.string().min(1),
//   salary: z.string().min(1),
//   isWorking: z.boolean().default(true),
//   age: z.string().optional(),
//   gender: z.enum(["male", "female", "other"]),
// });

// export type HRMember = z.infer<typeof HRSchema> & {
//   id: string;
//   createdAt: string;
// };

// export const TaskSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().min(1),
//   url: z.string().url().optional().or(z.literal('')),
//   dueDate: z.string(),
//   employeeId: z.number().optional(),
//   hrId: z.string().optional(),
//   submissionUrl: z.string().optional(),
// });

// export type Task = z.infer<typeof TaskSchema> & {
//   id: string;
//   status: 'pending' | 'submitted';
//   assignedToId: string;
//   assignedToType: 'employee' | 'hr';
//   adminId: string;
//   hrName?: string;
//   createdAt: string;
// };

// export interface Employee {
//   id: number;
//   fullName: string;
//   email: string;
//   status: 'active' | 'inactive';
//   gender: string;
//   phoneNumber: string;
// }
import { z } from 'zod';

export const AdminSchema = z.object({
  fullName: z.string().optional(),
  phone: z.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(6),
  isActive: z.boolean().default(true),
});

export type Admin = z.infer<typeof AdminSchema> & {
  adminId: string;
  createdAt: string;
};

export const DepartmentSchema = z.object({
  departmentType: z.enum(["Software Engineer", "Technical Supporter", "Network Engineer"]),
  role: z.string().min(1),
  employeeId: z.number().int().positive(),
  joiningDate: z.string(),
  isActive: z.boolean().default(true),
});

export type Department = z.infer<typeof DepartmentSchema> & {
  id: string;
  adminId: string;
  employeeName?: string;
  adminName?: string;
};

export const MemorandumSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export type Memorandum = z.infer<typeof MemorandumSchema> & {
  id: string;
  adminId: string;
  adminName?: string;
  createdAt: string;
  updatedAt: string;
};

export const HRSchema = z.object({
  username: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(6),
  address: z.string().min(1),
  salary: z.string().min(1),
  isWorking: z.boolean().default(true),
  age: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
});

export type HRMember = z.infer<typeof HRSchema> & {
  id: string;
  createdAt: string;
};

export const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().optional().or(z.literal('')),
  dueDate: z.string(),
  employeeId: z.number().optional(),
  hrId: z.string().optional(),
  submissionUrl: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema> & {
  id: string;
  status: 'pending' | 'submitted';
  assignedToId: string;
  assignedToType: 'employee' | 'hr';
  adminId: string;
  hrName?: string;
  createdAt: string;
};

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  status: 'active' | 'inactive';
  gender: string;
  phoneNumber: string;
}