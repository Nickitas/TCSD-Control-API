import { Test, TestingModule } from '@nestjs/testing';
import { QrController } from './qr.controller';

describe('QrController', () => {
  let controller: QrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrController],
    }).compile();

    controller = module.get<QrController>(QrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
