type Status = "APPROVED" | "OPEN";
type Payment =
  | "CREDIT"
  | "DEBIT"
  | "BANK_TRANSFER"
  | "PIX"
  | "TO_AGREE"
  | "OTHERS";

interface Order {
  id: string;
  status: Status;
  approvedAt?: string;
  code: string;

  //base infor
  name: string;
  client: Client;
  initialDate: string;

  projects: Project[];

  //projet material
  included?: string;
  excluded?: string;
  teamNotes?: strinf;

  //payment
  rawAmount: number;

  deliveryDays: number;
  paymentMethod: Payment;
  discountPercent: number;
  installmentCount: number;

  advanceAmount: number;
  advancePaymentMethod?: Payment;

  notes?: string;

  createdAt: string;
}
