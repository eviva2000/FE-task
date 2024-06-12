import {
  useMutation,
  useQueryClient,
  type InvalidateQueryFilters,
} from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "../components/form";
import { useToast } from "~/components/ui/use-toast";

export const useCreateVoyage = () => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { mutate: createVoyage } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch("/api/voyage/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (res.status !== 201) {
        throw new Error("Failed to create the voyage");
      }
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters),
        toast({
          title: "Voyage created successfully",
        });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to create the voyage!!",
      });
    },
  });

  return { createVoyage };
};
