export interface PatientResponse {
    id: string;
    fileNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    identificationNumber?: string;
    dateOfBirth: string;
    age?: number;
    gender: 'male' | 'female' | 'other';
    bloodType?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    insuranceCompany?: string;
    insurancePolicyNumber?: string;
    isActive?: boolean;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    identificationNumber?: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'male' | 'female' | 'other';
    bloodType?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    insuranceCompany?: string;
    insurancePolicyNumber?: string;
    notes?: string;
}

export interface UpdatePatientRequest {
    firstName?: string;
    lastName?: string;
    identificationNumber?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodType?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    insuranceCompany?: string;
    insurancePolicyNumber?: string;
    isActive?: boolean;
    notes?: string;
}

export interface PatientListFilters {
    search?: string; // Search in name, file number, identification
    gender?: 'male' | 'female' | 'other';
    isActive?: boolean;
    city?: string;
    state?: string;
}
