const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
    authenticateToken,
    authorizeRoles,
} = require("./middleware/auth");

const app = express();
const PORT = 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// PROTECTED TEST
// =====================================================

app.get(
    "/api/protected-test",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Authentication successful!",
            user: req.user,
        });
    }
);

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "School Attendance System Backend is running!"
    });
});

// =====================================================
// STUDENTS
// =====================================================

// GET all students
app.get(
    "/api/students",
    authenticateToken,
    authorizeRoles("admin","teacher"),
    (req, res) => {

        const sql = `
            SELECT
                s.student_id,
                s.lin_number,
                s.student_name,
                s.gender,
                c.class_name,
                s.class_id
            FROM students s
            JOIN classes c
                ON s.class_id = c.class_id
            ORDER BY s.student_name
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching students:", err);

                return res.status(500).json({
                    error: "Failed to fetch students"
                });
            }

            res.json(results);
        });
    }
);

// ADD student
app.post(
    "/api/students",
    authenticateToken,
    authorizeRoles("admin","teacher"),
    (req, res) => {

        const {
            lin_number,
            student_name,
            gender,
            class_id
        } = req.body;

        if (!lin_number || !student_name || !gender || !class_id) {
            return res.status(400).json({
                error: "All student fields are required"
            });
        }

        const sql = `
            INSERT INTO students
            (lin_number, student_name, gender, class_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [lin_number, student_name, gender, class_id],
            (err, result) => {

                if (err) {
                    console.error("Error adding student:", err);

                    return res.status(500).json({
                        error: "Failed to add student"
                    });
                }

                res.status(201).json({
                    message: "Student added successfully",
                    student_id: result.insertId
                });
            }
        );
    }
);

// EDIT student
app.put(
    "/api/students/:id",
    authenticateToken,
    authorizeRoles("admin","teacher"),
    (req, res) => {

        const { id } = req.params;

        const {
            lin_number,
            student_name,
            gender,
            class_id
        } = req.body;

        if (!lin_number || !student_name || !gender || !class_id) {
            return res.status(400).json({
                error: "All student fields are required"
            });
        }

        const sql = `
            UPDATE students
            SET
                lin_number = ?,
                student_name = ?,
                gender = ?,
                class_id = ?
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [
                lin_number,
                student_name,
                gender,
                class_id,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error("Error updating student:", err);

                    return res.status(500).json({
                        error: "Failed to update student"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Student not found"
                    });
                }

                res.json({
                    message: "Student updated successfully"
                });
            }
        );
    }
);

// DELETE student
app.delete(
    "/api/students/:id",
    authenticateToken,
    authorizeRoles("admin","teacher"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM students
            WHERE student_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error("Error deleting student:", err);

                return res.status(500).json({
                    error: "Failed to delete student"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Student deleted successfully"
            });
        });
    }
);


// =====================================================
// USERS
// =====================================================

// GET ALL USERS - ADMIN ONLY
app.get(
    "/api/users",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        const sql = `
            SELECT
                user_id,
                username,
                role
            FROM users
            ORDER BY user_id DESC
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching users:", err);

                return res.status(500).json({
                    error: "Failed to fetch users"
                });
            }

            res.json(results);
        });
    }
);


// DELETE USER - ADMIN ONLY
app.delete(
    "/api/users/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        const userId = req.params.id;

        try {
            // Prevent deleting the currently logged-in admin
            if (Number(userId) === Number(req.user.user_id)) {
                return res.status(400).json({
                    error: "You cannot delete your own account"
                });
            }

            const sql = `
                DELETE FROM users
                WHERE user_id = ?
            `;

            db.query(
                sql,
                [userId],
                (err, result) => {
                    if (err) {
                        console.error(
                            "Error deleting user:",
                            err
                        );

                        return res.status(500).json({
                            error: "Failed to delete user"
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            error: "User not found"
                        });
                    }

                    res.json({
                        message: "User deleted successfully"
                    });
                }
            );
        } catch (error) {
            console.error(
                "User deletion error:",
                error
            );

            res.status(500).json({
                error: "Failed to delete user"
            });
        }
    }
);

// =====================================================
// TEACHERS
// =====================================================

// GET all teachers
app.get(
    "/api/teachers",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const sql = `
            SELECT
                t.teacher_id,
                t.teacher_code,
                t.teacher_name,
                u.username
            FROM teachers t
            JOIN users u
                ON t.user_id = u.user_id
            ORDER BY t.teacher_name
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error("Error fetching teachers:", err);

                return res.status(500).json({
                    error: "Failed to fetch teachers"
                });
            }

            res.json(results);
        });
    }
);

// ADD teacher
app.post(
    "/api/teachers",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        const {
            username,
            password_hash,
            teacher_code,
            teacher_name
        } = req.body;

        if (!username || !password_hash || !teacher_code || !teacher_name) {
            return res.status(400).json({
                error: "All teacher fields are required"
            });
        }

        try {

            const hashedPassword = await bcrypt.hash(
                password_hash,
                10
            );

            const userSql = `
                INSERT INTO users
                (username, password_hash, role)
                VALUES (?, ?, 'teacher')
            `;

            db.query(
                userSql,
                [username, hashedPassword],
                (err, userResult) => {

                    if (err) {
                        console.error(
                            "Error creating teacher user:",
                            err
                        );

                        return res.status(500).json({
                            error: "Failed to create teacher user"
                        });
                    }

                    const userId = userResult.insertId;

                    const teacherSql = `
                        INSERT INTO teachers
                        (user_id, teacher_code, teacher_name)
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        teacherSql,
                        [
                            userId,
                            teacher_code,
                            teacher_name
                        ],
                        (err, teacherResult) => {

                            if (err) {
                                console.error(
                                    "Error creating teacher:",
                                    err
                                );

                                return res.status(500).json({
                                    error: "Failed to create teacher"
                                });
                            }

                            res.status(201).json({
                                message: "Teacher added successfully",
                                teacher_id: teacherResult.insertId,
                                user_id: userId
                            });
                        }
                    );
                }
            );

        } catch (error) {

            console.error(
                "Teacher password hashing error:",
                error
            );

            res.status(500).json({
                error: "Failed to create teacher"
            });
        }
    }
);

// EDIT teacher
app.put(
    "/api/teachers/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            teacher_code,
            teacher_name
        } = req.body;

        if (!teacher_code || !teacher_name) {
            return res.status(400).json({
                error: "Teacher code and teacher name are required"
            });
        }

        const sql = `
            UPDATE teachers
            SET
                teacher_code = ?,
                teacher_name = ?
            WHERE teacher_id = ?
        `;

        db.query(
            sql,
            [teacher_code, teacher_name, id],
            (err, result) => {

                if (err) {
                    console.error("Error updating teacher:", err);

                    return res.status(500).json({
                        error: "Failed to update teacher"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Teacher not found"
                    });
                }

                res.json({
                    message: "Teacher updated successfully"
                });
            }
        );
    }
);

// DELETE teacher
app.delete(
    "/api/teachers/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const findSql = `
            SELECT user_id
            FROM teachers
            WHERE teacher_id = ?
        `;

        db.query(findSql, [id], (err, results) => {

            if (err) {
                console.error("Error finding teacher:", err);

                return res.status(500).json({
                    error: "Failed to find teacher"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: "Teacher not found"
                });
            }

            const userId = results[0].user_id;

            const deleteTeacherSql = `
                DELETE FROM teachers
                WHERE teacher_id = ?
            `;

            db.query(
                deleteTeacherSql,
                [id],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error deleting teacher:",
                            err
                        );

                        return res.status(500).json({
                            error: "Failed to delete teacher"
                        });
                    }

                    const deleteUserSql = `
                        DELETE FROM users
                        WHERE user_id = ?
                    `;

                    db.query(
                        deleteUserSql,
                        [userId],
                        (err) => {

                            if (err) {
                                console.error(
                                    "Error deleting user:",
                                    err
                                );

                                return res.status(500).json({
                                    error:
                                        "Teacher deleted, but user account could not be deleted"
                                });
                            }

                            res.json({
                                message:
                                    "Teacher deleted successfully"
                            });
                        }
                    );
                }
            );
        });
    }
);

// =====================================================
// CLASSES
// =====================================================

// GET classes
app.get(
    "/api/classes",
    authenticateToken,
    authorizeRoles("admin","teacher"),
    (req, res) => {

        const sql = `
            SELECT
                c.class_id,
                c.class_name,
                c.class_teacher_id,
                t.teacher_code,
                t.teacher_name
            FROM classes c
            LEFT JOIN teachers t
                ON c.class_teacher_id = t.teacher_id
            ORDER BY c.class_name
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error("Error fetching classes:", err);

                return res.status(500).json({
                    error: "Failed to fetch classes"
                });
            }

            res.json(results);
        });
    }
);

// ADD class
app.post(
    "/api/classes",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const {
            class_name,
            class_teacher_id
        } = req.body;

        if (!class_name) {
            return res.status(400).json({
                error: "Class name is required"
            });
        }

        const sql = `
            INSERT INTO classes
            (class_name, class_teacher_id)
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [class_name, class_teacher_id || null],
            (err, result) => {

                if (err) {
                    console.error("Error adding class:", err);

                    return res.status(500).json({
                        error: "Failed to add class"
                    });
                }

                res.status(201).json({
                    message: "Class added successfully",
                    class_id: result.insertId
                });
            }
        );
    }
);

// EDIT class
app.put(
    "/api/classes/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            class_name,
            class_teacher_id
        } = req.body;

        if (!class_name) {
            return res.status(400).json({
                error: "Class name is required"
            });
        }

        const sql = `
            UPDATE classes
            SET
                class_name = ?,
                class_teacher_id = ?
            WHERE class_id = ?
        `;

        db.query(
            sql,
            [
                class_name,
                class_teacher_id || null,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error("Error updating class:", err);

                    return res.status(500).json({
                        error: "Failed to update class"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Class not found"
                    });
                }

                res.json({
                    message: "Class updated successfully"
                });
            }
        );
    }
);

// DELETE class
app.delete(
    "/api/classes/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM classes
            WHERE class_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error("Error deleting class:", err);

                return res.status(500).json({
                    error: "Failed to delete class"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Class not found"
                });
            }

            res.json({
                message: "Class deleted successfully"
            });
        });
    }
);

// =====================================================
// SUBJECTS
// =====================================================

// GET subjects
app.get(
    "/api/subjects",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const sql = `
            SELECT
                subject_id,
                subject_code,
                subject_name
            FROM subjects
            ORDER BY subject_name
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error("Error fetching subjects:", err);

                return res.status(500).json({
                    error: "Failed to fetch subjects"
                });
            }

            res.json(results);
        });
    }
);

// ADD subject
app.post(
    "/api/subjects",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const {
            subject_code,
            subject_name
        } = req.body;

        if (!subject_code || !subject_name) {
            return res.status(400).json({
                error: "Subject code and subject name are required"
            });
        }

        const sql = `
            INSERT INTO subjects
            (subject_code, subject_name)
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [subject_code, subject_name],
            (err, result) => {

                if (err) {
                    console.error("Error adding subject:", err);

                    return res.status(500).json({
                        error: "Failed to add subject"
                    });
                }

                res.status(201).json({
                    message: "Subject added successfully",
                    subject_id: result.insertId
                });
            }
        );
    }
);

// EDIT subject
app.put(
    "/api/subjects/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            subject_code,
            subject_name
        } = req.body;

        if (!subject_code || !subject_name) {
            return res.status(400).json({
                error: "Subject code and subject name are required"
            });
        }

        const sql = `
            UPDATE subjects
            SET
                subject_code = ?,
                subject_name = ?
            WHERE subject_id = ?
        `;

        db.query(
            sql,
            [subject_code, subject_name, id],
            (err, result) => {

                if (err) {
                    console.error("Error updating subject:", err);

                    return res.status(500).json({
                        error: "Failed to update subject"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Subject not found"
                    });
                }

                res.json({
                    message: "Subject updated successfully"
                });
            }
        );
    }
);

// DELETE subject
app.delete(
    "/api/subjects/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM subjects
            WHERE subject_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error("Error deleting subject:", err);

                return res.status(500).json({
                    error: "Failed to delete subject"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Subject not found"
                });
            }

            res.json({
                message: "Subject deleted successfully"
            });
        });
    }
);

// =====================================================
// TEACHER ASSIGNMENTS
// =====================================================

// GET assignments
app.get(
    "/api/assignments",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const sql = `
            SELECT
                ta.assignment_id,
                t.teacher_id,
                t.teacher_code,
                t.teacher_name,
                sub.subject_id,
                sub.subject_code,
                sub.subject_name,
                c.class_id,
                c.class_name
            FROM teacher_assignments ta
            JOIN teachers t
                ON ta.teacher_id = t.teacher_id
            JOIN subjects sub
                ON ta.subject_id = sub.subject_id
            JOIN classes c
                ON ta.class_id = c.class_id
            ORDER BY c.class_name, sub.subject_name
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error(
                    "Error fetching assignments:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to fetch assignments"
                });
            }

            res.json(results);
        });
    }
);

// ADD assignment
app.post(
    "/api/assignments",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const {
            teacher_id,
            subject_id,
            class_id
        } = req.body;

        if (!teacher_id || !subject_id || !class_id) {
            return res.status(400).json({
                error: "Teacher, subject and class are required"
            });
        }

        const sql = `
            INSERT INTO teacher_assignments
            (teacher_id, subject_id, class_id)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [teacher_id, subject_id, class_id],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error adding assignment:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to add assignment"
                    });
                }

                res.status(201).json({
                    message: "Assignment added successfully",
                    assignment_id: result.insertId
                });
            }
        );
    }
);

// EDIT assignment
app.put(
    "/api/assignments/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            teacher_id,
            subject_id,
            class_id
        } = req.body;

        if (!teacher_id || !subject_id || !class_id) {
            return res.status(400).json({
                error: "Teacher, subject and class are required"
            });
        }

        const sql = `
            UPDATE teacher_assignments
            SET
                teacher_id = ?,
                subject_id = ?,
                class_id = ?
            WHERE assignment_id = ?
        `;

        db.query(
            sql,
            [
                teacher_id,
                subject_id,
                class_id,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error updating assignment:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to update assignment"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Assignment not found"
                    });
                }

                res.json({
                    message:
                        "Assignment updated successfully"
                });
            }
        );
    }
);

// DELETE assignment
app.delete(
    "/api/assignments/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM teacher_assignments
            WHERE assignment_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error(
                    "Error deleting assignment:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to delete assignment"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Assignment not found"
                });
            }

            res.json({
                message:
                    "Assignment deleted successfully"
            });
        });
    }
);

// =====================================================
// TIMETABLE
// =====================================================

// GET timetable
app.get(
    "/api/timetable",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const sql = `
            SELECT
                tt.timetable_id,
                tt.assignment_id,
                tt.day_of_week,
                tt.period_number,
                tt.start_time,
                tt.end_time,
                t.teacher_id,
                t.teacher_code,
                t.teacher_name,
                sub.subject_id,
                sub.subject_code,
                sub.subject_name,
                c.class_id,
                c.class_name
            FROM timetable tt
            JOIN teacher_assignments ta
                ON tt.assignment_id = ta.assignment_id
            JOIN teachers t
                ON ta.teacher_id = t.teacher_id
            JOIN subjects sub
                ON ta.subject_id = sub.subject_id
            JOIN classes c
                ON ta.class_id = c.class_id
            ORDER BY
                FIELD(
                    tt.day_of_week,
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ),
                tt.period_number
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error(
                    "Error fetching timetable:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to fetch timetable"
                });
            }

            res.json(results);
        });
    }
);

// ADD timetable entry
app.post(
    "/api/timetable",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const {
            assignment_id,
            day_of_week,
            period_number,
            start_time,
            end_time
        } = req.body;

        if (
            !assignment_id ||
            !day_of_week ||
            !period_number ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                error: "All timetable fields are required"
            });
        }

        const sql = `
            INSERT INTO timetable
            (
                assignment_id,
                day_of_week,
                period_number,
                start_time,
                end_time
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                assignment_id,
                day_of_week,
                period_number,
                start_time,
                end_time
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error adding timetable entry:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to add timetable entry"
                    });
                }

                res.status(201).json({
                    message:
                        "Timetable entry added successfully",
                    timetable_id: result.insertId
                });
            }
        );
    }
);

// EDIT timetable
app.put(
    "/api/timetable/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            assignment_id,
            day_of_week,
            period_number,
            start_time,
            end_time
        } = req.body;

        if (
            !assignment_id ||
            !day_of_week ||
            !period_number ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                error: "All timetable fields are required"
            });
        }

        const sql = `
            UPDATE timetable
            SET
                assignment_id = ?,
                day_of_week = ?,
                period_number = ?,
                start_time = ?,
                end_time = ?
            WHERE timetable_id = ?
        `;

        db.query(
            sql,
            [
                assignment_id,
                day_of_week,
                period_number,
                start_time,
                end_time,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error updating timetable:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to update timetable"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error:
                            "Timetable entry not found"
                    });
                }

                res.json({
                    message:
                        "Timetable entry updated successfully"
                });
            }
        );
    }
);

// DELETE timetable entry
app.delete(
    "/api/timetable/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM timetable
            WHERE timetable_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error(
                    "Error deleting timetable:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to delete timetable entry"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error:
                        "Timetable entry not found"
                });
            }

            res.json({
                message:
                    "Timetable entry deleted successfully"
            });
        });
    }
);

// =====================================================
// ATTENDANCE
// =====================================================

// GET attendance
app.get(
    "/api/attendance",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const sql = `
            SELECT
                a.attendance_id,
                a.attendance_date,
                a.status,
                a.marked_at,
                s.student_id,
                s.lin_number,
                s.student_name,
                c.class_id,
                c.class_name,
                sub.subject_id,
                sub.subject_code,
                sub.subject_name,
                t.teacher_id,
                t.teacher_code,
                t.teacher_name,
                tt.timetable_id,
                tt.day_of_week,
                tt.period_number,
                tt.start_time,
                tt.end_time
            FROM attendance a
            JOIN students s
                ON a.student_id = s.student_id
            JOIN timetable tt
                ON a.timetable_id = tt.timetable_id
            JOIN teacher_assignments ta
                ON tt.assignment_id = ta.assignment_id
            JOIN classes c
                ON ta.class_id = c.class_id
            JOIN subjects sub
                ON ta.subject_id = sub.subject_id
            JOIN teachers t
                ON ta.teacher_id = t.teacher_id
            ORDER BY
                a.attendance_date DESC,
                tt.period_number,
                s.student_name
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error(
                    "Error fetching attendance:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to fetch attendance"
                });
            }

            res.json(results);
        });
    }
);

// MARK attendance
app.post(
    "/api/attendance",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const {
            student_id,
            timetable_id,
            attendance_date,
            status
        } = req.body;

        if (
            !student_id ||
            !timetable_id ||
            !attendance_date ||
            !status
        ) {
            return res.status(400).json({
                error:
                    "All attendance fields are required"
            });
        }

        const sql = `
            INSERT INTO attendance
            (
                student_id,
                timetable_id,
                attendance_date,
                status
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_id,
                timetable_id,
                attendance_date,
                status
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error marking attendance:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to mark attendance"
                    });
                }

                res.status(201).json({
                    message:
                        "Attendance marked successfully",
                    attendance_id: result.insertId
                });
            }
        );
    }
);

// EDIT attendance
app.put(
    "/api/attendance/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error:
                    "Attendance status is required"
            });
        }

        const sql = `
            UPDATE attendance
            SET status = ?
            WHERE attendance_id = ?
        `;

        db.query(
            sql,
            [status, id],
            (err, result) => {

                if (err) {
                    console.error(
                        "Error updating attendance:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to update attendance"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error:
                            "Attendance record not found"
                    });
                }

                res.json({
                    message:
                        "Attendance updated successfully"
                });
            }
        );
    }
);

// DELETE attendance
app.delete(
    "/api/attendance/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher"),
    (req, res) => {

        const { id } = req.params;

        const sql = `
            DELETE FROM attendance
            WHERE attendance_id = ?
        `;

        db.query(sql, [id], (err, result) => {

            if (err) {
                console.error(
                    "Error deleting attendance:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to delete attendance"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error:
                        "Attendance record not found"
                });
            }

            res.json({
                message:
                    "Attendance deleted successfully"
            });
        });
    }
);

// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message:
                "Username and password are required"
        });
    }

    try {

        const [users] = await db.promise().query(
            `
            SELECT
                user_id,
                username,
                password_hash,
                role
            FROM users
            WHERE username = ?
            `,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message:
                    "Invalid username or password"
            });
        }

        const user = users[0];

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
            process.env.JWT_SECRET ||
                "school_attendance_super_secret_2026",
            {
                expiresIn: "8h",
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});