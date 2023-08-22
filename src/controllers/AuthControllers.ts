import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { Request, Response } from "express";
import { prisma } from "../../prisma/prisma";
import { ResponseBody } from "../types";

const TOKEN_SECRET = process.env.TOKEN_SECRET!;

const login = async (req: Request, res: Response<ResponseBody>) => {
  const { email, password } = req.body;
  const emailCheck = validator.isEmail(email);

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

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ errors: [], message: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ errors: [], message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, id: user.id, role: user.role },
    TOKEN_SECRET,
    {
      expiresIn: "3h",
    },
  );

  return res
    .status(200)
    .json({ data: { token, name: user.name, role: user.role } });
};

const register = async (req: Request, res: Response) => {
  const { email, password, role, name } = req.body;
  const emailCheck = validator.isEmail(email);
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
  const userCheck = await prisma.user.findUnique({ where: { email } });

  if (userCheck) {
    return res.json({
      message: "User is valid. Please SignUp to create a new one",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  if (!hashPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const userData = {
    email,
    name,
    role,
    password: hashPassword,
  };

  const newUser = await prisma.user.create({ data: userData });

  return res.status(200).json(newUser);
};

export { login, register };
