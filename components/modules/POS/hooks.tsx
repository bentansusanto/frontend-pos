import { useCreateOrderMutation } from "@/store/services/order.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { createOrderSchema, CreateOrderValues } from "./schema";

const setNestedError = (target: any, path: (string | number)[], message: string) => {
  let current = target;
  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = message;
      return;
    }

    if (current[key] === undefined) {
      current[key] = typeof path[index + 1] === "number" ? [] : {};
    }
    current = current[key];
  });
};

type UsePosOrderOptions = {
  onSuccess?: () => void;
  initialItems?: CreateOrderValues["items"];
};

export const usePosOrder = ({ onSuccess, initialItems }: UsePosOrderOptions = {}) => {
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const formik = useFormik<CreateOrderValues>({
    initialValues: {
      order_id: "",
      branch_id: "",
      user_id: "",
      customer_id: "",
      notes: "",
      items: initialItems && initialItems.length > 0 ? initialItems : []
    },
    validate: (values) => {
      const result = createOrderSchema.safeParse(values);
      if (result.success) return {};
      const errors: Record<string, any> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          setNestedError(errors, issue.path, issue.message);
        }
      });
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await createOrder(values).unwrap();
        toast.success("Order created successfully");
        onSuccess?.();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create order");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
