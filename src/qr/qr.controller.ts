import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { Personnel } from 'src/shared/types/personnel.interface';

@ApiTags('QR Code Management')
@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Get(':uuid')
    @ApiOperation({ summary: 'Generate QR code for user (with 5-minute auto-delete)' })
    @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
    @ApiResponse({ status: 200, description: 'QR code generated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async generateQr(@Param('uuid') uuid: string) {
        return this.qrService.generateQr(uuid);
    }

    @Post('create-key')
    @ApiOperation({ summary: 'Create and schedule key with 5-minute auto-delete' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'number', description: 'User ID' },
                uuid: { type: 'string', description: 'User UUID (GPWP)' }
            },
            required: ['userId', 'uuid']
        }
    })
    @ApiResponse({ status: 200, description: 'Key created and scheduled for auto-delete' })
    @ApiResponse({ status: 400, description: 'Failed to create key' })
    async createAndScheduleKey(
        @Body('userId') userId: number,
        @Body('uuid') uuid: string
    ) {
        try {
            const key = await this.qrService.createAndScheduleKey(userId, uuid);
            return { 
                status: 200, 
                message: 'Key created and will auto-delete in 5 minutes',
                key 
            };
        } catch (error) {
            return { 
                status: 400, 
                message: error.message || 'Failed to create key' 
            };
        }
    }

    @Get('user/:uuid')
    @ApiOperation({ summary: 'Find user by UUID' })
    @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
    @ApiResponse({
        status: 200,
        description: 'User found',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findUser(@Param('uuid') uuid: string): Promise<{
        status: number;
        message?: string;
        data?: Personnel;
    }> {
        const user = await this.qrService.findUUID(uuid);
        if (!user) {
            return { status: 404, message: 'User not found' };
        }
        return { status: 200, data: user };
    }

    @Post('key')
    @ApiOperation({ summary: 'Update user key (without auto-delete)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                uuid: { type: 'string' },
                key: { type: 'string' },
            },
            required: ['uuid', 'key']
        },
    })
    @ApiResponse({ status: 200, description: 'Key updated successfully' })
    @ApiResponse({ status: 400, description: 'Update failed' })
    async updateKey(
        @Body('uuid') uuid: string,
        @Body('key') key: string,
    ) {
        const result = await this.qrService.updateKey(uuid, key);
        if (!result) {
            return { status: 400, message: 'Update failed' };
        }
        return { status: 200, message: 'Key updated successfully' };
    }

    @Delete('key/:uuid')
    @ApiOperation({ summary: 'Reset user key (manual delete)' })
    @ApiParam({ name: 'uuid', description: 'User UUID (GPWP)' })
    @ApiResponse({ status: 200, description: 'Key reset successfully' })
    @ApiResponse({ status: 400, description: 'Reset failed' })
    async resetKey(@Param('uuid') uuid: string) {
        const result = await this.qrService.updateKey(uuid, '');
        if (!result) {
            return { status: 400, message: 'Reset failed' };
        }
        return { status: 200, message: 'Key reset successfully' };
    }

    @Get('generate-key/:id')
    @ApiOperation({ summary: 'Generate key from ID' })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({ status: 200, description: 'Key generated' })
    async generateKey(@Param('id') id: number) {
        const key = this.qrService.genKey(id);
        return { status: 200, key };
    }
}