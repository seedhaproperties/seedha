export declare class AssignFieldWorkDto {
    fieldAgentName: string;
    fieldNotes?: string;
}
export declare class RejectItemDto {
    reason: string;
}
export declare class LocationCheckDecisionDto {
    matchesLocation: boolean;
    rejectMessage?: string;
}
export declare class ContactOwnerDto {
    notes: string;
    assignedStaff?: string;
}
export declare class PrepareAgreementDto {
    preparationNotes: string;
    documentUrl?: string;
}
export declare class CollectAndSendDigitalDto {
    summary: string;
    ownershipVerified: boolean;
    legalDisputeClear: boolean;
}
