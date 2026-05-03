-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "ClassSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'EXCUSED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CheckInMethod" AS ENUM ('QR_SCAN', 'MANUAL', 'KIOSK_TAP', 'APP');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'WAITLISTED', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BeltTestStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BeltTestResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL_PASS');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT', 'CASH', 'CHECK', 'BARTER', 'COUPON', 'COMP');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('MONTHLY', 'ANNUAL', 'DROP_IN', 'CLASS_PACK', 'PER_TEST', 'FREE_TRIAL', 'INTRO_PACK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "StripeConnectMode" AS ENUM ('EXPRESS', 'STANDARD');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('CLASS_REMINDER', 'CLASS_CANCELLED', 'BELT_TEST', 'BILLING', 'PROMOTION', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('GUARDIAN', 'CHILD', 'SPOUSE');

-- CreateEnum
CREATE TYPE "OrgRelationType" AS ENUM ('AFFILIATION', 'WHITE_LABEL', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('ORGANIZATION', 'PROGRAM', 'TOURNAMENT', 'EVENT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SEMINAR', 'WORKSHOP', 'BIRTHDAY_PARTY', 'SUMMER_CAMP', 'OPEN_MAT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CANCELLED', 'ATTENDED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'NO_CONTEST', 'BYE');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN_POINTS', 'WIN_SUBMISSION', 'WIN_KO_TKO', 'WIN_DECISION', 'WIN_DQ', 'WIN_DEFAULT', 'DRAW', 'NO_CONTEST');

-- CreateEnum
CREATE TYPE "FightRecordType" AS ENUM ('TOURNAMENT', 'EXHIBITION', 'SMOKER', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'TRIAL_BOOKED', 'TRIAL_COMPLETED', 'CONVERTED', 'LOST', 'NURTURE');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'EVENT', 'PARTNER', 'AD_CAMPAIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "ScoringMethod" AS ENUM ('POINTS', 'SUBMISSION', 'DECISION', 'DISQUALIFICATION', 'TIME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MatAssignmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'YOUTUBE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "CertificateDeliveryMethod" AS ENUM ('DIGITAL', 'PHYSICAL', 'BOTH');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "TechniqueCategory" AS ENUM ('STRIKE', 'KICK', 'THROW', 'SUBMISSION', 'SWEEP', 'ESCAPE', 'BLOCK', 'FORM', 'DRILL', 'CONDITIONING', 'TRANSITION', 'TAKEDOWN');

-- CreateEnum
CREATE TYPE "TechniquePosition" AS ENUM ('STANDING', 'GUARD', 'HALF_GUARD', 'MOUNT', 'SIDE_CONTROL', 'BACK', 'TURTLE', 'CLINCH', 'OPEN');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "TechniqueProgressStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'DRILLING', 'SPARRING', 'MASTERED');

-- CreateEnum
CREATE TYPE "FavoriteEntityType" AS ENUM ('TECHNIQUE', 'CONTENT_ATOM', 'EVENT', 'USER_PROFILE', 'COURSE', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "ContentSourceType" AS ENUM ('MANUAL', 'VOICE_MEMO', 'VIDEO_CAPTURE', 'CLASS_NOTE', 'TOURNAMENT_RESULT', 'SESSION_FILE', 'WIKI_PAGE', 'IPHONE_SHORTCUT', 'OPERATOR_REQUEST');

-- CreateEnum
CREATE TYPE "EntitlementSourceType" AS ENUM ('PURCHASE', 'SUBSCRIPTION', 'MANUAL_GRANT', 'MEMBERSHIP', 'PROMO');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "LineageRelationType" ADD VALUE 'INSTRUCTOR_STUDENT';

-- AlterTable
ALTER TABLE "ContentAtom" ADD COLUMN     "sourceType" "ContentSourceType";

-- AlterTable
ALTER TABLE "DirectoryProfile" ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "videoIntroUrl" TEXT;

-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "defaultInstructorTitle" TEXT;

-- AlterTable
ALTER TABLE "GamificationEvent" ADD COLUMN     "attendanceId" TEXT,
ADD COLUMN     "beltTestRegistrationId" TEXT,
ADD COLUMN     "curriculumItemCompletionId" TEXT,
ADD COLUMN     "techniqueId" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "displayTitle" TEXT;

-- AlterTable
ALTER TABLE "TournamentDiscipline" ADD COLUMN     "ruleSetId" TEXT;

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "enforceAgeCap" BOOLEAN NOT NULL DEFAULT false,
    "maxEnrollment" INTEGER,
    "minEnrollment" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "disciplineId" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCourse" (
    "programId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("programId","courseId")
);

-- CreateTable
CREATE TABLE "ProgramWaiver" (
    "programId" TEXT NOT NULL,
    "waiverId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramWaiver_pkey" PRIMARY KEY ("programId","waiverId")
);

-- CreateTable
CREATE TABLE "ProgramEnrollment" (
    "id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "waitlistPosition" INTEGER,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "daysOfWeek" "DayOfWeek"[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "rrule" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Denver',
    "effectiveFrom" DATE,
    "effectiveTo" DATE,
    "capacity" INTEGER,
    "locationName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "disciplineId" TEXT,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassInstructorAssignment" (
    "id" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classScheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClassInstructorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "substituteInstructorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classScheduleId" TEXT NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "method" "CheckInMethod" NOT NULL,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedToAttendanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeltTestEvent" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "BeltTestStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" DATE NOT NULL,
    "scheduledTime" TEXT,
    "location" TEXT,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rankSystemId" TEXT,

    CONSTRAINT "BeltTestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeltTestRegistration" (
    "id" TEXT NOT NULL,
    "result" "BeltTestResult",
    "feePaidCents" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "scoreBreakdown" JSONB,
    "prerequisitesMet" JSONB,
    "testedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "beltTestEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRankId" TEXT NOT NULL,

    CONSTRAINT "BeltTestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeltTestPrerequisiteConfig" (
    "id" TEXT NOT NULL,
    "minTimeInRankDays" INTEGER,
    "minAttendanceCount" INTEGER,
    "requireCurriculumComplete" BOOLEAN NOT NULL DEFAULT false,
    "requireInstructorApproval" BOOLEAN NOT NULL DEFAULT true,
    "customRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rankSystemId" TEXT NOT NULL,
    "rankId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "BeltTestPrerequisiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "familyGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "pricingModel" "PricingModel" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "intervalMonths" INTEGER,
    "classCount" INTEGER,
    "trialDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "invoiceNumber" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT NOT NULL,
    "pricingPlanId" TEXT,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "method" "PaymentMethodType" NOT NULL,
    "stripePaymentIntentId" TEXT,
    "barterNote" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeAccount" (
    "id" TEXT NOT NULL,
    "mode" "StripeConnectMode" NOT NULL DEFAULT 'EXPRESS',
    "stripeAccountId" TEXT NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "applicationFeeBps" INTEGER NOT NULL DEFAULT 500,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "StripeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutSplit" (
    "id" TEXT NOT NULL,
    "recipientLabel" TEXT NOT NULL,
    "splitBps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,

    CONSTRAINT "PayoutSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipContract" (
    "id" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "termMonths" INTEGER,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "cancellationNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "coolingOffDays" INTEGER NOT NULL DEFAULT 3,
    "monthlyCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "signedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "MembershipContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channels" "NotificationChannel"[],
    "publishAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRelationship" (
    "id" TEXT NOT NULL,
    "type" "OrgRelationType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agreedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentOrgId" TEXT NOT NULL,
    "childOrgId" TEXT NOT NULL,

    CONSTRAINT "OrgRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgSettings" (
    "id" TEXT NOT NULL,
    "defaultInstructorTitle" TEXT,
    "checkInWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "allowLateCheckIn" BOOLEAN NOT NULL DEFAULT true,
    "requireWaiverBeforeCheckIn" BOOLEAN NOT NULL DEFAULT true,
    "waiverRenewalMonths" INTEGER,
    "smsCostPassthrough" BOOLEAN NOT NULL DEFAULT false,
    "dropInFeeCents" INTEGER,
    "dropInRequiresWaiver" BOOLEAN NOT NULL DEFAULT true,
    "allowBarterMembership" BOOLEAN NOT NULL DEFAULT false,
    "enableGamification" BOOLEAN NOT NULL DEFAULT true,
    "enableBeltTestScoring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrgSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "type" "InviteType" NOT NULL,
    "code" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteClaim" (
    "id" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InviteClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "type" "EventType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Denver',
    "locationName" TEXT,
    "capacity" INTEGER,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "imageUrl" TEXT,
    "requiresWaiver" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "disciplineId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "status" "EventRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "feePaidCents" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bracket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "divisionId" TEXT NOT NULL,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "result" "MatchResult",
    "winnerEntryId" TEXT,
    "notes" TEXT,
    "scoreData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bracketId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchCompetitor" (
    "id" TEXT NOT NULL,
    "seed" INTEGER,
    "slot" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,
    "registrationEntryId" TEXT NOT NULL,

    CONSTRAINT "MatchCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightRecord" (
    "id" TEXT NOT NULL,
    "type" "FightRecordType" NOT NULL DEFAULT 'TOURNAMENT',
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "noContests" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "FightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phoneE164" TEXT,
    "notes" TEXT,
    "referredBy" TEXT,
    "trialBookedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "convertedToUserId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFollowUp" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "LeadFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "matchDurationSec" INTEGER,
    "overtimeSec" INTEGER,
    "scoringMethod" "ScoringMethod" NOT NULL DEFAULT 'POINTS',
    "scoringConfig" JSONB,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disciplineId" TEXT,

    CONSTRAINT "RuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeighInRecord" (
    "id" TEXT NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WeighInRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatAssignment" (
    "id" TEXT NOT NULL,
    "matName" TEXT NOT NULL,
    "status" "MatAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,

    CONSTRAINT "MatAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "altText" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "durationSec" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAttachment" (
    "id" TEXT NOT NULL,
    "purpose" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaId" TEXT NOT NULL,
    "passportId" TEXT,
    "techniqueId" TEXT,
    "eventId" TEXT,
    "rankAwardId" TEXT,
    "courseId" TEXT,
    "organizationId" TEXT,
    "contentAtomId" TEXT,
    "certificateTemplateId" TEXT,

    CONSTRAINT "MediaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technique" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" "TechniquePosition",
    "category" "TechniqueCategory",
    "difficultyLevel" "DifficultyLevel",
    "isGi" BOOLEAN,
    "isFoundational" BOOLEAN NOT NULL DEFAULT false,
    "requiresPartner" BOOLEAN NOT NULL DEFAULT false,
    "requiresEquipment" BOOLEAN NOT NULL DEFAULT false,
    "movementPattern" TEXT,
    "rangeBand" TEXT,
    "teachingCues" TEXT[],
    "commonErrors" TEXT[],
    "safetyNotes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "styleId" TEXT,
    "beltLevelMinId" TEXT,
    "beltLevelMaxId" TEXT,

    CONSTRAINT "Technique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechniquePrerequisite" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "isStrict" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "techniqueId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "TechniquePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechniqueCurriculumLink" (
    "techniqueId" TEXT NOT NULL,
    "curriculumItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TechniqueCurriculumLink_pkey" PRIMARY KEY ("techniqueId","curriculumItemId")
);

-- CreateTable
CREATE TABLE "TechniqueProgress" (
    "id" TEXT NOT NULL,
    "status" "TechniqueProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastDrilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "verifiedById" TEXT,

    CONSTRAINT "TechniqueProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "deliveryMethod" "CertificateDeliveryMethod" NOT NULL DEFAULT 'DIGITAL',
    "description" TEXT,
    "layoutConfig" JSONB,
    "backgroundUrl" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateOrder" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "shippingStatus" "ShippingStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "shippingName" TEXT,
    "shippingAddressLine1" TEXT,
    "shippingAddressLine2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingZip" TEXT,
    "shippingCountry" TEXT DEFAULT 'US',
    "trackingNumber" TEXT,
    "stripePaymentIntentId" TEXT,
    "notes" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateTemplateId" TEXT NOT NULL,

    CONSTRAINT "CertificateOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateIssuance" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "qrVerificationCode" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "certificateTemplateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificationId" TEXT,
    "orderId" TEXT,

    CONSTRAINT "CertificateIssuance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "entityType" "FavoriteEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "StudentList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentListMember" (
    "id" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentListId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StudentListMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementGrant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricingPlanId" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,

    CONSTRAINT "EntitlementGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEntitlement" (
    "id" TEXT NOT NULL,
    "sourceType" "EntitlementSourceType" NOT NULL,
    "sourceId" TEXT,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,

    CONSTRAINT "UserEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Program_brand_organizationId_idx" ON "Program"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Program_disciplineId_idx" ON "Program"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "Program_brand_organizationId_slug_key" ON "Program"("brand", "organizationId", "slug");

-- CreateIndex
CREATE INDEX "ProgramWaiver_waiverId_idx" ON "ProgramWaiver"("waiverId");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_programId_status_idx" ON "ProgramEnrollment"("programId", "status");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_userId_idx" ON "ProgramEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramEnrollment_userId_programId_key" ON "ProgramEnrollment"("userId", "programId");

-- CreateIndex
CREATE INDEX "ClassSchedule_brand_organizationId_idx" ON "ClassSchedule"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "ClassSchedule_programId_idx" ON "ClassSchedule"("programId");

-- CreateIndex
CREATE INDEX "ClassInstructorAssignment_userId_idx" ON "ClassInstructorAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassInstructorAssignment_classScheduleId_userId_key" ON "ClassInstructorAssignment"("classScheduleId", "userId");

-- CreateIndex
CREATE INDEX "ClassSession_date_idx" ON "ClassSession"("date");

-- CreateIndex
CREATE INDEX "ClassSession_substituteInstructorId_idx" ON "ClassSession"("substituteInstructorId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_classScheduleId_date_key" ON "ClassSession"("classScheduleId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_matchedToAttendanceId_key" ON "CheckIn"("matchedToAttendanceId");

-- CreateIndex
CREATE INDEX "CheckIn_userId_timestamp_idx" ON "CheckIn"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "Attendance_classSessionId_idx" ON "Attendance"("classSessionId");

-- CreateIndex
CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_classSessionId_key" ON "Attendance"("userId", "classSessionId");

-- CreateIndex
CREATE INDEX "BeltTestEvent_brand_organizationId_idx" ON "BeltTestEvent"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "BeltTestEvent_scheduledDate_idx" ON "BeltTestEvent"("scheduledDate");

-- CreateIndex
CREATE INDEX "BeltTestRegistration_userId_idx" ON "BeltTestRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BeltTestRegistration_beltTestEventId_userId_key" ON "BeltTestRegistration"("beltTestEventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BeltTestPrerequisiteConfig_rankSystemId_rankId_organization_key" ON "BeltTestPrerequisiteConfig"("rankSystemId", "rankId", "organizationId");

-- CreateIndex
CREATE INDEX "FamilyGroup_id_idx" ON "FamilyGroup"("id");

-- CreateIndex
CREATE INDEX "FamilyMember_userId_idx" ON "FamilyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_familyGroupId_userId_key" ON "FamilyMember"("familyGroupId", "userId");

-- CreateIndex
CREATE INDEX "PricingPlan_brand_organizationId_idx" ON "PricingPlan"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "PricingPlan_programId_idx" ON "PricingPlan"("programId");

-- CreateIndex
CREATE INDEX "Invoice_brand_organizationId_idx" ON "Invoice"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_stripeAccountId_key" ON "StripeAccount"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_organizationId_key" ON "StripeAccount"("organizationId");

-- CreateIndex
CREATE INDEX "StripeAccount_stripeAccountId_idx" ON "StripeAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "PayoutSplit_stripeAccountId_idx" ON "PayoutSplit"("stripeAccountId");

-- CreateIndex
CREATE INDEX "PayoutSplit_recipientUserId_idx" ON "PayoutSplit"("recipientUserId");

-- CreateIndex
CREATE INDEX "PromoCode_brand_isActive_idx" ON "PromoCode"("brand", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_brand_code_key" ON "PromoCode"("brand", "code");

-- CreateIndex
CREATE INDEX "MembershipContract_userId_idx" ON "MembershipContract"("userId");

-- CreateIndex
CREATE INDEX "MembershipContract_organizationId_status_idx" ON "MembershipContract"("organizationId", "status");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_category_channel_programId_key" ON "NotificationPreference"("userId", "category", "channel", "programId");

-- CreateIndex
CREATE INDEX "Announcement_brand_organizationId_idx" ON "Announcement"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Announcement_publishAt_idx" ON "Announcement"("publishAt");

-- CreateIndex
CREATE INDEX "OrgRelationship_parentOrgId_idx" ON "OrgRelationship"("parentOrgId");

-- CreateIndex
CREATE INDEX "OrgRelationship_childOrgId_idx" ON "OrgRelationship"("childOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRelationship_parentOrgId_childOrgId_type_key" ON "OrgRelationship"("parentOrgId", "childOrgId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "OrgSettings_organizationId_key" ON "OrgSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "Invite_brand_organizationId_idx" ON "Invite"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Invite_code_idx" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "Invite_createdById_idx" ON "Invite"("createdById");

-- CreateIndex
CREATE INDEX "InviteClaim_userId_idx" ON "InviteClaim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteClaim_inviteId_userId_key" ON "InviteClaim"("inviteId", "userId");

-- CreateIndex
CREATE INDEX "Event_brand_organizationId_idx" ON "Event"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Event_brand_organizationId_slug_key" ON "Event"("brand", "organizationId", "slug");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Bracket_divisionId_idx" ON "Bracket"("divisionId");

-- CreateIndex
CREATE INDEX "Match_bracketId_roundNumber_idx" ON "Match"("bracketId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Match_bracketId_roundNumber_matchNumber_key" ON "Match"("bracketId", "roundNumber", "matchNumber");

-- CreateIndex
CREATE INDEX "MatchCompetitor_registrationEntryId_idx" ON "MatchCompetitor"("registrationEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchCompetitor_matchId_slot_key" ON "MatchCompetitor"("matchId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "MatchCompetitor_matchId_registrationEntryId_key" ON "MatchCompetitor"("matchId", "registrationEntryId");

-- CreateIndex
CREATE INDEX "FightRecord_userId_idx" ON "FightRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FightRecord_userId_disciplineId_type_key" ON "FightRecord"("userId", "disciplineId", "type");

-- CreateIndex
CREATE INDEX "AuditLog_brand_entityType_entityId_idx" ON "AuditLog"("brand", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "Lead_brand_organizationId_status_idx" ON "Lead"("brand", "organizationId", "status");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_convertedToUserId_idx" ON "Lead"("convertedToUserId");

-- CreateIndex
CREATE INDEX "LeadFollowUp_leadId_idx" ON "LeadFollowUp"("leadId");

-- CreateIndex
CREATE INDEX "LeadFollowUp_assignedToId_idx" ON "LeadFollowUp"("assignedToId");

-- CreateIndex
CREATE INDEX "RuleSet_brand_idx" ON "RuleSet"("brand");

-- CreateIndex
CREATE INDEX "RuleSet_disciplineId_idx" ON "RuleSet"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "RuleSet_name_brand_key" ON "RuleSet"("name", "brand");

-- CreateIndex
CREATE INDEX "WeighInRecord_registrationId_idx" ON "WeighInRecord"("registrationId");

-- CreateIndex
CREATE INDEX "WeighInRecord_userId_idx" ON "WeighInRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatAssignment_matchId_key" ON "MatAssignment"("matchId");

-- CreateIndex
CREATE INDEX "MatAssignment_tournamentId_matName_idx" ON "MatAssignment"("tournamentId", "matName");

-- CreateIndex
CREATE INDEX "Media_brand_uploadedById_idx" ON "Media"("brand", "uploadedById");

-- CreateIndex
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "MediaAttachment_mediaId_idx" ON "MediaAttachment"("mediaId");

-- CreateIndex
CREATE INDEX "MediaAttachment_passportId_idx" ON "MediaAttachment"("passportId");

-- CreateIndex
CREATE INDEX "MediaAttachment_techniqueId_idx" ON "MediaAttachment"("techniqueId");

-- CreateIndex
CREATE INDEX "MediaAttachment_eventId_idx" ON "MediaAttachment"("eventId");

-- CreateIndex
CREATE INDEX "MediaAttachment_rankAwardId_idx" ON "MediaAttachment"("rankAwardId");

-- CreateIndex
CREATE INDEX "MediaAttachment_courseId_idx" ON "MediaAttachment"("courseId");

-- CreateIndex
CREATE INDEX "MediaAttachment_organizationId_idx" ON "MediaAttachment"("organizationId");

-- CreateIndex
CREATE INDEX "MediaAttachment_contentAtomId_idx" ON "MediaAttachment"("contentAtomId");

-- CreateIndex
CREATE INDEX "MediaAttachment_certificateTemplateId_idx" ON "MediaAttachment"("certificateTemplateId");

-- CreateIndex
CREATE INDEX "Technique_brand_disciplineId_idx" ON "Technique"("brand", "disciplineId");

-- CreateIndex
CREATE INDEX "Technique_position_category_idx" ON "Technique"("position", "category");

-- CreateIndex
CREATE INDEX "Technique_disciplineId_difficultyLevel_idx" ON "Technique"("disciplineId", "difficultyLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Technique_brand_organizationId_slug_key" ON "Technique"("brand", "organizationId", "slug");

-- CreateIndex
CREATE INDEX "TechniquePrerequisite_techniqueId_idx" ON "TechniquePrerequisite"("techniqueId");

-- CreateIndex
CREATE INDEX "TechniquePrerequisite_prerequisiteId_idx" ON "TechniquePrerequisite"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TechniquePrerequisite_techniqueId_prerequisiteId_key" ON "TechniquePrerequisite"("techniqueId", "prerequisiteId");

-- CreateIndex
CREATE INDEX "TechniqueProgress_userId_status_idx" ON "TechniqueProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "TechniqueProgress_techniqueId_idx" ON "TechniqueProgress"("techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "TechniqueProgress_userId_techniqueId_key" ON "TechniqueProgress"("userId", "techniqueId");

-- CreateIndex
CREATE INDEX "CertificateTemplate_brand_type_idx" ON "CertificateTemplate"("brand", "type");

-- CreateIndex
CREATE INDEX "CertificateTemplate_organizationId_idx" ON "CertificateTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "CertificateOrder_userId_idx" ON "CertificateOrder"("userId");

-- CreateIndex
CREATE INDEX "CertificateOrder_certificateTemplateId_idx" ON "CertificateOrder"("certificateTemplateId");

-- CreateIndex
CREATE INDEX "CertificateOrder_paymentStatus_idx" ON "CertificateOrder"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateIssuance_certificateNumber_key" ON "CertificateIssuance"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateIssuance_qrVerificationCode_key" ON "CertificateIssuance"("qrVerificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateIssuance_certificationId_key" ON "CertificateIssuance"("certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateIssuance_orderId_key" ON "CertificateIssuance"("orderId");

-- CreateIndex
CREATE INDEX "CertificateIssuance_userId_idx" ON "CertificateIssuance"("userId");

-- CreateIndex
CREATE INDEX "CertificateIssuance_certificateTemplateId_idx" ON "CertificateIssuance"("certificateTemplateId");

-- CreateIndex
CREATE INDEX "CertificateIssuance_certificationId_idx" ON "CertificateIssuance"("certificationId");

-- CreateIndex
CREATE INDEX "Favorite_userId_entityType_idx" ON "Favorite"("userId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_entityId_key" ON "Favorite"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "StudentList_createdById_idx" ON "StudentList"("createdById");

-- CreateIndex
CREATE INDEX "StudentList_organizationId_idx" ON "StudentList"("organizationId");

-- CreateIndex
CREATE INDEX "StudentListMember_userId_idx" ON "StudentListMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentListMember_studentListId_userId_key" ON "StudentListMember"("studentListId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_brand_key_key" ON "Entitlement"("brand", "key");

-- CreateIndex
CREATE UNIQUE INDEX "EntitlementGrant_pricingPlanId_entitlementId_key" ON "EntitlementGrant"("pricingPlanId", "entitlementId");

-- CreateIndex
CREATE INDEX "UserEntitlement_userId_status_idx" ON "UserEntitlement"("userId", "status");

-- CreateIndex
CREATE INDEX "UserEntitlement_entitlementId_idx" ON "UserEntitlement"("entitlementId");

-- CreateIndex
CREATE INDEX "UserEntitlement_sourceType_sourceId_idx" ON "UserEntitlement"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWaiver" ADD CONSTRAINT "ProgramWaiver_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWaiver" ADD CONSTRAINT "ProgramWaiver_waiverId_fkey" FOREIGN KEY ("waiverId") REFERENCES "Waiver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassInstructorAssignment" ADD CONSTRAINT "ClassInstructorAssignment_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassInstructorAssignment" ADD CONSTRAINT "ClassInstructorAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_substituteInstructorId_fkey" FOREIGN KEY ("substituteInstructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_matchedToAttendanceId_fkey" FOREIGN KEY ("matchedToAttendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestEvent" ADD CONSTRAINT "BeltTestEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestEvent" ADD CONSTRAINT "BeltTestEvent_rankSystemId_fkey" FOREIGN KEY ("rankSystemId") REFERENCES "RankSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestRegistration" ADD CONSTRAINT "BeltTestRegistration_beltTestEventId_fkey" FOREIGN KEY ("beltTestEventId") REFERENCES "BeltTestEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestRegistration" ADD CONSTRAINT "BeltTestRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestRegistration" ADD CONSTRAINT "BeltTestRegistration_targetRankId_fkey" FOREIGN KEY ("targetRankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestPrerequisiteConfig" ADD CONSTRAINT "BeltTestPrerequisiteConfig_rankSystemId_fkey" FOREIGN KEY ("rankSystemId") REFERENCES "RankSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestPrerequisiteConfig" ADD CONSTRAINT "BeltTestPrerequisiteConfig_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltTestPrerequisiteConfig" ADD CONSTRAINT "BeltTestPrerequisiteConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyGroupId_fkey" FOREIGN KEY ("familyGroupId") REFERENCES "FamilyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeAccount" ADD CONSTRAINT "StripeAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutSplit" ADD CONSTRAINT "PayoutSplit_stripeAccountId_fkey" FOREIGN KEY ("stripeAccountId") REFERENCES "StripeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutSplit" ADD CONSTRAINT "PayoutSplit_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipContract" ADD CONSTRAINT "MembershipContract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipContract" ADD CONSTRAINT "MembershipContract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_childOrgId_fkey" FOREIGN KEY ("childOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSettings" ADD CONSTRAINT "OrgSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentDiscipline" ADD CONSTRAINT "TournamentDiscipline_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "RuleSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_curriculumItemCompletionId_fkey" FOREIGN KEY ("curriculumItemCompletionId") REFERENCES "CurriculumItemCompletion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_beltTestRegistrationId_fkey" FOREIGN KEY ("beltTestRegistrationId") REFERENCES "BeltTestRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteClaim" ADD CONSTRAINT "InviteClaim_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteClaim" ADD CONSTRAINT "InviteClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchCompetitor" ADD CONSTRAINT "MatchCompetitor_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchCompetitor" ADD CONSTRAINT "MatchCompetitor_registrationEntryId_fkey" FOREIGN KEY ("registrationEntryId") REFERENCES "RegistrationEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightRecord" ADD CONSTRAINT "FightRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightRecord" ADD CONSTRAINT "FightRecord_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFollowUp" ADD CONSTRAINT "LeadFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFollowUp" ADD CONSTRAINT "LeadFollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleSet" ADD CONSTRAINT "RuleSet_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighInRecord" ADD CONSTRAINT "WeighInRecord_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighInRecord" ADD CONSTRAINT "WeighInRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatAssignment" ADD CONSTRAINT "MatAssignment_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatAssignment" ADD CONSTRAINT "MatAssignment_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_certificateTemplateId_fkey" FOREIGN KEY ("certificateTemplateId") REFERENCES "CertificateTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technique" ADD CONSTRAINT "Technique_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technique" ADD CONSTRAINT "Technique_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technique" ADD CONSTRAINT "Technique_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technique" ADD CONSTRAINT "Technique_beltLevelMinId_fkey" FOREIGN KEY ("beltLevelMinId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technique" ADD CONSTRAINT "Technique_beltLevelMaxId_fkey" FOREIGN KEY ("beltLevelMaxId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniquePrerequisite" ADD CONSTRAINT "TechniquePrerequisite_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniquePrerequisite" ADD CONSTRAINT "TechniquePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueCurriculumLink" ADD CONSTRAINT "TechniqueCurriculumLink_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueCurriculumLink" ADD CONSTRAINT "TechniqueCurriculumLink_curriculumItemId_fkey" FOREIGN KEY ("curriculumItemId") REFERENCES "CurriculumItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueProgress" ADD CONSTRAINT "TechniqueProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueProgress" ADD CONSTRAINT "TechniqueProgress_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniqueProgress" ADD CONSTRAINT "TechniqueProgress_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateOrder" ADD CONSTRAINT "CertificateOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateOrder" ADD CONSTRAINT "CertificateOrder_certificateTemplateId_fkey" FOREIGN KEY ("certificateTemplateId") REFERENCES "CertificateTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_certificateTemplateId_fkey" FOREIGN KEY ("certificateTemplateId") REFERENCES "CertificateTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CertificateOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentList" ADD CONSTRAINT "StudentList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentList" ADD CONSTRAINT "StudentList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentListMember" ADD CONSTRAINT "StudentListMember_studentListId_fkey" FOREIGN KEY ("studentListId") REFERENCES "StudentList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentListMember" ADD CONSTRAINT "StudentListMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementGrant" ADD CONSTRAINT "EntitlementGrant_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementGrant" ADD CONSTRAINT "EntitlementGrant_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
