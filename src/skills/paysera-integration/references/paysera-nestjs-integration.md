# PaySera NestJS Integration

Comprehensive NestJS patterns for integrating `@biggora/paysera` SDK.

## Module Setup

### Static Configuration

```typescript
import { PayseraModule } from '@biggora/paysera/nestjs';

@Module({
  imports: [
    PayseraModule.forRoot({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration with ConfigService (recommended)

```typescript
import { PayseraModule } from '@biggora/paysera/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PayseraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        clientId: config.getOrThrow('PAYSERA_CLIENT_ID'),
        clientSecret: config.getOrThrow('PAYSERA_CLIENT_SECRET'),
      }),
    }),
  ],
})
export class AppModule {}
```

### What the Module Provides

`PayseraModule` registers three providers:
- `PAYSERA_CLIENT` — `PayseraClient` instance (inject via `@InjectPayseraClient()`)
- `PayseraWebhookVerifier` — Injectable service for webhook parsing

---

## Raw Body Configuration

Webhook handling requires access to the raw request body. Enable it in `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  await app.listen(3000);
}
bootstrap();
```

Access raw body in controllers via `RawBodyRequest<Request>`:

```typescript
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

@Post('webhook')
async webhook(@Req() req: RawBodyRequest<Request>) {
  const rawBody = req.rawBody; // Buffer
}
```

---

## Service Layer

### Payments Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPayseraClient } from '@biggora/paysera/nestjs';
import type { PayseraClient, PayseraOrder, PayseraRefund } from '@biggora/paysera';

@Injectable()
export class PaymentsService {
  constructor(@InjectPayseraClient() private readonly paysera: PayseraClient) {}

  async createOrder(dto: CreateOrderDto): Promise<PayseraOrder> {
    return this.paysera.orders.create({
      amount: { amount: String(dto.amountInCents), currency: dto.currency },
      description: dto.description,
      order_id: dto.orderId,
      callback_url: `${process.env.APP_URL}/api/paysera/webhook`,
      success_redirect: `${process.env.APP_URL}/checkout/success?order=${dto.orderId}`,
      failure_redirect: `${process.env.APP_URL}/checkout/failure?order=${dto.orderId}`,
      cancel_redirect: `${process.env.APP_URL}/checkout/cancel?order=${dto.orderId}`,
    });
  }

  async getOrder(orderId: string): Promise<PayseraOrder> {
    return this.paysera.orders.read(orderId);
  }

  async capturePayment(paymentId: string, amount?: { amount: string; currency: string }) {
    return this.paysera.payments.capture(paymentId, amount ? { amount } : undefined);
  }

  async refundPayment(paymentId: string, amount: { amount: string; currency: string }, description: string): Promise<PayseraRefund> {
    return this.paysera.refunds.create({
      payment_id: paymentId,
      amount,
      description,
    });
  }
}
```

---

## Controller Layer

### Checkout Controller

```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  async createCheckout(@Body() dto: CreateOrderDto) {
    const order = await this.payments.createOrder(dto);
    return { checkout_url: order.checkout_url };
  }

  @Get('status/:orderId')
  async getStatus(@Param('orderId') orderId: string) {
    const order = await this.payments.getOrder(orderId);
    return { status: order.status };
  }
}
```

### Webhook Controller

```typescript
import { Controller, Post, Req } from '@nestjs/common';
import { PayseraWebhookVerifier } from '@biggora/paysera/nestjs';
import { InjectPayseraClient } from '@biggora/paysera/nestjs';
import type { PayseraClient } from '@biggora/paysera';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

@Controller('api/paysera')
export class PayseraWebhookController {
  constructor(
    private readonly verifier: PayseraWebhookVerifier,
    @InjectPayseraClient() private readonly paysera: PayseraClient,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const event = this.verifier.parse(req.rawBody ?? Buffer.alloc(0));

    // Verify order status via API (signature verification unavailable)
    const order = await this.paysera.orders.read(event.data.order_id);

    switch (order.status) {
      case 'paid':
        await this.ordersService.markAsPaid(order.id);
        break;
      case 'failed':
        await this.ordersService.markAsFailed(order.id);
        break;
      case 'canceled':
        await this.ordersService.markAsCanceled(order.id);
        break;
    }

    return { ok: true };
  }
}
```

### Admin Refund Controller

```typescript
@Controller('admin/refunds')
export class AdminRefundsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.payments.refundPayment(
      dto.paymentId,
      { amount: String(dto.amountInCents), currency: dto.currency },
      dto.description,
    );
  }
}
```

---

## Exception Filter for PayseraApiError

```typescript
import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PayseraApiError } from '@biggora/paysera';
import type { Response } from 'express';

@Catch(PayseraApiError)
export class PayseraExceptionFilter implements ExceptionFilter {
  catch(exception: PayseraApiError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: exception.code ?? 'paysera_error',
      message: exception.message,
    });
  }
}
```

Apply globally or per controller:

```typescript
// Global
app.useGlobalFilters(new PayseraExceptionFilter());

// Per controller
@UseFilters(PayseraExceptionFilter)
@Controller('checkout')
export class CheckoutController {}
```

---

## Testing

### Mocking PayseraClient in Unit Tests

```typescript
import { Test } from '@nestjs/testing';
import { PAYSERA_CLIENT } from '@biggora/paysera/nestjs';

const mockPayseraClient = {
  orders: {
    create: vi.fn(),
    read: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  payments: {
    list: vi.fn(),
    read: vi.fn(),
    capture: vi.fn(),
    cancel: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
    list: vi.fn(),
    read: vi.fn(),
    cancel: vi.fn(),
  },
  webhooks: {
    create: vi.fn(),
    list: vi.fn(),
    read: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const module = await Test.createTestingModule({
  providers: [
    PaymentsService,
    { provide: PAYSERA_CLIENT, useValue: mockPayseraClient },
  ],
}).compile();

const service = module.get(PaymentsService);
```

### Testing Order Creation

```typescript
it('should create order and return checkout URL', async () => {
  mockPayseraClient.orders.create.mockResolvedValue({
    id: 'ord_test123',
    status: 'created',
    checkout_url: 'https://pay.paysera.com/checkout/ord_test123',
  });

  const result = await service.createOrder({
    amountInCents: 2999,
    currency: 'EUR',
    description: 'Test order',
    orderId: 'ORDER-001',
  });

  expect(result.checkout_url).toBe('https://pay.paysera.com/checkout/ord_test123');
  expect(mockPayseraClient.orders.create).toHaveBeenCalledWith(
    expect.objectContaining({
      amount: { amount: '2999', currency: 'EUR' },
    }),
  );
});
```

### Testing Webhook Handler

```typescript
import { PayseraWebhookVerifier } from '@biggora/paysera/nestjs';

const module = await Test.createTestingModule({
  controllers: [PayseraWebhookController],
  providers: [
    { provide: PAYSERA_CLIENT, useValue: mockPayseraClient },
    PayseraWebhookVerifier,
    { provide: OrdersService, useValue: mockOrdersService },
  ],
}).compile();
```
