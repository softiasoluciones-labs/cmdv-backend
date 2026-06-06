import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { PatientController } from '../controllers/medical-controllers/patient-controller';
import {
    createPatientValidator,
    updatePatientValidator,
    patientListValidator
} from '../validators/medical-validators/patient-validator';

import { RoomController } from '../controllers/medical-controllers/room-controller';
import { roomListValidator } from '../validators/medical-validators/room-validator';

import { DoctorController } from '../controllers/medical-controllers/doctor-controller';
import {
    createDoctorValidator,
    updateDoctorValidator,
    doctorListValidator
} from '../validators/medical-validators/doctor-validator';

// New imports for admission types and case files
import { AdmissionTypeController } from '../controllers/medical-controllers/admission-type-controller';
import { CaseFileController } from '../controllers/medical-controllers/case-file-controller';
import { CaseFileService } from '../services/medical-services/case-file-service';
import { CaseFileRepository } from '../repositories/medical-repositories/case-file-repository';
import { PackageController } from '../controllers/medical-controllers/package-controller';
import { ScheduledOperationController } from '../controllers/medical-controllers/scheduled-operation-controller';
import { ScheduledOperationService } from '../services/medical-services/scheduled-operation.service';
import { ScheduledOperationRepository } from '../repositories/medical-repositories/scheduled-operation.repository';
import {
    createScheduledOperationValidator,
    updateScheduledOperationValidator,
    updateScheduledOperationStatusValidator,
    addTeamMemberValidator,
    scheduledOperationListValidator,
    scheduledOperationIdValidator,
    teamMemberIdValidator
} from '../validators/medical-validators/scheduled-operation.validator';

const router = Router();

const caseFileController = new CaseFileController(new CaseFileService(new CaseFileRepository()));
const scheduledOperationController = new ScheduledOperationController(
    new ScheduledOperationService(new ScheduledOperationRepository())
);

// All medical routes require authentication
router.use(authMiddleware);

// Patient routes
router.get('/patients', patientListValidator, PatientController.getAll);
router.get('/patients/:id', PatientController.getById);
router.get('/patients/file-number/:fileNumber', PatientController.getByFileNumber);
router.post('/patients', createPatientValidator, PatientController.create);
router.put('/patients/:id', updatePatientValidator, PatientController.update);
router.delete('/patients/:id', PatientController.delete);

// Room routes
router.get('/rooms', roomListValidator, RoomController.getAll);
router.get('/rooms/:id', RoomController.getById);

// Doctor routes
router.get('/doctors', doctorListValidator, DoctorController.getAll);
router.get('/doctors/:id', DoctorController.getById);
router.post('/doctors', createDoctorValidator, DoctorController.create);
router.put('/doctors/:id', updateDoctorValidator, DoctorController.update);
router.delete('/doctors/:id', DoctorController.delete);

// Admission Types routes
router.get('/admission-types', AdmissionTypeController.getAll);
router.get('/admission-types/grouped', AdmissionTypeController.getAdmissionTypesGrouped);
router.get('/admission-types/code/:code', AdmissionTypeController.getAdmissionTypeByCode);
router.get('/admission-types/:id', AdmissionTypeController.getAdmissionTypeById);
router.get('/admission-types/:id/rules', AdmissionTypeController.getAdmissionTypeRules);
router.post('/admission-types', AdmissionTypeController.createAdmissionType);
router.put('/admission-types/:id', AdmissionTypeController.updateAdmissionType);
router.delete('/admission-types/:id', AdmissionTypeController.deleteAdmissionType);

// packages routes
router.get('/packages', (req, res, next) => {
    PackageController.getAll(req, res).catch(next);
});
router.get('/packages/:id', PackageController.getById);
router.get('/packageDetail/:id', PackageController.getPackageDetails);
router.post('/packages', PackageController.create);
router.patch('/packages/:id/deactivate', PackageController.deactivate);
router.post('/packages/:id/copy', PackageController.copyPackage);
router.patch('/remove-item-detail/:id-detail', PackageController.removeItemDetail);
router.put('/packages/:id', PackageController.update);

// Case Files routes
router.get('/case-files', caseFileController.getAllCaseFiles);
router.get('/case-files/case-number/:caseNumber', caseFileController.getCaseFileByCaseNumber);
router.get('/case-files/:id', caseFileController.getCaseFileById);
router.get('/case-files/:id/validation', caseFileController.validateCaseFile);
router.get('/case-files/:id/can-transfer', caseFileController.canTransferCase);
router.get('/case-files/:id/can-close', caseFileController.canCloseCase);
router.post('/case-files', caseFileController.createCaseFile);
router.put('/case-files/:id', caseFileController.updateCaseFile);
router.patch('/case-files/:id/status', caseFileController.updateCaseStatus);
router.delete('/case-files/:id', caseFileController.deleteCaseFile);

// Scheduled Operations routes
router.get('/scheduled-operations', scheduledOperationListValidator, scheduledOperationController.getAllOperations);
router.get('/scheduled-operations/case-file/:caseFileId', scheduledOperationController.getOperationsByCaseFile);
router.get('/scheduled-operations/:id', scheduledOperationIdValidator, scheduledOperationController.getOperationById);
router.post('/scheduled-operations', createScheduledOperationValidator, scheduledOperationController.createOperation);
router.put('/scheduled-operations/:id', scheduledOperationIdValidator, updateScheduledOperationValidator, scheduledOperationController.updateOperation);
router.patch('/scheduled-operations/:id/status', scheduledOperationIdValidator, updateScheduledOperationStatusValidator, scheduledOperationController.updateOperationStatus);
router.delete('/scheduled-operations/:id', scheduledOperationIdValidator, scheduledOperationController.deleteOperation);
router.get('/scheduled-operations/:id/team', scheduledOperationIdValidator, scheduledOperationController.getTeamMembers);
router.post('/scheduled-operations/:id/team', scheduledOperationIdValidator, addTeamMemberValidator, scheduledOperationController.addTeamMember);
router.delete('/scheduled-operations/:id/team/:memberId', scheduledOperationIdValidator, teamMemberIdValidator, scheduledOperationController.removeTeamMember);

export { router as medicalRoutes };
