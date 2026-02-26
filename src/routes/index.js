import express from "express";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

const defaultRoutes = [
  { path: "/admin-auth", route: adminRoutes },
  { path: "/user-auth", route: userRoutes },
];

defaultRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
