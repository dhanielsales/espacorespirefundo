export interface Plan {
  id: string; // UUID
  name: string;
  description: string | null;
  monthlyFee: number;
  isActive: number;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  monthlyFee: number;
  isActive?: number;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  monthlyFee?: number;
  isActive?: number;
}
