import API from "@/services/api/api";
import { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

export const bootstrapService = {
  async fetchAppData(): Promise<BootstrapResponse> {
    const { data } = await API.get("/bootstrap/init");
    console.log('data', data.payload)
    return data.payload || data;
  },
};
