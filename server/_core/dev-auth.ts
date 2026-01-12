/**
 * 開発用シンプル認証
 * OAuthサーバーなしでログインできるようにする
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

export function registerDevAuthRoutes(app: Express) {
    // 開発用ログインエンドポイント
    app.post("/api/dev-login", async (req: Request, res: Response) => {
        try {
            const { email = "admin@crewai.jp", name = "Admin User" } = req.body || {};

            // ユニークなopenIdを生成
            const openId = `dev_user_${Date.now()}`;

            // ユーザーをDBに作成/更新
            await db.upsertUser({
                openId,
                name,
                email,
                loginMethod: "dev",
                lastSignedIn: new Date(),
                role: "admin",
            });

            // JWTトークンを生成 (joseライブラリ使用)
            const secretKey = new TextEncoder().encode(ENV.cookieSecret || "dev-secret-key");
            const token = await new SignJWT({
                openId,
                appId: ENV.appId,
                name,
            })
                .setProtectedHeader({ alg: "HS256", typ: "JWT" })
                .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
                .sign(secretKey);

            // クッキーにセット
            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

            res.json({
                success: true,
                message: "ログイン成功",
                user: { openId, name, email }
            });
        } catch (error) {
            console.error("[Dev Auth] Login failed:", error);
            res.status(500).json({ error: "ログインに失敗しました" });
        }
    });

    // 開発用ログアウトエンドポイント
    app.post("/api/dev-logout", (req: Request, res: Response) => {
        res.clearCookie(COOKIE_NAME);
        res.json({ success: true, message: "ログアウト成功" });
    });
}
