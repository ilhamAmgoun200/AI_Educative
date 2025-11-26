# Architecture de Base de Données

## 📊 Diagramme Entité-Relation (ERD)

```
┌─────────────┐         ┌─────────────┐
│   Teacher   │         │   Student   │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ first_name  │         │ first_name  │
│ last_name   │         │ last_name   │
│ email (UK)  │         │ email (UK)  │
│ password    │         │ password    │
│ phone       │         │ phone       │
│ cin         │         │ cin         │
│ subject_id  │         │ cne         │
│ establishment│        │ birth_date  │
│ experience  │         │ branch      │
│ is_active   │         │ establishment│
│ created_at  │         │ is_active   │
│ updated_at  │         │ created_at  │
└──────┬──────┘         │ updated_at  │
       │                └──────┬──────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│   Course    │         │  Exercise   │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ title       │         │ title       │
│ description │         │ description │
│ video_url   │         │ questions   │
│ order_no    │         │ answers     │
│ is_published│         │ score       │
│ teacher_id  │◄──┐     │ course_id   │◄──┐
│ subject_id  │◄──┼──┐  │ student_id  │◄──┼──┐
│ created_at  │   │  │  │ attempt_no  │   │  │
│ updated_at  │   │  │  │ feedback    │   │  │
└─────────────┘   │  │  │ attempt_at  │   │  │
                  │  │  │ created_at  │   │  │
                  │  │  │ updated_at  │   │  │
                  │  │  └─────────────┘   │  │
                  │  │                    │  │
                  │  │                    │  │
                  │  └────────────────────┘  │
                  │                           │
                  └───────────────────────────┘
                           │
                           │ N:1
                           │
                  ┌────────▼────────┐
                  │    Subject      │
                  ├─────────────────┤
                  │ id (PK)         │
                  │ subject_name    │
                  │ description     │
                  │ level           │
                  │ created_at      │
                  │ updated_at      │
                  └─────────────────┘
```

## 📋 Schémas de Tables

### 1. Table `teachers`

```sql
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cin VARCHAR(20) UNIQUE,
    subject_id INTEGER,
    establishment VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);
```

### 2. Table `students`

```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cin VARCHAR(20) UNIQUE,
    cne VARCHAR(20) UNIQUE,
    birth_date DATE,
    branch VARCHAR(10) CHECK (branch IN ('SVT', 'PC', 'SMA', 'SMB')),
    establishment VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Table `subjects`

```sql
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Table `courses` (anciennement `lessons`)

```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    order_no INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);
```

### 5. Table `exercises` (anciennement `assessments`)

```sql
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    answers JSON,
    course_id INTEGER NOT NULL,
    student_id INTEGER,
    score DECIMAL(5,2),
    attempt_number INTEGER DEFAULT 1,
    feedback TEXT,
    attempt_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);
```

### 6. Table `course_files` (pour les PDFs)

```sql
CREATE TABLE course_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

## 🔗 Relations

1. **Teacher → Course** : 1:N (Un teacher peut avoir plusieurs courses)
2. **Student → Exercise** : 1:N (Un student peut avoir plusieurs exercises)
3. **Course → Exercise** : 1:N (Un course peut avoir plusieurs exercises)
4. **Subject → Course** : 1:N (Un subject peut avoir plusieurs courses)
5. **Subject → Teacher** : 1:N (Un subject peut avoir plusieurs teachers)
6. **Course → CourseFile** : 1:N (Un course peut avoir plusieurs fichiers)

## 📝 Index recommandés

```sql
CREATE INDEX idx_teacher_email ON teachers(email);
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_course_teacher ON courses(teacher_id);
CREATE INDEX idx_course_subject ON courses(subject_id);
CREATE INDEX idx_exercise_course ON exercises(course_id);
CREATE INDEX idx_exercise_student ON exercises(student_id);
```

