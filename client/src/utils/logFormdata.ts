const logFormData = (formData: FormData) => {
  console.log('FormData contents:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(key, value.name, value.size, value.type);
    } else {
      console.log(key, value);
    }
  }
};

export default logFormData;
