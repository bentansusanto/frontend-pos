import { useFormik } from "formik";
import { toast } from "sonner";

import { useCreateCustomerMutation } from "@/store/services/customer.service";
import { CustomerValues, customerSchema } from "./schema";

type UseCustomerFormOptions = {
  onSuccess?: (customer: any) => void;
};

const defaultValues: CustomerValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: ""
};

export const useCustomerForm = (options?: UseCustomerFormOptions) => {
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const formik = useFormik<CustomerValues>({
    initialValues: defaultValues,
    validate: (values) => {
      const result = customerSchema.safeParse(values);
      if (result.success) {
        return {};
      }
      return result.error.issues.reduce(
        (acc, issue) => {
          const field = issue.path[0];
          if (typeof field === "string" && !acc[field]) {
            acc[field] = issue.message;
          }
          return acc;
        },
        {} as Record<string, string>
      );
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await createCustomer(values).unwrap();
        toast.success("Customer created successfully");
        resetForm();
        options?.onSuccess?.(response?.data);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create customer");
      }
    }
  });

  return { formik, isLoading };
};
