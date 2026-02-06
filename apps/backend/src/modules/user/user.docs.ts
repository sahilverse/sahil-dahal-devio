/**
 * @swagger
 * components:
 *   schemas:
 *     EmploymentType:
 *       type: string
 *       enum: [FULL_TIME, PART_TIME, SELF_EMPLOYED, FREELANCE, CONTRACT, INTERNSHIP, APPRENTICESHIP, SEASONAL]
 *     CreateExperienceInput:
 *       type: object
 *       required:
 *         - title
 *         - companyName
 *         - startDate
 *       properties:
 *         title:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         companyName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         companyId:
 *           type: string
 *           nullable: true
 *         location:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *         type:
 *           $ref: '#/components/schemas/EmploymentType'
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         isCurrent:
 *           type: boolean
 *           default: false
 *         description:
 *           type: string
 *           maxLength: 2000
 *           nullable: true
 *     UpdateExperienceInput:
 *       $ref: '#/components/schemas/CreateExperienceInput'
 *     CreateEducationInput:
 *       type: object
 *       required:
 *         - school
 *         - startDate
 *       properties:
 *         school:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         degree:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *         fieldOfStudy:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         grade:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *         activities:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *         description:
 *           type: string
 *           maxLength: 2000
 *           nullable: true
 *     UpdateEducationInput:
 *       $ref: '#/components/schemas/CreateEducationInput'
 */
