/**
 * Gate 9: lightweight AuditLog writer for the schedule slice.
 *
 * The implementation moved to the generic school-ops writer in SESSION_0032.
 * Keep this re-export so SESSION_0031 schedule imports stay stable.
 */
export { writeSchoolOpsAudit as writeScheduleAudit } from "~/server/web/school-ops/audit"
