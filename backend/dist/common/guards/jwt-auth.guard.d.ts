import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly reflector?;
    constructor(jwtService: JwtService, reflector?: Reflector | undefined);
    canActivate(context: ExecutionContext): boolean;
}
