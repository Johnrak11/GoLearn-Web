import api from "@/lib/axios";

export interface EarningRecord {
  id: string;
  enrollment_id: string;
  course_id: string;
  instructor_id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: "PENDING" | "REQUESTED" | "WITHDRAWN";
  created_at: string;
  enrollment: {
    user: {
      full_name: string;
      avatar_url?: string;
    };
  };
  course: {
    title: string;
  };
}

export interface EarningSummary {
  totalGross: number;
  platformFee: number;
  netAvailable: number;
  pendingWithdrawal: number;
  netWithdrawn: number;
  records: EarningRecord[];
}

export interface WithdrawalRequest {
  id: string;
  instructor_id: string;
  amount: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  note?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  admin_note?: string;
  requested_at: string;
  reviewed_at?: string;
  instructor?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const withdrawalApi = {
  // Teacher APIs
  getMyEarnings: async (): Promise<EarningSummary> => {
    const response = await api.get<{
      summary: EarningSummary;
      records: EarningRecord[];
    }>("/withdrawals/earnings");

    return {
      ...response.data.summary,
      records: response.data.records,
    };
  },

  requestWithdrawal: async (data: {
    amount?: number; // Backend schema doesn't strictly require amount if we just withdraw all, but let's see. Wait, withdrawalController doesn't take amount? It withdraws all available?
    // Actually looking at withdrawalService, the amount might be auto-calculated from all PENDING earnings.
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    note?: string;
  }): Promise<WithdrawalRequest> => {
    const response = await api.post<WithdrawalRequest>(
      "/withdrawals/request",
      data,
    );
    return response.data;
  },

  getMyWithdrawals: async (): Promise<WithdrawalRequest[]> => {
    const response = await api.get<WithdrawalRequest[]>("/withdrawals/my");
    return response.data;
  },

  // Admin APIs
  getAllWithdrawals: async (status?: string): Promise<WithdrawalRequest[]> => {
    const params = status ? { status } : {};
    const response = await api.get<WithdrawalRequest[]>("/withdrawals", {
      params,
    });
    return response.data;
  },

  reviewWithdrawal: async (
    id: string,
    data: { status: "APPROVED" | "REJECTED" | "PAID"; admin_note?: string },
  ): Promise<WithdrawalRequest> => {
    const response = await api.patch<WithdrawalRequest>(
      `/withdrawals/${id}`,
      data,
    );
    return response.data;
  },
};
