-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'FOUNDER');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('LOW', 'NORMAL', 'GOOD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INFLOW', 'OUTFLOW');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('ONETIME', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FOUNDER',
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightRunway" INTEGER NOT NULL DEFAULT 50,
    "weightSentiment" INTEGER NOT NULL DEFAULT 20,
    "weightPipeline" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "startedOn" TIMESTAMP(3),
    "address" TEXT,
    "logoUrl" TEXT,
    "gstNo" TEXT,
    "statutoryDoc" TEXT,
    "management" JSONB DEFAULT '[]',
    "parentId" TEXT NOT NULL,
    "founderName" TEXT,
    "founderEmail" TEXT,
    "mobileNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "designation" TEXT,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'ONETIME',
    "attachments" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyStat" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "weekEnding" TIMESTAMP(3) NOT NULL,
    "cashInflow" DECIMAL(15,2) NOT NULL,
    "cashOutflow" DECIMAL(15,2) NOT NULL,
    "newOrders" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "receivables" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "receivablesCollected" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'NORMAL',
    "sentiment" INTEGER NOT NULL DEFAULT 5,
    "assetUtilisation" INTEGER NOT NULL DEFAULT 3,
    "majorChallenges" TEXT,
    "cashShortageRisk" BOOLEAN NOT NULL DEFAULT false,
    "cashShortageAmount" DECIMAL(15,2),
    "peopleChanges" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyStat" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "debtors0to30" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "debtors31to60" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "debtors61to90" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "debtors90plus" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "creditorsTotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "assetCondition" TEXT,
    "attendanceAvg" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyCustomers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IndexConfig_userId_key" ON "IndexConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyStat_companyId_weekEnding_key" ON "WeeklyStat"("companyId", "weekEnding");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyStat_companyId_month_year_key" ON "MonthlyStat"("companyId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyCustomers_AB_unique" ON "_CompanyCustomers"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyCustomers_B_index" ON "_CompanyCustomers"("B");

-- AddForeignKey
ALTER TABLE "IndexConfig" ADD CONSTRAINT "IndexConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyStat" ADD CONSTRAINT "WeeklyStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyStat" ADD CONSTRAINT "MonthlyStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyCustomers" ADD CONSTRAINT "_CompanyCustomers_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyCustomers" ADD CONSTRAINT "_CompanyCustomers_B_fkey" FOREIGN KEY ("B") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
