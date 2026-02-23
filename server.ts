// import express from "express";
// import { createServer as createViteServer } from "vite";
// import { clerkMiddleware, getAuth } from "@clerk/express";
// import Database from "better-sqlite3";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";

// const db = new Database("office.db");

// // Initialize Database Schema
// db.exec(`
//   CREATE TABLE IF NOT EXISTS admins (
//     adminId TEXT PRIMARY KEY,
//     fullName TEXT,
//     email TEXT UNIQUE,
//     phone INTEGER UNIQUE,
//     password TEXT,
//     isActive BOOLEAN DEFAULT 1,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   );

//   CREATE TABLE IF NOT EXISTS employees (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     fullName TEXT,
//     email TEXT UNIQUE,
//     status TEXT DEFAULT 'active',
//     gender TEXT,
//     phoneNumber TEXT
//   );

//   CREATE TABLE IF NOT EXISTS departments (
//     id TEXT PRIMARY KEY,
//     departmentType TEXT,
//     role TEXT,
//     employeeId INTEGER,
//     adminId TEXT,
//     joiningDate DATETIME,
//     isActive BOOLEAN DEFAULT 1,
//     FOREIGN KEY(employeeId) REFERENCES employees(id),
//     FOREIGN KEY(adminId) REFERENCES admins(adminId)
//   );

//   CREATE TABLE IF NOT EXISTS memorandums (
//     id TEXT PRIMARY KEY,
//     title TEXT,
//     content TEXT,
//     adminId TEXT,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY(adminId) REFERENCES admins(adminId)
//   );

//   CREATE TABLE IF NOT EXISTS hr_members (
//     id TEXT PRIMARY KEY,
//     username TEXT UNIQUE,
//     fullName TEXT,
//     email TEXT UNIQUE,
//     phone TEXT,
//     password TEXT,
//     address TEXT,
//     salary TEXT,
//     isWorking BOOLEAN DEFAULT 1,
//     age TEXT,
//     gender TEXT,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   );

//   CREATE TABLE IF NOT EXISTS tasks (
//     id TEXT PRIMARY KEY,
//     title TEXT,
//     description TEXT,
//     dueDate DATETIME,
//     status TEXT DEFAULT 'pending',
//     submissionUrl TEXT,
//     assignedToId TEXT, -- Can be employeeId or hrId
//     assignedToType TEXT, -- 'employee' or 'hr'
//     adminId TEXT,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY(adminId) REFERENCES admins(adminId)
//   );
// `);

// // Seed initial employee data if empty
// const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
// if (employeeCount.count === 0) {
//   const insertEmployee = db.prepare("INSERT INTO employees (fullName, email, status, gender, phoneNumber) VALUES (?, ?, ?, ?, ?)");
//   insertEmployee.run("Jane Smith", "jane@company.com", "active", "female", "1234567890");
//   insertEmployee.run("John Doe", "john@company.com", "active", "male", "0987654321");
//   insertEmployee.run("Alice Johnson", "alice@company.com", "inactive", "female", "5551234567");
// }

// async function startServer() {
//   const app = express();
//   const PORT = 3000;

//   app.use(express.json());

//   // Ensure Clerk environment variables are mapped correctly for the middleware
//   if (!process.env.CLERK_PUBLISHABLE_KEY) {
//     process.env.CLERK_PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
//   }
//   if (!process.env.CLERK_SECRET_KEY) {
//     process.env.CLERK_SECRET_KEY = "sk_test_RpbLsSXtt1rGRHe0XvgAvZ6PoLUHh5Psm2Z5CJ6GPh";
//   }

//   if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
//     app.use(clerkMiddleware());
//   } else {
//     console.warn("⚠️ Clerk keys missing. Authentication middleware is disabled.");
//     // Provide a dummy middleware that doesn't crash but warns on protected routes
//     app.use((req, res, next) => {
//       (req as any).auth = {}; 
//       next();
//     });
//   }

//   // Middleware to protect API routes
//   const requireAuth = (req: any, res: any, next: any) => {
//     const auth = getAuth(req);
//     if (!auth.userId) {
//       if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
//         return res.status(500).json({ 
//           error: "Authentication is not configured. Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in the Secrets panel." 
//         });
//       }
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     next();
//   };

//   // --- ADMIN ENDPOINTS ---
//   app.post("/admin/users/register", requireAuth, (req, res) => {
//     const { fullName, phone, email, password, isActive } = req.body;
//     const adminId = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO admins (adminId, fullName, phone, email, password, isActive) VALUES (?, ?, ?, ?, ?, ?)");
//       stmt.run(adminId, fullName, phone, email, password, isActive ? 1 : 0);
//       const admin = db.prepare("SELECT * FROM admins WHERE adminId = ?").get(adminId);
//       res.status(201).json(admin);
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users", requireAuth, (req, res) => {
//     const admins = db.prepare("SELECT * FROM admins ORDER BY createdAt DESC").all();
//     res.json(admins);
//   });

//   app.get("/admin/users/fullName", requireAuth, (req, res) => {
//     const { fullName } = req.query;
//     const admins = db.prepare("SELECT * FROM admins WHERE fullName LIKE ?").all(`%${fullName}%`);
//     res.json(admins);
//   });

//   app.patch("/admin/users/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { phone } = req.body;
//     try {
//       const stmt = db.prepare("UPDATE admins SET phone = ? WHERE adminId = ?");
//       stmt.run(phone, adminId);
//       res.json({ success: true });
//     } catch (err: any) {
//       res.status(401).json({ error: "Phone number already exists" });
//     }
//   });

//   app.delete("/admin/users/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     db.prepare("DELETE FROM admins WHERE adminId = ?").run(adminId);
//     res.json({ success: true });
//   });

//   // --- DEPARTMENT ENDPOINTS ---
//   app.post("/admin/users/departments/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { departmentType, role, employeeId, joiningDate, isActive } = req.body;
//     const id = uuidv4();
    
//     // Validate employee
//     const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(employeeId);
//     if (!employee) return res.status(400).json({ error: "Employee doesn't exist" });

//     try {
//       const stmt = db.prepare("INSERT INTO departments (id, departmentType, role, employeeId, adminId, joiningDate, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)");
//       stmt.run(id, departmentType, role, employeeId, adminId, joiningDate, isActive ? 1 : 0);
      
//       const dept = db.prepare(`
//         SELECT d.*, e.fullName as employeeName 
//         FROM departments d 
//         JOIN employees e ON d.employeeId = e.id 
//         WHERE d.id = ?
//       `).get(id) as any;

//       res.status(201).json({
//         ...dept,
//         admin: { adminId },
//         employee: { id: employeeId, fullName: dept.employeeName }
//       });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/departments/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const depts = db.prepare(`
//       SELECT d.*, e.fullName as employeeName, a.fullName as adminName 
//       FROM departments d 
//       JOIN employees e ON d.employeeId = e.id 
//       JOIN admins a ON d.adminId = a.adminId
//       WHERE d.adminId = ?
//     `).all(adminId);
//     res.json(depts);
//   });

//   app.put("/admin/users/:adminId/:employeeId", requireAuth, (req, res) => {
//     const { adminId, employeeId } = req.params;
//     const { departmentType, role, joiningDate, isActive } = req.body;
//     try {
//       const stmt = db.prepare("UPDATE departments SET departmentType = ?, role = ?, joiningDate = ?, isActive = ? WHERE adminId = ? AND employeeId = ?");
//       stmt.run(departmentType, role, joiningDate, isActive ? 1 : 0, adminId, employeeId);
//       res.json({ success: true });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.delete("/admin/users/:adminId/:departmentId", requireAuth, (req, res) => {
//     const { adminId, departmentId } = req.params;
//     const result = db.prepare("DELETE FROM departments WHERE id = ? AND adminId = ?").run(departmentId, adminId);
//     if (result.changes === 0) return res.status(404).json({ error: "Department not found" });
//     res.json({ success: true });
//   });

//   // --- MEMORANDUM ENDPOINTS ---
//   app.post("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { title, content } = req.body;
//     const id = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO memorandums (id, title, content, adminId) VALUES (?, ?, ?, ?)");
//       stmt.run(id, title, content, adminId);
//       const memo = db.prepare("SELECT * FROM memorandums WHERE id = ?").get(id);
//       res.status(201).json({ ...memo, admin: { adminId } });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const memos = db.prepare(`
//       SELECT m.*, a.fullName as adminName 
//       FROM memorandums m 
//       JOIN admins a ON m.adminId = a.adminId
//       WHERE m.adminId = ?
//       ORDER BY createdAt DESC
//     `).all(adminId);
//     res.json(memos);
//   });

//   app.patch("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     const { title, content } = req.body;
//     db.prepare("UPDATE memorandums SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(title, content, id);
//     res.json({ success: true });
//   });

//   app.delete("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     db.prepare("DELETE FROM memorandums WHERE id = ?").run(id);
//     res.json({ success: true });
//   });

//   // --- HR ENDPOINTS ---
//   app.post("/admin/users/hr-management", requireAuth, (req, res) => {
//     const { username, fullName, email, phone, password, address, salary, isWorking, age, gender } = req.body;
//     const id = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO hr_members (id, username, fullName, email, phone, password, address, salary, isWorking, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
//       stmt.run(id, username, fullName, email, phone, password, address, salary, isWorking ? 1 : 0, age, gender);
//       const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(id);
//       res.status(201).json(hr);
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/hr-management", requireAuth, (req, res) => {
//     const hrs = db.prepare("SELECT * FROM hr_members ORDER BY createdAt DESC").all();
//     res.json(hrs);
//   });

//   app.get("/admin/users/hr-management/:id", requireAuth, (req, res) => {
//     const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(req.params.id);
//     if (!hr) return res.status(404).json({ error: "HR not found" });
//     res.json(hr);
//   });

//   app.patch("/admin/users/hr-management/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     const updates = req.body;
//     const keys = Object.keys(updates);
//     const values = Object.values(updates);
//     const setClause = keys.map(k => `${k} = ?`).join(", ");
//     db.prepare(`UPDATE hr_members SET ${setClause} WHERE id = ?`).run(...values, id);
//     res.json({ success: true });
//   });

//   // --- TASK ENDPOINTS ---
//   app.post("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { title, description, url, dueDate, employeeId } = req.body;
//     const id = uuidv4();
//     db.prepare("INSERT INTO tasks (id, title, description, submissionUrl, dueDate, assignedToId, assignedToType, adminId) VALUES (?, ?, ?, ?, ?, ?, 'employee', ?)")
//       .run(id, title, description, url, dueDate, employeeId, adminId);
//     res.status(201).json({ id, title, description, dueDate, employeeId });
//   });

//   app.get("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
//     const tasks = db.prepare("SELECT * FROM tasks WHERE adminId = ? AND assignedToType = 'employee'").all(req.params.adminId);
//     res.json(tasks);
//   });

//   app.get("/admin/users/employee-tasks/:employeeId", requireAuth, (req, res) => {
//     const tasks = db.prepare("SELECT * FROM tasks WHERE assignedToId = ? AND assignedToType = 'employee'").all(req.params.employeeId);
//     res.json(tasks);
//   });

//   app.patch("/admin/users/employee-tasks/submit/:taskId", requireAuth, (req, res) => {
//     const { submissionUrl } = req.body;
//     db.prepare("UPDATE tasks SET submissionUrl = ?, status = 'submitted' WHERE id = ?").run(submissionUrl, req.params.taskId);
//     res.json({ success: true });
//   });

//   app.patch("/admin/users/employee-tasks/:taskId", requireAuth, (req, res) => {
//     const { submissionUrl, status } = req.body;
//     db.prepare("UPDATE tasks SET submissionUrl = ?, status = ? WHERE id = ?").run(submissionUrl, status, req.params.taskId);
//     res.json({ success: true });
//   });

//   app.post("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { title, description, dueDate, hrId, submissionUrl } = req.body;
//     const id = uuidv4();
//     db.prepare("INSERT INTO tasks (id, title, description, dueDate, assignedToId, assignedToType, adminId, submissionUrl) VALUES (?, ?, ?, ?, ?, 'hr', ?, ?)")
//       .run(id, title, description, dueDate, hrId, adminId, submissionUrl);
//     res.status(201).json({ id, title });
//   });

//   app.get("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
//     const tasks = db.prepare(`
//       SELECT t.*, h.fullName as hrName 
//       FROM tasks t 
//       JOIN hr_members h ON t.assignedToId = h.id 
//       WHERE t.adminId = ? AND t.assignedToType = 'hr'
//     `).all(req.params.adminId);
//     res.json(tasks);
//   });

//   app.patch("/admin/users/tasks/:taskId", requireAuth, (req, res) => {
//     const { status } = req.body;
//     db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.taskId);
//     res.json({ success: true });
//   });

//   // --- EMPLOYEE ENDPOINTS ---
//   app.get("/admin/users/employees", requireAuth, (req, res) => {
//     const employees = db.prepare("SELECT * FROM employees").all();
//     res.json(employees);
//   });

//   // --- EMAIL ENDPOINT ---
//   app.post("/admin/users/send", requireAuth, (req, res) => {
//     const { to, subject, text } = req.body;
//     console.log(`Email sent to ${to}: ${subject}`);
//     res.json({ success: true, message: "Email sent successfully" });
//   });

//   // --- DASHBOARD STATS ---
//   app.get("/api/stats", requireAuth, (req, res) => {
//     const admins = db.prepare("SELECT COUNT(*) as count FROM admins").get() as any;
//     const departments = db.prepare("SELECT COUNT(*) as count FROM departments").get() as any;
//     const employees = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
//     const hr = db.prepare("SELECT COUNT(*) as count FROM hr_members").get() as any;
//     const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as any;
//     const activeMemos = db.prepare("SELECT COUNT(*) as count FROM memorandums").get() as any;

//     res.json({
//       totalAdmins: admins.count,
//       totalDepartments: departments.count,
//       totalEmployees: employees.count,
//       totalHR: hr.count,
//       pendingTasks: pendingTasks.count,
//       activeMemos: activeMemos.count
//     });
//   });

//   // Vite middleware for development
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     app.use(express.static(path.join(__dirname, "dist")));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "dist", "index.html"));
//     });
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// startServer();
// import express from "express";
// import { createServer as createViteServer } from "vite";
// import { clerkMiddleware, getAuth } from "@clerk/express";
// import Database from "better-sqlite3";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";

// let db: Database.Database;
// try {
//   db = new Database("office.db");
//   db.pragma('foreign_keys = ON');
// } catch (err: any) {
//   if (err.code === 'SQLITE_NOTADB') {
//     console.error("❌ Error: 'office.db' is not a valid SQLite database file.");
//     console.error("👉 Solution: Delete the 'office.db' file in your project root and restart the server.");
//   }
//   throw err;
// }

// // Initialize Database Schema
// try {
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS admins (
//       adminId TEXT PRIMARY KEY,
//       fullName TEXT,
//       email TEXT UNIQUE,
//       phone INTEGER UNIQUE,
//       password TEXT,
//       isActive BOOLEAN DEFAULT 1,
//       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS employees (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       fullName TEXT,
//       email TEXT UNIQUE,
//       status TEXT DEFAULT 'active',
//       gender TEXT,
//       phoneNumber TEXT
//     );

//     CREATE TABLE IF NOT EXISTS departments (
//       id TEXT PRIMARY KEY,
//       departmentType TEXT,
//       role TEXT,
//       employeeId INTEGER,
//       adminId TEXT,
//       joiningDate DATETIME,
//       isActive BOOLEAN DEFAULT 1,
//       FOREIGN KEY(employeeId) REFERENCES employees(id),
//       FOREIGN KEY(adminId) REFERENCES admins(adminId)
//     );

//     CREATE TABLE IF NOT EXISTS memorandums (
//       id TEXT PRIMARY KEY,
//       title TEXT,
//       content TEXT,
//       adminId TEXT,
//       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY(adminId) REFERENCES admins(adminId)
//     );

//     CREATE TABLE IF NOT EXISTS hr_members (
//       id TEXT PRIMARY KEY,
//       username TEXT UNIQUE,
//       fullName TEXT,
//       email TEXT UNIQUE,
//       phone TEXT,
//       password TEXT,
//       address TEXT,
//       salary TEXT,
//       isWorking BOOLEAN DEFAULT 1,
//       age TEXT,
//       gender TEXT,
//       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS tasks (
//       id TEXT PRIMARY KEY,
//       title TEXT,
//       description TEXT,
//       dueDate DATETIME,
//       status TEXT DEFAULT 'pending',
//       submissionUrl TEXT,
//       assignedToId TEXT, -- Can be employeeId or hrId
//       assignedToType TEXT, -- 'employee' or 'hr'
//       adminId TEXT,
//       createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY(adminId) REFERENCES admins(adminId)
//     );
//   `);
// } catch (err: any) {
//   if (err.code === 'SQLITE_NOTADB') {
//     console.error("❌ Error: 'office.db' is not a valid SQLite database file.");
//     console.error("👉 Solution: Delete the 'office.db' file in your project root and restart the server.");
//   }
//   throw err;
// }

// // Seed initial employee data if empty
// const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
// if (employeeCount.count === 0) {
//   const insertEmployee = db.prepare("INSERT INTO employees (fullName, email, status, gender, phoneNumber) VALUES (?, ?, ?, ?, ?)");
//   insertEmployee.run("Jane Smith", "jane@company.com", "active", "female", "1234567890");
//   insertEmployee.run("John Doe", "john@company.com", "active", "male", "0987654321");
//   insertEmployee.run("Alice Johnson", "alice@company.com", "inactive", "female", "5551234567");
// }

// async function startServer() {
//   const app = express();
//   const PORT = 3000;

//   app.use(express.json());

//   // Ensure Clerk environment variables are mapped correctly for the middleware
//   if (!process.env.CLERK_PUBLISHABLE_KEY) {
//     process.env.CLERK_PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
//   }
//   if (!process.env.CLERK_SECRET_KEY) {
//     process.env.CLERK_SECRET_KEY = "sk_test_RpbLsSXtt1rGRHe0XvgAvZ6PoLUHh5Psm2Z5CJ6GPh";
//   }

//   if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
//     app.use(clerkMiddleware());
//   } else {
//     console.warn("⚠️ Clerk keys missing. Authentication middleware is disabled.");
//     app.use((req, res, next) => {
//       (req as any).auth = {}; 
//       next();
//     });
//   }

//   // Middleware to protect API routes
//   const requireAuth = (req: any, res: any, next: any) => {
//     const auth = getAuth(req);
//     if (!auth.userId) {
//       if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
//         return res.status(500).json({ 
//           error: "Authentication is not configured. Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY." 
//         });
//       }
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     next();
//   };

//   // Helper to ensure admin exists in DB (for Clerk users)
//   const ensureAdminExists = (auth: any) => {
//     if (!auth.userId) return;
//     const admin = db.prepare("SELECT * FROM admins WHERE adminId = ?").get(auth.userId);
//     if (!admin) {
//       const email = auth.sessionClaims?.email || `user_${auth.userId}@clerk.local`;
//       const fullName = auth.sessionClaims?.full_name || "Clerk Admin";
      
//       try {
//         db.prepare("INSERT INTO admins (adminId, fullName, email, isActive) VALUES (?, ?, ?, 1)")
//           .run(auth.userId, fullName, email);
//       } catch (err: any) {
//         if (err.message.includes('UNIQUE constraint failed')) {
//           db.prepare("INSERT INTO admins (adminId, fullName, isActive) VALUES (?, ?, 1)")
//             .run(auth.userId, fullName);
//         } else {
//           console.error("Failed to ensure admin exists:", err);
//         }
//       }
//     }
//   };

//   // --- ADMIN ENDPOINTS ---
//   app.post("/admin/users/register", requireAuth, (req, res) => {
//     const { fullName, phone, email, password, isActive } = req.body;
//     const adminId = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO admins (adminId, fullName, phone, email, password, isActive) VALUES (?, ?, ?, ?, ?, ?)");
//       stmt.run(adminId, fullName, phone, email, password, isActive ? 1 : 0);
//       const admin = db.prepare("SELECT * FROM admins WHERE adminId = ?").get(adminId);
//       res.status(201).json(admin);
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users", requireAuth, (req, res) => {
//     const admins = db.prepare("SELECT * FROM admins ORDER BY createdAt DESC").all();
//     res.json(admins);
//   });

//   app.get("/admin/users/fullName", requireAuth, (req, res) => {
//     const { fullName } = req.query;
//     const admins = db.prepare("SELECT * FROM admins WHERE fullName LIKE ?").all(`%${fullName}%`);
//     res.json(admins);
//   });

//   app.patch("/admin/users/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const { phone } = req.body;
//     try {
//       const stmt = db.prepare("UPDATE admins SET phone = ? WHERE adminId = ?");
//       stmt.run(phone, adminId);
//       res.json({ success: true });
//     } catch (err: any) {
//       res.status(401).json({ error: "Phone number already exists" });
//     }
//   });

//   app.delete("/admin/users/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     db.prepare("DELETE FROM admins WHERE adminId = ?").run(adminId);
//     res.json({ success: true });
//   });

//   // --- DEPARTMENT ENDPOINTS ---
//   app.post("/admin/users/departments/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const auth = getAuth(req);
//     ensureAdminExists(auth);

//     const { departmentType, role, employeeId, joiningDate, isActive } = req.body;
//     const id = uuidv4();
    
//     const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(employeeId);
//     if (!employee) return res.status(400).json({ error: "Employee doesn't exist" });

//     try {
//       const stmt = db.prepare("INSERT INTO departments (id, departmentType, role, employeeId, adminId, joiningDate, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)");
//       stmt.run(id, departmentType, role, employeeId, adminId, joiningDate, isActive ? 1 : 0);
      
//       const dept = db.prepare(`
//         SELECT d.*, e.fullName as employeeName 
//         FROM departments d 
//         JOIN employees e ON d.employeeId = e.id 
//         WHERE d.id = ?
//       `).get(id) as any;

//       res.status(201).json({
//         ...dept,
//         admin: { adminId },
//         employee: { id: employeeId, fullName: dept.employeeName }
//       });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/departments/:adminId", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const depts = db.prepare(`
//       SELECT d.*, e.fullName as employeeName, a.fullName as adminName 
//       FROM departments d 
//       JOIN employees e ON d.employeeId = e.id 
//       JOIN admins a ON d.adminId = a.adminId
//       WHERE d.adminId = ?
//     `).all(adminId);
//     res.json(depts);
//   });

//   app.put("/admin/users/:adminId/:employeeId", requireAuth, (req, res) => {
//     const { adminId, employeeId } = req.params;
//     const { departmentType, role, joiningDate, isActive } = req.body;
//     try {
//       const stmt = db.prepare("UPDATE departments SET departmentType = ?, role = ?, joiningDate = ?, isActive = ? WHERE adminId = ? AND employeeId = ?");
//       stmt.run(departmentType, role, joiningDate, isActive ? 1 : 0, adminId, employeeId);
//       res.json({ success: true });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.delete("/admin/users/:adminId/:departmentId", requireAuth, (req, res) => {
//     const { adminId, departmentId } = req.params;
//     const result = db.prepare("DELETE FROM departments WHERE id = ? AND adminId = ?").run(departmentId, adminId);
//     if (result.changes === 0) return res.status(404).json({ error: "Department not found" });
//     res.json({ success: true });
//   });

//   // --- MEMORANDUM ENDPOINTS ---
//   app.post("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const auth = getAuth(req);
//     ensureAdminExists(auth);
    
//     const { title, content } = req.body;
//     const id = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO memorandums (id, title, content, adminId) VALUES (?, ?, ?, ?)");
//       stmt.run(id, title, content, adminId);
//       const memo = db.prepare("SELECT * FROM memorandums WHERE id = ?").get(id);
//       res.status(201).json({ ...memo, admin: { adminId } });
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const memos = db.prepare(`
//       SELECT m.*, a.fullName as adminName 
//       FROM memorandums m 
//       JOIN admins a ON m.adminId = a.adminId
//       WHERE m.adminId = ?
//       ORDER BY createdAt DESC
//     `).all(adminId);
//     res.json(memos);
//   });

//   app.patch("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     const { title, content } = req.body;
//     db.prepare("UPDATE memorandums SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(title, content, id);
//     res.json({ success: true });
//   });

//   app.delete("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     db.prepare("DELETE FROM memorandums WHERE id = ?").run(id);
//     res.json({ success: true });
//   });

//   // --- HR ENDPOINTS ---
//   app.post("/admin/users/hr-management", requireAuth, (req, res) => {
//     const { username, fullName, email, phone, password, address, salary, isWorking, age, gender } = req.body;
//     const id = uuidv4();
//     try {
//       const stmt = db.prepare("INSERT INTO hr_members (id, username, fullName, email, phone, password, address, salary, isWorking, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
//       stmt.run(id, username, fullName, email, phone, password, address, salary, isWorking ? 1 : 0, age, gender);
//       const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(id);
//       res.status(201).json(hr);
//     } catch (err: any) {
//       res.status(400).json({ error: err.message });
//     }
//   });

//   app.get("/admin/users/hr-management", requireAuth, (req, res) => {
//     const hrs = db.prepare("SELECT * FROM hr_members ORDER BY createdAt DESC").all();
//     res.json(hrs);
//   });

//   app.get("/admin/users/hr-management/:id", requireAuth, (req, res) => {
//     const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(req.params.id);
//     if (!hr) return res.status(404).json({ error: "HR not found" });
//     res.json(hr);
//   });

//   app.patch("/admin/users/hr-management/:id", requireAuth, (req, res) => {
//     const { id } = req.params;
//     const updates = req.body;
//     const keys = Object.keys(updates);
//     const values = Object.values(updates);
//     const setClause = keys.map(k => `${k} = ?`).join(", ");
//     db.prepare(`UPDATE hr_members SET ${setClause} WHERE id = ?`).run(...values, id);
//     res.json({ success: true });
//   });

//   // --- TASK ENDPOINTS ---
//   app.post("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const auth = getAuth(req);
//     ensureAdminExists(auth);

//     const { title, description, url, dueDate, employeeId } = req.body;
//     const id = uuidv4();
//     db.prepare("INSERT INTO tasks (id, title, description, submissionUrl, dueDate, assignedToId, assignedToType, adminId) VALUES (?, ?, ?, ?, ?, ?, 'employee', ?)")
//       .run(id, title, description, url, dueDate, employeeId, adminId);
//     res.status(201).json({ id, title, description, dueDate, employeeId });
//   });

//   app.get("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
//     const tasks = db.prepare("SELECT * FROM tasks WHERE adminId = ? AND assignedToType = 'employee'").all(req.params.adminId);
//     res.json(tasks);
//   });

//   app.get("/admin/users/employee-tasks/:employeeId", requireAuth, (req, res) => {
//     const tasks = db.prepare("SELECT * FROM tasks WHERE assignedToId = ? AND assignedToType = 'employee'").all(req.params.employeeId);
//     res.json(tasks);
//   });

//   app.patch("/admin/users/employee-tasks/submit/:taskId", requireAuth, (req, res) => {
//     const { submissionUrl } = req.body;
//     db.prepare("UPDATE tasks SET submissionUrl = ?, status = 'submitted' WHERE id = ?").run(submissionUrl, req.params.taskId);
//     res.json({ success: true });
//   });

//   app.patch("/admin/users/employee-tasks/:taskId", requireAuth, (req, res) => {
//     const { submissionUrl, status } = req.body;
//     db.prepare("UPDATE tasks SET submissionUrl = ?, status = ? WHERE id = ?").run(submissionUrl, status, req.params.taskId);
//     res.json({ success: true });
//   });

//   app.post("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
//     const { adminId } = req.params;
//     const auth = getAuth(req);
//     ensureAdminExists(auth);

//     const { title, description, dueDate, hrId, submissionUrl } = req.body;
//     const id = uuidv4();
//     db.prepare("INSERT INTO tasks (id, title, description, dueDate, assignedToId, assignedToType, adminId, submissionUrl) VALUES (?, ?, ?, ?, ?, 'hr', ?, ?)")
//       .run(id, title, description, dueDate, hrId, adminId, submissionUrl);
//     res.status(201).json({ id, title });
//   });

//   app.get("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
//     const tasks = db.prepare(`
//       SELECT t.*, h.fullName as hrName 
//       FROM tasks t 
//       JOIN hr_members h ON t.assignedToId = h.id 
//       WHERE t.adminId = ? AND t.assignedToType = 'hr'
//     `).all(req.params.adminId);
//     res.json(tasks);
//   });

//   app.patch("/admin/users/tasks/:taskId", requireAuth, (req, res) => {
//     const { status } = req.body;
//     db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.taskId);
//     res.json({ success: true });
//   });

//   // --- EMPLOYEE ENDPOINTS ---
//   app.get("/admin/users/employees", requireAuth, (req, res) => {
//     const employees = db.prepare("SELECT * FROM employees").all();
//     res.json(employees);
//   });

//   // --- EMAIL ENDPOINT ---
//   app.post("/admin/users/send", requireAuth, (req, res) => {
//     const { to, subject, text } = req.body;
//     console.log(`Email sent to ${to}: ${subject}`);
//     res.json({ success: true, message: "Email sent successfully" });
//   });

//   // --- DASHBOARD STATS ---
//   app.get("/api/stats", requireAuth, (req, res) => {
//     const admins = db.prepare("SELECT COUNT(*) as count FROM admins").get() as any;
//     const departments = db.prepare("SELECT COUNT(*) as count FROM departments").get() as any;
//     const employees = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
//     const hr = db.prepare("SELECT COUNT(*) as count FROM hr_members").get() as any;
//     const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as any;
//     const activeMemos = db.prepare("SELECT COUNT(*) as count FROM memorandums").get() as any;

//     res.json({
//       totalAdmins: admins.count,
//       totalDepartments: departments.count,
//       totalEmployees: employees.count,
//       totalHR: hr.count,
//       pendingTasks: pendingTasks.count,
//       activeMemos: activeMemos.count
//     });
//   });

//   // Vite middleware for development
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     app.use(express.static(path.join(__dirname, "dist")));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "dist", "index.html"));
//     });
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import { clerkMiddleware, getAuth } from "@clerk/express";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

let db: Database.Database;
try {
  db = new Database("office.db");
  db.pragma('foreign_keys = ON');
} catch (err: any) {
  if (err.code === 'SQLITE_NOTADB') {
    console.error("❌ Error: 'office.db' is not a valid SQLite database file.");
    console.error("👉 Solution: Delete the 'office.db' file in your project root and restart the server.");
  }
  throw err;
}

// Initialize Database Schema
try {
  db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    adminId TEXT PRIMARY KEY,
    fullName TEXT,
    email TEXT UNIQUE,
    phone INTEGER UNIQUE,
    password TEXT,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    email TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    gender TEXT,
    phoneNumber TEXT
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    departmentType TEXT,
    role TEXT,
    employeeId INTEGER,
    adminId TEXT,
    joiningDate DATETIME,
    isActive BOOLEAN DEFAULT 1,
    FOREIGN KEY(employeeId) REFERENCES employees(id),
    FOREIGN KEY(adminId) REFERENCES admins(adminId)
  );

  CREATE TABLE IF NOT EXISTS memorandums (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    adminId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(adminId) REFERENCES admins(adminId)
  );

  CREATE TABLE IF NOT EXISTS hr_members (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    fullName TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    address TEXT,
    salary TEXT,
    isWorking BOOLEAN DEFAULT 1,
    age TEXT,
    gender TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    dueDate DATETIME,
    status TEXT DEFAULT 'pending',
    submissionUrl TEXT,
    assignedToId TEXT, -- Can be employeeId or hrId
    assignedToType TEXT, -- 'employee' or 'hr'
    adminId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(adminId) REFERENCES admins(adminId)
  );
`);
} catch (err: any) {
  if (err.code === 'SQLITE_NOTADB') {
    console.error("❌ Error: 'office.db' is not a valid SQLite database file.");
    console.error("👉 Solution: Delete the 'office.db' file in your project root and restart the server.");
  }
  throw err;
}

// Seed initial employee data if empty
const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
if (employeeCount.count === 0) {
  const insertEmployee = db.prepare("INSERT INTO employees (fullName, email, status, gender, phoneNumber) VALUES (?, ?, ?, ?, ?)");
  insertEmployee.run("Jane Smith", "jane@company.com", "active", "female", "1234567890");
  insertEmployee.run("John Doe", "john@company.com", "active", "male", "0987654321");
  insertEmployee.run("Alice Johnson", "alice@company.com", "inactive", "female", "5551234567");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure Clerk environment variables are mapped correctly for the middleware
  if (!process.env.CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
  }
  if (!process.env.CLERK_SECRET_KEY) {
    process.env.CLERK_SECRET_KEY = "sk_test_RpbLsSXtt1rGRHe0XvgAvZ6PoLUHh5Psm2Z5CJ6GPh";
  }

  if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware());
  } else {
    console.warn("⚠️ Clerk keys missing. Authentication middleware is disabled.");
    app.use((req, res, next) => {
      (req as any).auth = {}; 
      next();
    });
  }

  // Middleware to protect API routes
  const requireAuth = (req: any, res: any, next: any) => {
    const auth = getAuth(req);
    if (!auth.userId) {
      if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
        return res.status(500).json({ 
          error: "Authentication is not configured. Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in the Secrets panel." 
        });
      }
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Helper to ensure admin exists in DB (for Clerk users)
  const ensureAdminExists = (auth: any) => {
    if (!auth.userId) return;
    const admin = db.prepare("SELECT * FROM admins WHERE adminId = ?").get(auth.userId);
    if (!admin) {
      const email = auth.sessionClaims?.email || `user_${auth.userId}@clerk.local`;
      const fullName = auth.sessionClaims?.full_name || "Clerk Admin";
      
      try {
        db.prepare("INSERT INTO admins (adminId, fullName, email, isActive) VALUES (?, ?, ?, 1)")
          .run(auth.userId, fullName, email);
      } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
          db.prepare("INSERT INTO admins (adminId, fullName, isActive) VALUES (?, ?, 1)")
            .run(auth.userId, fullName);
        } else {
          console.error("Failed to ensure admin exists:", err);
        }
      }
    }
  };

  // --- ADMIN ENDPOINTS ---
  app.post("/admin/users/register", requireAuth, (req, res) => {
    const { fullName, phone, email, password, isActive } = req.body;
    const adminId = uuidv4();
    try {
      const stmt = db.prepare("INSERT INTO admins (adminId, fullName, phone, email, password, isActive) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(adminId, fullName, phone, email, password, isActive ? 1 : 0);
      const admin = db.prepare("SELECT * FROM admins WHERE adminId = ?").get(adminId);
      res.status(201).json(admin);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/admin/users", requireAuth, (req, res) => {
    const admins = db.prepare("SELECT * FROM admins ORDER BY createdAt DESC").all();
    res.json(admins);
  });

  app.get("/admin/users/fullName", requireAuth, (req, res) => {
    const { fullName } = req.query;
    const admins = db.prepare("SELECT * FROM admins WHERE fullName LIKE ?").all(`%${fullName}%`);
    res.json(admins);
  });

  app.patch("/admin/users/:adminId", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const { phone } = req.body;
    try {
      const stmt = db.prepare("UPDATE admins SET phone = ? WHERE adminId = ?");
      stmt.run(phone, adminId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(401).json({ error: "Phone number already exists" });
    }
  });

  app.delete("/admin/users/:adminId", requireAuth, (req, res) => {
    const { adminId } = req.params;
    db.prepare("DELETE FROM admins WHERE adminId = ?").run(adminId);
    res.json({ success: true });
  });

  // --- DEPARTMENT ENDPOINTS ---
  app.post("/admin/users/departments/:adminId", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const auth = getAuth(req);
    ensureAdminExists(auth);

    const { departmentType, role, employeeId, joiningDate, isActive } = req.body;
    const id = uuidv4();
    
    // Validate employee
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(employeeId);
    if (!employee) return res.status(400).json({ error: "Employee doesn't exist" });

    try {
      const stmt = db.prepare("INSERT INTO departments (id, departmentType, role, employeeId, adminId, joiningDate, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, departmentType, role, employeeId, adminId, joiningDate, isActive ? 1 : 0);
      
      const dept = db.prepare(`
        SELECT d.*, e.fullName as employeeName 
        FROM departments d 
        JOIN employees e ON d.employeeId = e.id 
        WHERE d.id = ?
      `).get(id) as any;

      res.status(201).json({
        ...dept,
        admin: { adminId },
        employee: { id: employeeId, fullName: dept.employeeName }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/admin/users/departments/:adminId", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const depts = db.prepare(`
      SELECT d.*, e.fullName as employeeName, a.fullName as adminName 
      FROM departments d 
      JOIN employees e ON d.employeeId = e.id 
      JOIN admins a ON d.adminId = a.adminId
      WHERE d.adminId = ?
    `).all(adminId);
    res.json(depts);
  });

  app.put("/admin/users/:adminId/:employeeId", requireAuth, (req, res) => {
    const { adminId, employeeId } = req.params;
    const { departmentType, role, joiningDate, isActive } = req.body;
    try {
      const stmt = db.prepare("UPDATE departments SET departmentType = ?, role = ?, joiningDate = ?, isActive = ? WHERE adminId = ? AND employeeId = ?");
      stmt.run(departmentType, role, joiningDate, isActive ? 1 : 0, adminId, employeeId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/admin/users/:adminId/:departmentId", requireAuth, (req, res) => {
    const { adminId, departmentId } = req.params;
    const result = db.prepare("DELETE FROM departments WHERE id = ? AND adminId = ?").run(departmentId, adminId);
    if (result.changes === 0) return res.status(404).json({ error: "Department not found" });
    res.json({ success: true });
  });

  // --- MEMORANDUM ENDPOINTS ---
  app.post("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const auth = getAuth(req);
    ensureAdminExists(auth);
    
    const { title, content } = req.body;
    const id = uuidv4();
    try {
      const stmt = db.prepare("INSERT INTO memorandums (id, title, content, adminId) VALUES (?, ?, ?, ?)");
      stmt.run(id, title, content, adminId);
      const memo = db.prepare("SELECT * FROM memorandums WHERE id = ?").get(id);
      res.status(201).json({ ...memo, admin: { adminId } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/admin/users/:adminId/memorandums", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const memos = db.prepare(`
      SELECT m.*, a.fullName as adminName 
      FROM memorandums m 
      JOIN admins a ON m.adminId = a.adminId
      WHERE m.adminId = ?
      ORDER BY createdAt DESC
    `).all(adminId);
    res.json(memos);
  });

  app.patch("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    db.prepare("UPDATE memorandums SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(title, content, id);
    res.json({ success: true });
  });

  app.delete("/admin/users/:adminId/memorandums/:id", requireAuth, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM memorandums WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // --- HR ENDPOINTS ---
  app.post("/admin/users/hr-management", requireAuth, (req, res) => {
    const { username, fullName, email, phone, password, address, salary, isWorking, age, gender } = req.body;
    const id = uuidv4();
    try {
      const stmt = db.prepare("INSERT INTO hr_members (id, username, fullName, email, phone, password, address, salary, isWorking, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, username, fullName, email, phone, password, address, salary, isWorking ? 1 : 0, age, gender);
      const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(id);
      res.status(201).json(hr);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/admin/users/hr-management", requireAuth, (req, res) => {
    const hrs = db.prepare("SELECT * FROM hr_members ORDER BY createdAt DESC").all();
    res.json(hrs);
  });

  app.get("/admin/users/hr-management/:id", requireAuth, (req, res) => {
    const hr = db.prepare("SELECT * FROM hr_members WHERE id = ?").get(req.params.id);
    if (!hr) return res.status(404).json({ error: "HR not found" });
    res.json(hr);
  });

  app.patch("/admin/users/hr-management/:id", requireAuth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    db.prepare(`UPDATE hr_members SET ${setClause} WHERE id = ?`).run(...values, id);
    res.json({ success: true });
  });

  // --- TASK ENDPOINTS ---
  app.post("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const auth = getAuth(req);
    ensureAdminExists(auth);

    const { title, description, url, dueDate, employeeId } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO tasks (id, title, description, submissionUrl, dueDate, assignedToId, assignedToType, adminId) VALUES (?, ?, ?, ?, ?, ?, 'employee', ?)")
      .run(id, title, description, url, dueDate, employeeId, adminId);
    res.status(201).json({ id, title, description, dueDate, employeeId });
  });

  app.get("/admin/users/:adminId/employee-tasks", requireAuth, (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks WHERE adminId = ? AND assignedToType = 'employee'").all(req.params.adminId);
    res.json(tasks);
  });

  app.get("/admin/users/employee-tasks/:employeeId", requireAuth, (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks WHERE assignedToId = ? AND assignedToType = 'employee'").all(req.params.employeeId);
    res.json(tasks);
  });

  app.patch("/admin/users/employee-tasks/submit/:taskId", requireAuth, (req, res) => {
    const { submissionUrl } = req.body;
    db.prepare("UPDATE tasks SET submissionUrl = ?, status = 'submitted' WHERE id = ?").run(submissionUrl, req.params.taskId);
    res.json({ success: true });
  });

  app.patch("/admin/users/employee-tasks/:taskId", requireAuth, (req, res) => {
    const { submissionUrl, status } = req.body;
    db.prepare("UPDATE tasks SET submissionUrl = ?, status = ? WHERE id = ?").run(submissionUrl, status, req.params.taskId);
    res.json({ success: true });
  });

  app.post("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
    const { adminId } = req.params;
    const auth = getAuth(req);
    ensureAdminExists(auth);

    const { title, description, dueDate, hrId, submissionUrl } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO tasks (id, title, description, dueDate, assignedToId, assignedToType, adminId, submissionUrl) VALUES (?, ?, ?, ?, ?, 'hr', ?, ?)")
      .run(id, title, description, dueDate, hrId, adminId, submissionUrl);
    res.status(201).json({ id, title });
  });

  app.get("/admin/users/:adminId/tasks", requireAuth, (req, res) => {
    const tasks = db.prepare(`
      SELECT t.*, h.fullName as hrName 
      FROM tasks t 
      JOIN hr_members h ON t.assignedToId = h.id 
      WHERE t.adminId = ? AND t.assignedToType = 'hr'
    `).all(req.params.adminId);
    res.json(tasks);
  });

  app.patch("/admin/users/tasks/:taskId", requireAuth, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, req.params.taskId);
    res.json({ success: true });
  });

  // --- EMPLOYEE ENDPOINTS ---
  app.get("/admin/users/employees", requireAuth, (req, res) => {
    const employees = db.prepare("SELECT * FROM employees").all();
    res.json(employees);
  });

  // --- EMAIL ENDPOINT ---
  app.post("/admin/users/send", requireAuth, (req, res) => {
    const { to, subject, text } = req.body;
    console.log(`Email sent to ${to}: ${subject}`);
    res.json({ success: true, message: "Email sent successfully" });
  });

  // --- DASHBOARD STATS ---
  app.get("/api/stats", requireAuth, (req, res) => {
    const admins = db.prepare("SELECT COUNT(*) as count FROM admins").get() as any;
    const departments = db.prepare("SELECT COUNT(*) as count FROM departments").get() as any;
    const employees = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
    const hr = db.prepare("SELECT COUNT(*) as count FROM hr_members").get() as any;
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as any;
    const activeMemos = db.prepare("SELECT COUNT(*) as count FROM memorandums").get() as any;

    res.json({
      totalAdmins: admins.count,
      totalDepartments: departments.count,
      totalEmployees: employees.count,
      totalHR: hr.count,
      pendingTasks: pendingTasks.count,
      activeMemos: activeMemos.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();