import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../../common/constants.js';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: UserRole;
    }>;
    private generateTokens;
}
