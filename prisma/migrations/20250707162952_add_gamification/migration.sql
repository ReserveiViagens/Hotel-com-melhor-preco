/*
  Warnings:

  - You are about to drop the column `active` on the `promotions` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `promotions` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `promotions` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `promotions` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `promotions` table. All the data in the column will be lost.
  - Added the required column `applicableModules` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conditions` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `promotions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "notification_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notification_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "error" TEXT
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_login_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "user_login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_promotions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "minValue" REAL,
    "maxDiscount" REAL,
    "validFrom" DATETIME,
    "validUntil" DATETIME,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "applicableModules" JSONB NOT NULL,
    "conditions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_promotions" ("code", "createdAt", "currentUses", "description", "id", "maxUses", "updatedAt") SELECT "code", "createdAt", "currentUses", "description", "id", "maxUses", "updatedAt" FROM "promotions";
DROP TABLE "promotions";
ALTER TABLE "new_promotions" RENAME TO "promotions";
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "phone" TEXT,
    "cpf" TEXT,
    "birthDate" DATETIME,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "segments" JSONB,
    "gamificationPoints" INTEGER NOT NULL DEFAULT 0,
    "gamificationLevel" INTEGER NOT NULL DEFAULT 1,
    "gamificationExperience" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("active", "address", "avatar", "birthDate", "city", "cpf", "createdAt", "email", "id", "name", "password", "phone", "role", "state", "updatedAt", "zipCode") SELECT "active", "address", "avatar", "birthDate", "city", "cpf", "createdAt", "email", "id", "name", "password", "phone", "role", "state", "updatedAt", "zipCode" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "notification_subscriptions_userId_key" ON "notification_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");
