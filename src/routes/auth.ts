import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { models } from "../db";
import { validate } from "../validation/validate";
import {
  loginAuthSchema,
  registerAuthSchema,
} from "../validation/schemas/authSchema";
import { signToken } from "../utils/jwt";

const router = Router();

const { User } = models;
export default () => {
  router.post(
    "/register",
    validate({ body: registerAuthSchema }),
    async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
      const { name, surname, nickName, email, age, role, password } = req.body;

      try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({ message: "Email already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name,
          surname,
          nickName,
          age,
          email,
          role,
          password: hashedPassword,
        });
        const token = signToken({ id: newUser.id });

        res.json({
          data: { token, id: newUser.id },
          message: "User successfully registered",
        });
      } catch (err: any) {
        err.contextMessage = "Error during user registration";
        _next(err);
      }
    }
  );

  router.post(
    "/login",
    validate({ body: loginAuthSchema }),
    async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = signToken({ id: user.id });

        return res.json({
          data: { token, id: user.id },
          message: "Login successful",
        });
      } catch (err: any) {
        err.contextMessage = "Error during user login";
        _next(err);
      }
    }
  );

  return router;
};
