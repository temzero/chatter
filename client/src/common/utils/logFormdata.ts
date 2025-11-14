const logFormData = (formData: FormData) => {
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log("FORM DATA", key, value.name, value.size, value.type);
    } else {
      console.log("FORM DATA", key, value);
    }
  }
};

export default logFormData;
