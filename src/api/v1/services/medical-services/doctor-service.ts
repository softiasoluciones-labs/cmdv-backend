import { DoctorRepository } from '../../repositories/medical-repositories/doctor-repository';
import { DoctorResponse, CreateDoctorRequest, UpdateDoctorRequest, DoctorListFilters } from '../../dtos/medical-dtos/doctor-dto';
import { doctors } from '../../../../database/medical/doctors';

export class DoctorService {
    /**
     * Convert doctor model to response DTO
     */
    private static toDoctorResponse(doctor: doctors): DoctorResponse {
        return {
            id: doctor.id,
            ...(doctor.user_id && { user_id: doctor.user_id }),
            ...((doctor as any).user?.full_name && { full_name: (doctor as any).user.full_name }),
            medical_license: doctor.medical_license,
            ...(doctor.specialty_id && { specialty_id: doctor.specialty_id }),
            ...((doctor as any).specialty?.name && { specialty_name: (doctor as any).specialty.name }),
            doctor_type: doctor.doctor_type,
            ...(doctor.consultation_fee && { consultation_fee: Number(doctor.consultation_fee) }),
            ...(doctor.surgery_fee && { surgery_fee: Number(doctor.surgery_fee) }),
            ...(doctor.identification_number && { identification_number: doctor.identification_number }),
            ...(doctor.phone && { phone: doctor.phone }),
            ...(doctor.email && { email: doctor.email }),
            ...(doctor.address && { address: doctor.address }),
            ...(doctor.is_active !== undefined && { is_active: doctor.is_active }),
            ...(doctor.created_at && { created_at: doctor.created_at }),
            ...(doctor.updated_at && { updated_at: doctor.updated_at }),
        };
    }

    /**
     * Get all doctors with filters
     */
    static async getAllDoctors(filters: DoctorListFilters, page: number = 1, limit: number = 50): Promise<{ doctors: DoctorResponse[], total: number, page: number, totalPages: number }> {
        const result = await DoctorRepository.findAll(filters, page, limit);

        return {
            doctors: result.doctors.map(d => this.toDoctorResponse(d)),
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        };
    }

    /**
     * Get doctor by ID
     */
    static async getDoctorById(id: string): Promise<DoctorResponse> {
        const doctor = await DoctorRepository.findById(id);
        if (!doctor) throw new Error('Doctor not found');
        return this.toDoctorResponse(doctor);
    }

    /**
     * Create new doctor
     */
    static async createDoctor(data: CreateDoctorRequest, userId?: string): Promise<DoctorResponse> {
        const doctorData: any = {
            medical_license: data.medical_license,
            doctor_type: data.doctor_type,
        };

        // Only add optional fields if they have values
        if (data.user_id) doctorData.user_id = data.user_id;
        if (data.specialty_id) doctorData.specialty_id = data.specialty_id;
        if (data.consultation_fee !== undefined) doctorData.consultation_fee = data.consultation_fee;
        if (data.surgery_fee !== undefined) doctorData.surgery_fee = data.surgery_fee;
        if (data.identification_number) doctorData.identification_number = data.identification_number;
        if (data.is_active !== undefined) doctorData.is_active = data.is_active;

        const doctor = await DoctorRepository.create(doctorData);
        if (!doctor) throw new Error('Failed to create doctor');

        return this.toDoctorResponse(doctor);
    }

    /**
     * Update doctor by ID
     */
    static async updateDoctor(id: string, data: UpdateDoctorRequest): Promise<DoctorResponse> {
        const doctor = await DoctorRepository.findById(id);
        if (!doctor) throw new Error('Doctor not found');

        const updateData: any = {};

        // Only update fields that are provided
        if (data.user_id !== undefined) updateData.user_id = data.user_id;
        if (data.medical_license) updateData.medical_license = data.medical_license;
        if (data.specialty_id !== undefined) updateData.specialty_id = data.specialty_id;
        if (data.doctor_type) updateData.doctor_type = data.doctor_type;
        if (data.consultation_fee !== undefined) updateData.consultation_fee = data.consultation_fee;
        if (data.surgery_fee !== undefined) updateData.surgery_fee = data.surgery_fee;
        if (data.identification_number !== undefined) updateData.identification_number = data.identification_number;
        if (data.is_active !== undefined) updateData.is_active = data.is_active;

        const updatedDoctor = await DoctorRepository.update(id, updateData);
        if (!updatedDoctor) throw new Error('Failed to update doctor');

        return this.toDoctorResponse(updatedDoctor);
    }

    /**
     * Delete doctor (soft delete by setting is_active to false)
     */
    static async deleteDoctor(id: string): Promise<void> {
        const doctor = await DoctorRepository.findById(id);
        if (!doctor) throw new Error('Doctor not found');

        // Soft delete by setting is_active to false
        const updated = await DoctorRepository.update(id, { is_active: false });
        if (!updated) throw new Error('Failed to delete doctor');
    }
}