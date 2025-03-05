declare module 'midtrans-client' {
    export interface ClientOptions {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
        merchantId?: string;
        customOptions?: Record<string, unknown>;
    }

    export interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    export interface CustomerDetails {
        first_name: string;
        last_name?: string;
        email: string;
        phone?: string;
        billing_address?: Address;
        shipping_address?: Address;
    }

    export interface Address {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postal_code?: string;
        country_code?: string;
    }

    export interface ItemDetails {
        id: string;
        price: number;
        quantity: number;
        name: string;
        brand?: string;
        category?: string;
        merchant_name?: string;
        url?: string;
    }

    export interface CreditCardOptions {
        secure?: boolean;
        channel?: string;
        bank?: string;
        installment?: {
            required?: boolean;
            terms?: Record<string, number[]>;
        };
        whitelist_bins?: string[];
        [key: string]: unknown;
    }

    export interface VirtualAccountOptions {
        va_number?: string;
        sub_company_code?: string;
        free_text?: {
            inquiry?: unknown[];
            payment?: unknown[];
        };
        [key: string]: unknown;
    }

    export interface GopayOptions {
        enable_callback?: boolean;
        callback_url?: string;
        [key: string]: unknown;
    }

    export interface ShopeePayOptions {
        callback_url?: string;
        [key: string]: unknown;
    }

    export interface ExpiryOptions {
        start_time?: string;
        unit?: string;
        duration?: number;
    }

    export interface TransactionOptions {
        transaction_details: TransactionDetails;
        item_details?: ItemDetails[];
        customer_details?: CustomerDetails;
        credit_card?: CreditCardOptions;
        bca_va?: VirtualAccountOptions;
        permata_va?: VirtualAccountOptions;
        bni_va?: VirtualAccountOptions;
        bri_va?: VirtualAccountOptions;
        shopeepay?: ShopeePayOptions;
        gopay?: GopayOptions;
        callbacks?: Record<string, string>;
        expiry?: ExpiryOptions;
        custom_field1?: string;
        custom_field2?: string;
        custom_field3?: string;
        [key: string]: unknown;
    }

    export interface TransactionResponse {
        token: string;
        redirect_url: string;
        transaction_id?: string;
        order_id?: string;
        gross_amount?: string;
        payment_type?: string;
        transaction_time?: string;
        transaction_status?: string;
        fraud_status?: string;
        status_code?: string;
        status_message?: string;
        [key: string]: unknown;
    }

    export interface TransactionStatus {
        transaction_time: string;
        transaction_status: string;
        transaction_id: string;
        status_code: string;
        status_message: string;
        signature_key: string;
        payment_type: string;
        order_id: string;
        merchant_id: string;
        gross_amount: string;
        fraud_status: string;
        currency: string;
        approval_code?: string;
        masked_card?: string;
        card_type?: string;
        bank?: string;
        settlement_time?: string;
        [key: string]: unknown;
    }

    export interface CardTokenParameters {
        card_number: string;
        card_exp_month: string;
        card_exp_year: string;
        card_cvv: string;
        client_key: string;
    }

    export interface CaptureParameters {
        transaction_id: string;
        gross_amount: number;
    }

    export interface RefundParameters {
        amount?: number;
        reason?: string;
        refund_key?: string;
        [key: string]: unknown;
    }

    export interface BeneficiaryAccountParameters {
        name: string;
        account: string;
        bank: string;
        alias_name: string;
        email?: string;
        [key: string]: unknown;
    }

    export interface PayoutParameters {
        reference_no: string;
        beneficiary_name: string;
        beneficiary_account: string;
        beneficiary_bank: string;
        beneficiary_email?: string;
        amount: string;
        notes: string;
        [key: string]: unknown;
    }

    export class Snap {
        constructor(options: ClientOptions);
        createTransaction(parameter: TransactionOptions): Promise<TransactionResponse>;
        createTransactionToken(parameter: TransactionOptions): Promise<string>;
        createTransactionRedirectUrl(parameter: TransactionOptions): Promise<string>;
    }

    export class CoreApi {
        constructor(options: ClientOptions);
        charge(parameter: TransactionOptions): Promise<TransactionResponse>;
        capture(parameter: CaptureParameters): Promise<TransactionResponse>;
        cardToken(parameter: CardTokenParameters): Promise<TransactionResponse>;
        cardPointInquiry(tokenId: string): Promise<TransactionResponse>;
        transaction: {
            status(transactionId: string): Promise<TransactionStatus>;
            statusb2b(transactionId: string): Promise<TransactionStatus>;
            approve(transactionId: string): Promise<TransactionResponse>;
            deny(transactionId: string): Promise<TransactionResponse>;
            cancel(transactionId: string): Promise<TransactionResponse>;
            expire(transactionId: string): Promise<TransactionResponse>;
            refund(transactionId: string, parameter?: RefundParameters): Promise<TransactionResponse>;
            refundDirect(transactionId: string, parameter?: RefundParameters): Promise<TransactionResponse>;
            notification(notificationJson: Record<string, unknown>): Promise<TransactionStatus>;
        };
    }

    export interface IrisResponse {
        status: string;
        message: string;
        [key: string]: unknown;
    }

    export class Iris {
        constructor(options: ClientOptions);
        ping(): Promise<IrisResponse>;
        createBeneficiaryAccount(parameter: BeneficiaryAccountParameters): Promise<IrisResponse>;
        updateBeneficiaryAccount(aliasName: string, parameter: BeneficiaryAccountParameters): Promise<IrisResponse>;
        getBeneficiaryAccount(aliasName: string): Promise<IrisResponse>;
        getBeneficiaryAccounts(): Promise<IrisResponse>;
        createPayouts(parameter: PayoutParameters): Promise<IrisResponse>;
        approvePayouts(referenceNo: string): Promise<IrisResponse>;
        rejectPayouts(referenceNo: string): Promise<IrisResponse>;
        getPayoutDetails(referenceNo: string): Promise<IrisResponse>;
        getTransactionHistory(fromDate: string, toDate: string): Promise<IrisResponse>;
        getTopupChannels(): Promise<IrisResponse>;
        getAccount(): Promise<IrisResponse>;
        getBalance(): Promise<IrisResponse>;
        getFacilitatorAccount(): Promise<IrisResponse>;
        getFacilitatorBalance(): Promise<IrisResponse>;
        getBeneficiaryBanks(): Promise<IrisResponse>;
        validateBankAccount(bankAccountId: string): Promise<IrisResponse>;
    }

    export class MidtransError extends Error {
        constructor(message: string, httpStatusCode?: number, ApiResponse?: Record<string, unknown>, rawHttpClientData?: unknown);
        httpStatusCode: number;
        ApiResponse: Record<string, unknown>;
        rawHttpClientData: unknown;
    }

    export class SnapBiConfig {
        constructor(options: ClientOptions);
    }

    export class SnapBi {
        constructor(options: ClientOptions);
        createTransaction(parameter: TransactionOptions): Promise<TransactionResponse>;
    }
} 