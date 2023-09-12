"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const prisma_1 = require("../../prisma/prisma");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const emailCheck = validator_1.default.isEmail(email);
    if (!emailCheck) {
        return res.status(422).json({
            errors: [
                {
                    field: "email",
                    message: "Invalid email",
                },
            ],
            message: "Invalid credentials",
        });
    }
    const user = yield prisma_1.prisma.users.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ errors: [], message: "Invalid credentials" });
    }
    const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ errors: [], message: "Invalid credentials" });
    }
    const access_token = jsonwebtoken_1.default.sign({ sub: user.id, id: user.id, role: user.role }, TOKEN_SECRET, {
        expiresIn: "3h",
    });
    return res.status(200).json({
        data: { access_token, name: user.name, role: user.role, id: user.id },
    });
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    const emailCheck = validator_1.default.isEmail(email);
    if (!emailCheck) {
        return res.status(422).json({
            errors: [
                {
                    field: "email",
                    message: "Invalid email",
                },
            ],
            message: "Invalid credentials",
        });
    }
    const userCheck = yield prisma_1.prisma.users.findUnique({ where: { email } });
    if (userCheck) {
        return res.json({
            message: "User is valid. Please SignUp to create a new one",
        });
    }
    const hashPassword = yield bcrypt_1.default.hash(password, 10);
    if (!hashPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const userData = {
        email,
        name,
        password: hashPassword,
        // role,
    };
    const newUser = yield prisma_1.prisma.users.create({ data: userData });
    return res.status(200).json(newUser);
});
exports.register = register;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keySearch, limit, pageIndex } = req.query;
    const search = keySearch || "";
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const listUser = yield prisma_1.prisma.users.findMany(Object.assign(Object.assign({}, pagination), { where: {
            name: {
                contains: search,
            },
            OR: [
                {
                    email: {
                        endsWith: "@post.vn",
                    },
                },
                { email: { endsWith: "@gmail.com" } },
            ],
        } }));
    return res.status(200).json(listUser);
});
exports.getUsers = getUsers;
//# sourceMappingURL=AuthControllers.js.map