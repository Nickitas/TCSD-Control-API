import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';

@ApiTags('qr')
@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Get(':uid')
    async generateQr(@Param('uid') uid: string) {
        return this.qrService.generateQr(uid);
    }
}
