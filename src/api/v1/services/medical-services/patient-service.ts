import { PatientRepository } from '../../repositories/medical-repositories/patient-repository';
import { PatientResponse, CreatePatientRequest, UpdatePatientRequest, PatientListFilters } from '../../dtos/medical-dtos/patient-dto';
import { patients } from '../../../../database/medical/patients';

export class PatientService {
    /**
     * Convert patient model to response DTO
     */
    private static toPatientResponse(patient: patients): PatientResponse {
        const age = patient.date_of_birth ? this.calculateAge(patient.date_of_birth) : undefined;

        return {
            id: patient.id,
            fileNumber: patient.file_number,
            firstName: patient.first_name,
            lastName: patient.last_name,
            fullName: `${patient.first_name} ${patient.last_name}`,
            ...(patient.identification_number && { identificationNumber: patient.identification_number }),
            dateOfBirth: patient.date_of_birth,
            ...(age !== undefined && { age }),
            gender: patient.gender,
            ...(patient.blood_type && { bloodType: patient.blood_type }),
            ...(patient.phone && { phone: patient.phone }),
            ...(patient.mobile && { mobile: patient.mobile }),
            ...(patient.email && { email: patient.email }),
            ...(patient.address && { address: patient.address }),
            ...(patient.city && { city: patient.city }),
            ...(patient.state && { state: patient.state }),
            ...(patient.zip_code && { zipCode: patient.zip_code }),
            ...(patient.emergency_contact_name && { emergencyContactName: patient.emergency_contact_name }),
            ...(patient.emergency_contact_phone && { emergencyContactPhone: patient.emergency_contact_phone }),
            ...(patient.emergency_contact_relationship && { emergencyContactRelationship: patient.emergency_contact_relationship }),
            ...(patient.allergies && { allergies: patient.allergies }),
            ...(patient.chronic_conditions && { chronicConditions: patient.chronic_conditions }),
            ...(patient.current_medications && { currentMedications: patient.current_medications }),
            ...(patient.insurance_company && { insuranceCompany: patient.insurance_company }),
            ...(patient.insurance_policy_number && { insurancePolicyNumber: patient.insurance_policy_number }),
            ...(patient.is_active !== undefined && { isActive: patient.is_active }),
            ...(patient.notes && { notes: patient.notes }),
            ...(patient.created_at && { createdAt: patient.created_at }),
            ...(patient.updated_at && { updatedAt: patient.updated_at }),
        };
    }

    /**
     * Calculate age from date of birth
     */
    private static calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Get all patients with filters
     */
    static async getAllPatients(filters: PatientListFilters, page: number = 1, limit: number = 50): Promise<{ patients: PatientResponse[], total: number, page: number, totalPages: number }> {
        const result = await PatientRepository.findAll(filters, page, limit);

        return {
            patients: result.patients.map(p => this.toPatientResponse(p)),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    /**
     * Get patient by ID
     */
    static async getPatientById(id: string): Promise<PatientResponse> {
        const patient = await PatientRepository.findById(id);
        if (!patient) throw new Error('Patient not found');
        return this.toPatientResponse(patient);
    }

    /**
     * Get patient by file number
     */
    static async getPatientByFileNumber(fileNumber: string): Promise<PatientResponse> {
        const patient = await PatientRepository.findByFileNumber(fileNumber);
        if (!patient) throw new Error('Patient not found');
        return this.toPatientResponse(patient);
    }

    /**
     * Create new patient
     */
    static async createPatient(data: CreatePatientRequest, userId?: string): Promise<PatientResponse> {
        // Check if identification number already exists
        if (data.identificationNumber) {
            const existing = await PatientRepository.findByIdentification(data.identificationNumber);
            if (existing) {
                throw new Error('Patient with this identification number already exists');
            }
        }

        const patientData: any = {
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: data.dateOfBirth,
            gender: data.gender,
        };

        // Only add optional fields if they have values
        if (data.identificationNumber) patientData.identification_number = data.identificationNumber;
        if (data.bloodType) patientData.blood_type = data.bloodType;
        if (data.phone) patientData.phone = data.phone;
        if (data.mobile) patientData.mobile = data.mobile;
        if (data.email) patientData.email = data.email;
        if (data.address) patientData.address = data.address;
        if (data.city) patientData.city = data.city;
        if (data.state) patientData.state = data.state;
        if (data.zipCode) patientData.zip_code = data.zipCode;
        if (data.emergencyContactName) patientData.emergency_contact_name = data.emergencyContactName;
        if (data.emergencyContactPhone) patientData.emergency_contact_phone = data.emergencyContactPhone;
        if (data.emergencyContactRelationship) patientData.emergency_contact_relationship = data.emergencyContactRelationship;

        // Array fields - only add if they exist and are arrays
        if (data.allergies && Array.isArray(data.allergies)) patientData.allergies = data.allergies;
        if (data.chronicConditions && Array.isArray(data.chronicConditions)) patientData.chronic_conditions = data.chronicConditions;
        if (data.currentMedications && Array.isArray(data.currentMedications)) patientData.current_medications = data.currentMedications;

        if (data.insuranceCompany) patientData.insurance_company = data.insuranceCompany;
        if (data.insurancePolicyNumber) patientData.insurance_policy_number = data.insurancePolicyNumber;
        if (data.notes) patientData.notes = data.notes;

        const patient = await PatientRepository.create(patientData, userId);
        return this.toPatientResponse(patient);
    }

    /**
     * Update patient
     */
    static async updatePatient(id: string, data: UpdatePatientRequest): Promise<PatientResponse> {
        const patient = await PatientRepository.findById(id);
        if (!patient) throw new Error('Patient not found');

        // Check if identification number is being changed and if it already exists
        if (data.identificationNumber && data.identificationNumber !== patient.identification_number) {
            const existing = await PatientRepository.findByIdentification(data.identificationNumber);
            if (existing) {
                throw new Error('Patient with this identification number already exists');
            }
        }

        const updateData: any = {};
        if (data.firstName) updateData.first_name = data.firstName;
        if (data.lastName) updateData.last_name = data.lastName;
        if (data.identificationNumber !== undefined) updateData.identification_number = data.identificationNumber;
        if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
        if (data.gender) updateData.gender = data.gender;
        if (data.bloodType !== undefined) updateData.blood_type = data.bloodType;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.mobile !== undefined) updateData.mobile = data.mobile;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.state !== undefined) updateData.state = data.state;
        if (data.zipCode !== undefined) updateData.zip_code = data.zipCode;
        if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName;
        if (data.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = data.emergencyContactPhone;
        if (data.emergencyContactRelationship !== undefined) updateData.emergency_contact_relationship = data.emergencyContactRelationship;
        if (data.allergies !== undefined) updateData.allergies = data.allergies;
        if (data.chronicConditions !== undefined) updateData.chronic_conditions = data.chronicConditions;
        if (data.currentMedications !== undefined) updateData.current_medications = data.currentMedications;
        if (data.insuranceCompany !== undefined) updateData.insurance_company = data.insuranceCompany;
        if (data.insurancePolicyNumber !== undefined) updateData.insurance_policy_number = data.insurancePolicyNumber;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;
        if (data.notes !== undefined) updateData.notes = data.notes;

        const updated = await PatientRepository.update(id, updateData);
        if (!updated) throw new Error('Failed to update patient');

        const updatedPatient = await PatientRepository.findById(id);
        if (!updatedPatient) throw new Error('Patient not found');
        return this.toPatientResponse(updatedPatient);
    }

    /**
     * Delete patient (soft delete)
     */
    static async deletePatient(id: string): Promise<void> {
        const patient = await PatientRepository.findById(id);
        if (!patient) throw new Error('Patient not found');

        const deleted = await PatientRepository.delete(id);
        if (!deleted) throw new Error('Failed to delete patient');
    }
}
