-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Purchases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,
    "cardType" TEXT NOT NULL,
    "cardNumbers" INTEGER NOT NULL,
    "expMonthDate" TEXT NOT NULL,
    "expYearDate" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    CONSTRAINT "Purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Purchases" ("address", "cardNumbers", "cardType", "city", "expMonthDate", "expYearDate", "id", "name", "state", "total", "userId", "zip") SELECT "address", "cardNumbers", "cardType", "city", "expMonthDate", "expYearDate", "id", "name", "state", "total", "userId", "zip" FROM "Purchases";
DROP TABLE "Purchases";
ALTER TABLE "new_Purchases" RENAME TO "Purchases";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
