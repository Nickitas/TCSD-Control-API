import { ApiProperty } from '@nestjs/swagger';

// Responses
export class QrGenerationResponseDto {
  @ApiProperty({ description: 'Response status' })
  status: number;

  @ApiProperty({ description: 'Response message', required: false })
  message?: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: any;
}

export class PersonnelDto {
  @ApiProperty({ description: 'User PERS_ID', example: 12345 })
  PERS_ID: number;

  @ApiProperty({
    description: 'User UUID (GPWP)',
    example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
    required: false,
  })
  UUID?: string;

  @ApiProperty({
    description: 'QR key',
    example: '0000000001A2',
    required: false,
  })
  KLUCH2?: string;
}

// Requests
export class CreateKeyRequestDto {
  @ApiProperty({ description: 'User PERS_ID', example: 12345 })
  persId: number;

  @ApiProperty({
    description: 'User UUID (GPWP)',
    example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  })
  uuid: string;
}

export class GenerateKeyRequestDto {
  @ApiProperty({
    description: 'User PERS_ID to generate key from',
    example: 12345,
    required: true,
  })
  persId: number;
}
