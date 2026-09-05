import type { ModuleRequest, ModuleResponse } from "./module.types.ts";
export const moduleService = async (
  data: ModuleRequest
): Promise<ModuleResponse> => {
  // Business logic goes here
  
  return {
    message: "Module service working",
    data,
  };
};