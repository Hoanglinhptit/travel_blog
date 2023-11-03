/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { Request, Response } from "express";
import { prisma } from "../../prisma/prisma";
import { ResponseBody } from "../types";
import { TokenRequest } from "src/middlewares/Authentication";

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

  const access_token = jwt.sign(
    {
      sub: user.id,
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    TOKEN_SECRET,
    {
      expiresIn: "24h",
    },
  );

  return res.status(200).json({
    data: { access_token, name: user.name, role: user.role, id: user.id },
  });
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
    // role,
  };

  const newUser = await prisma.users.create({ data: userData });

  return res.status(200).json(newUser);
};
const getUsers: any = async (req: Request, res: Response) => {
  const { keySearch, limit, pageIndex } = req.query as {
    keySearch?: string;
    limit?: string;
    pageIndex?: string;
  };

  const search: string = keySearch || "";
  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };
  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      ...pagination,
      where: {
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
      },
      include: {
        posts: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.users.count({
      where: {
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
      },
    }),
  ]);

  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));

  return res.status(200).json({
    users,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
  });
};
const updateUser: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as {
    role: string;
  };

  // Determine the role of the requester (user or admin)

  const updatedUser = await prisma.users.update({
    where: { id: Number(id) },
    data: {
      role: role,
    },
  });

  return res.status(200).json(updatedUser);
};
const deleteUser: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;

  await prisma.users.delete({
    where: { id: Number(id) },
  });

  res.status(204).send();
};

export { login, register, getUsers, updateUser, deleteUser };
