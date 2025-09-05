import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { QrGenerationResponseDto } from './dto/qr-generation.dto';

@ApiTags('QR Code Management')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('staff/generate/:uuid')
  @ApiOperation({
    summary: 'Generate QR code for person by uuid',
    description:
      'Generates a new QR code key based on person UUID and stores it for 5 minutes',
  })
  @ApiParam({ name: 'uuid', description: 'Person UUID (GPWP)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'QR code generated successfully',
    type: QrGenerationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to update key',
  })
  async generateQrByUUID(
    @Param('uuid') uuid: string,
  ): Promise<QrGenerationResponseDto> {
    return this.qrService.generateQrByUUID(uuid);
  }

  @Get('stud/generate/:tabelnomer')
  @ApiOperation({
    summary: 'Generate QR code for person by tabnomer',
    description:
      'Generates a new QR code key based on user TABELNOMER and stores it for 5 minutes',
  })
  @ApiParam({ name: 'tabelnomer', description: 'Person TABELNOMER' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'QR code generated successfully',
    type: QrGenerationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to update key',
  })
  async generateQrByTabelnomer(
    @Param('tabelnomer') tabelnomer: string,
  ): Promise<QrGenerationResponseDto> {
    return this.qrService.generateQrByTabelnomer(tabelnomer);
  }
}
