import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, RequestHandler, Response } from "express";

const TOKEN_SECRET = "09f26e402586e2faa8da4c98a35f1b20d6b033c60";
exports.TOKEN_SECRET = TOKEN_SECRET;
const prisma = new PrismaClient();

const login = async (req: Request, res: Response) => {
  console.log("running this route login");

  //   const { password } = req.body;
  //   const email = (req.body as { email: string }).email;
  //   try {
  //     const userCheck = await prisma.user.findUnique({ where: { email } });

  //     if (!userCheck) {
  //       return res.json({ msg: "error" });
  //     }

  //     const passwordMatch = await bcrypt.compare(password, userCheck.password);

  //     if (!passwordMatch) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const token = jwt.sign(
  //       { userId: userCheck.id, role: userCheck.role },
  //       TOKEN_SECRET,
  //       {
  //         expiresIn: "2h",
  //       }
  //     );
  //     return res
  //       .status(200)
  //       .json({ token, name: userCheck.name, role: userCheck.role });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: "Internal server error" });
  //   }
};
const register = async (req: Request, res: Response) => {
  const { email, password, role, name } = req.body;
  try {
    const userCheck = await prisma.user.findUnique({ where: { email } });

    if (!userCheck) {
      return res.json({
        msg: "User is valid. Please SignUp to create a new one",
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { login };
