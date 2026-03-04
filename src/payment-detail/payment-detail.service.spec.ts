import { Test, TestingModule } from '@nestjs/testing';
import { PaymentDetailService } from './payment-detail.service';

describe('PaymentDetailService', () => {
  let service: PaymentDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentDetailService],
    }).compile();

    service = module.get<PaymentDetailService>(PaymentDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
