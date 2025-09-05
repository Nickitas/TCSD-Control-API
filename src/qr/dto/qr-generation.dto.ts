import { ApiProperty } from '@nestjs/swagger';

export class QrGenerationResponseDto {
  @ApiProperty({ description: 'Response status' })
  status: number;

  @ApiProperty({ description: 'Response message', required: false })
  message?: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: {
    key: number;
  };
}