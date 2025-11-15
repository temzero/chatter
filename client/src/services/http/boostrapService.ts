import API from "@/services/api/api";
import { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

export const bootstrapService = {
  async fetchAppData(): Promise<BootstrapResponse> {
    const { data } = await API.get<ApiSuccessResponse<BootstrapResponse>>(
      "/bootstrap/init"
    );
    // console.log("[FETCH]", "BootstrapResponse-data", data);
    return data.payload || data;
  },
};
