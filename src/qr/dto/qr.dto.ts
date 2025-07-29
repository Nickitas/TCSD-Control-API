import { ApiProperty } from '@nestjs/swagger';

export class GenerateQrDto {
    @ApiProperty({ description: 'User UUID (GPWP)' })
    uuid: string;
}

export class UpdateKeyDto {
    @ApiProperty({ description: 'User UUID (GPWP)' })
    uuid: string;

    @ApiProperty({ description: 'New key value' })
    key: string;
}

export class UserResponseDto {
    @ApiProperty({ description: 'Response status' })
    status: number;

    @ApiProperty({ description: 'Response message' })
    message?: string;

    @ApiProperty({ description: 'Response data', required: false })
    data?: any;
}