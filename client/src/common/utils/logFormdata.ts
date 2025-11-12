import logger from "./logger";

const logFormData = (formData: FormData) => {
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      logger.log(
        { prefix: "FORM DATA" },
        key,
        value.name,
        value.size,
        value.type
      );
    } else {
      logger.log({ prefix: "FORM DATA" }, key, value);
    }
  }
};

export default logFormData;
