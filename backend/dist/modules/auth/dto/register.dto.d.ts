import { UserRole } from '../../../common/constants.js';
export declare class RegisterDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
}
