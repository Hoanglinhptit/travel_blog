import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { Request, Response } from "express";
import { prisma } from "../../prisma/prisma";
import { ResponseBody } from "../types";
import { Prisma } from "@prisma/client";

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

  const user = await prisma.users.findUnique({ where: { email } });

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
  const { email, password, name } = req.body;
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
  const userCheck = await prisma.users.findUnique({ where: { email } });

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
    password: hashPassword,
  };

  const newUser = await prisma.users.create({ data: userData });

  return res.status(200).json(newUser);
};
const getUsers = async (req: Request, res: Response) => {
  const { keySearch, limit, pageIndex } = req.query!;

  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const listUser = await prisma.users.findMany({
    ...pagination,
    where: {
      OR: [
        {
          email: {
            endsWith: "post.vn",
          },
        },
        { email: { endsWith: "gmail.com" } },
      ],
    },
  });
  return res.status(200).json(listUser);
};

export { login, register, getUsers };
