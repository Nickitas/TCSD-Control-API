import {
  Controller,
  Get,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { QrService } from './qr.service';
import {
  QrGenerationResponseDto,
} from './dtos/qr.dto';

@ApiTags('QR Code Management')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) { }

  @Get('staff/generate/:uuid')
  @ApiOperation({
    summary: 'Generate QR code for user by uuid',
    description:
      'Generates a new QR code key based on user UUID and stores it for 5 minutes',
  })
  @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
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
    summary: 'Generate QR code for user by tabnomer',
    description:
      'Generates a new QR code key based on user TABELNOMER and stores it for 5 minutes',
  })
  @ApiParam({ name: 'tabelnomer', description: 'User TABELNOMER' })
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






  // @Post('create-key')
  // @ApiOperation({
  //   summary: 'Create and schedule QR key',
  //   description: 'Creates a QR key from pers_id and stores it for 5 minutes',
  // })
  // @ApiBody({ type: CreateKeyRequestDto })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Key created and scheduled successfully',
  //   type: String,
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Failed to create key',
  // })
  // async createAndScheduleKey(
  //   @Body() dto: CreateKeyRequestDto,
  // ): Promise<string> {
  //   return this.qrService.createAndScheduleKey(dto.tabelnomer, dto.uuid);
  // }

  // @Delete('clear-key/:uuid')
  // @ApiOperation({
  //   summary: 'Clear QR key manually',
  //   description: 'Immediately removes the QR key before scheduled timeout',
  // })
  // @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Key cleared successfully',
  //   type: Boolean,
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Failed to clear key',
  // })
  // async clearKey(@Param('uuid') uuid: string): Promise<boolean> {
  //   return this.qrService.clearKey(uuid);
  // }

  // @Get('user/:uuid')
  // @ApiOperation({
  //   summary: 'Get user by UUID',
  //   description: 'Retrieves user information by UUID (GPWP)',
  // })
  // @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'User found',
  //   type: PersonnelDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'User not found',
  // })
  // async findUserByUUID(@Param('uuid') uuid: string): Promise<Personnel | null> {
  //   return this.qrService.findUserByUUID(uuid);
  // }

  // @Post('generate-key')
  // @ApiOperation({
  //   summary: 'Generate QR key from pers_id',
  //   description:
  //     'Generates a QR key string from provided pers_id without saving it',
  // })
  // @ApiBody({ type: GenerateKeyRequestDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Key generated successfully',
  //   type: String,
  //   schema: {
  //     example: '0000000001A2',
  //   },
  // })
  // async generateKey(@Body() dto: GenerateKeyRequestDto): Promise<string> {
  //   return this.qrService.generateKey(dto.tabelnomer);
  // }
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to update key',
  })
  async generateQrByTabelnomer(
    @Param('tabelnomer') tabelnomer: string,
  ): Promise<QrGenerationResponseDto> {
    return this.qrService.generateQrByTabelnomer(tabelnomer);
  }
}
