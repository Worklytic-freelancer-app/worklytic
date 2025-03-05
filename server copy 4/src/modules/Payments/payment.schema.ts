import { z } from "zod";
import { ObjectId } from "mongodb";

export class Payment {
    constructor(data: Partial<Payments>) {
        Object.assign(this, data);
    }
}

// Definisikan enum untuk status pembayaran
export const PaymentStatusEnum = z.enum([
    "pending", 
    "success", 
    "failed", 
    "expired", 
    "refunded"
]);

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

const PaymentSchema = z.object({
    projectId: z.instanceof(ObjectId).or(z.string().transform(val => new ObjectId(val))),
    userId: z.instanceof(ObjectId).or(z.string().transform(val => new ObjectId(val))),
    amount: z.number(),
    currency: z.string().default("IDR"),
    status: PaymentStatusEnum,
    paymentMethod: z.string().optional(),
    redirect_url: z.string().optional(),
    transactionId: z.string(),
    orderId: z.string(),
    snapToken: z.string().optional(),
    paymentUrl: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
});

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    paidAt: z.date().optional(),
});

export const PaymentIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
});

export const CreatePaymentValidate = PaymentSchema;

export const PaymentsValidate = PaymentSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema);

export const UpdatePaymentValidate = PaymentSchema.partial();

export type CreatePayment = z.infer<typeof CreatePaymentValidate>;
export type Payments = z.infer<typeof PaymentsValidate>;
export type UpdatePayment = z.infer<typeof UpdatePaymentValidate>;
export type PaymentId = z.infer<typeof PaymentIdValidate>;