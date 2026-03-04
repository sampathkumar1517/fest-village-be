import { Test, TestingModule } from '@nestjs/testing';
import { PaymentDetailController } from './payment-detail.controller';
import { PaymentDetailService } from './payment-detail.service';

describe('PaymentDetailController', () => {
  let controller: PaymentDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentDetailController],
      providers: [PaymentDetailService],
    }).compile();

    controller = module.get<PaymentDetailController>(PaymentDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
