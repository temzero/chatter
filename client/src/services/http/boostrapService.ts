import API from "@/services/api/api";
import { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

export const bootstrapService = {
  async fetchAppData(): Promise<BootstrapResponse | null> {
    try {
      const res = await API.get<ApiSuccessResponse<BootstrapResponse>>(
        "/bootstrap/init"
      );

      return res.data.payload || null;
    } catch (error) {
      console.error("Error fetching bootstrap data:", error);
      throw error;
    }
  },
};
