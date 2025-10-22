import API from "@/services/api/api";
import { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

export const bootstrapService = {
  async getAppData(): Promise<BootstrapResponse> {
    const { data } = await API.get("/bootstrap/init");
    return data.payload || data;
  },
};
