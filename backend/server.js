const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "development_secret";

const UPLOAD_DIR = path.resolve(
    process.env.UPLOAD_DIR || "./uploads"
);

const MAX_FILE_SIZE =
    Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;


// ======================================================
// CREATE UPLOAD FOLDER
// ======================================================

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, {
        recursive: true
    });
}


// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

app.use(helmet());

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ]
}));

app.use(express.json({
    limit: "1mb"
}));


// ======================================================
// RATE LIMIT
// ======================================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);


// ======================================================
// DEMO USER DATABASE
// ======================================================

const users = [];


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, UPLOAD_DIR);

    },

    filename: function (req, file, cb) {

        const randomName =
            crypto.randomBytes(32).toString("hex");

        const extension =
            path.extname(file.originalname)
                .toLowerCase();

        cb(
            null,
            randomName + extension
        );

    }

});


// ======================================================
// ALLOWED FILE TYPES
// ======================================================

const allowedTypes = {

    "application/pdf": ".pdf",

    "image/jpeg": ".jpg",

    "image/png": ".png"

};


// ======================================================
// FILE FILTER
// ======================================================

function fileFilter(req, file, cb) {

    if (allowedTypes[file.mimetype]) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF, JPG and PNG files are allowed."
            )
        );

    }

}


// ======================================================
// UPLOAD CONFIGURATION
// ======================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        fileSize: MAX_FILE_SIZE,

        files: 1

    }

});


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({

            error:
                "Authentication required."

        });

    }

    const token =
        authHeader.split(" ")[1];

    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({

            error:
                "Invalid or expired token."

        });

    }

}


// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.json({

        application:
            "DigiVault Government Portal",

        status:
            "Backend is running",

        version:
            "1.0.0"

    });

});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {

    res.json({

        status:
            "DigiVault backend running",

        secureStorage:
            true

    });

});


// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                error:
                    "Name, email and password are required."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                error:
                    "Password must contain at least 8 characters."

            });

        }


        const existingUser =
            users.find(
                user =>
                    user.email === email
            );


        if (existingUser) {

            return res.status(409).json({

                error:
                    "User already exists."

            });

        }


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const user = {

            id:
                crypto.randomUUID(),

            name,

            email,

            passwordHash

        };


        users.push(user);


        res.status(201).json({

            message:
                "Account created successfully."

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Registration failed."

        });

    }

});


// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            users.find(
                user =>
                    user.email === email
            );


        if (!user) {

            return res.status(401).json({

                error:
                    "Invalid email or password."

            });

        }


        const validPassword =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!validPassword) {

            return res.status(401).json({

                error:
                    "Invalid email or password."

            });

        }


        const token =
            jwt.sign(

                {

                    userId:
                        user.id,

                    email:
                        user.email

                },

                JWT_SECRET,

                {

                    expiresIn:
                        "1h"

                }

            );


        res.json({

            message:
                "Login successful.",

            token

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Login failed."

        });

    }

});


// ======================================================
// UPLOAD DOCUMENT
// ======================================================

app.post(
    "/api/documents/upload",

    authenticateToken,

    upload.single("document"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    error:
                        "No document uploaded."

                });

            }


            const documentId =
                crypto.randomUUID();


            res.status(201).json({

                message:
                    "Document uploaded securely.",

                document: {

                    id:
                        documentId,

                    name:
                        req.file.originalname,

                    storedFile:
                        req.file.filename,

                    size:
                        req.file.size,

                    type:
                        req.file.mimetype,

                    uploadedAt:
                        new Date().toISOString()

                }

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Document upload failed."

            });

        }

    }
);


// ======================================================
// VERIFY DOCUMENT
// ======================================================

app.post(
    "/api/documents/verify",

    authenticateToken,

    (req, res) => {

        const {
            documentType,
            documentNumber,
            issuer
        } = req.body;


        if (
            !documentType ||
            !documentNumber ||
            !issuer
        ) {

            return res.status(400).json({

                verified:
                    false,

                error:
                    "Please provide all verification details."

            });

        }


        // Demo verification response

        res.json({

            verified:
                true,

            documentType,

            issuer,

            message:
                "Document successfully verified in demo mode.",

            verifiedAt:
                new Date().toISOString()

        });

    }
);


// ======================================================
// DOWNLOAD DOCUMENT
// ======================================================

app.get(
    "/api/documents/:filename",

    authenticateToken,

    (req, res) => {

        const filename =
            path.basename(
                req.params.filename
            );


        const filePath =
            path.join(
                UPLOAD_DIR,
                filename
            );


        if (
            !fs.existsSync(filePath)
        ) {

            return res.status(404).json({

                error:
                    "Document not found."

            });

        }


        res.download(filePath);

    }
);


// ======================================================
// DELETE DOCUMENT
// ======================================================

app.delete(
    "/api/documents/:filename",

    authenticateToken,

    (req, res) => {

        const filename =
            path.basename(
                req.params.filename
            );


        const filePath =
            path.join(
                UPLOAD_DIR,
                filename
            );


        if (
            !fs.existsSync(filePath)
        ) {

            return res.status(404).json({

                error:
                    "Document not found."

            });

        }


        fs.unlink(
            filePath,
            error => {

                if (error) {

                    return res.status(500).json({

                        error:
                            "Unable to delete document."

                    });

                }


                res.json({

                    message:
                        "Document securely deleted."

                });

            }
        );

    }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(error);


        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    error:
                        "File size cannot exceed 5 MB."

                });

            }

        }


        res.status(400).json({

            error:
                error.message ||
                "Something went wrong."

        });

    }
);


// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log("======================================");
        console.log("       DIGIVAULT BACKEND SERVER");
        console.log("======================================");
        console.log(
            `Server running at http://localhost:${PORT}`
        );
        console.log(
            `Health check: http://localhost:${PORT}/api/health`
        );
        console.log(
            `Private uploads: ${UPLOAD_DIR}`
        );
        console.log("======================================");
        console.log("");

    }
);