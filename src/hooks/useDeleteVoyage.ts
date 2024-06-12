import {
  type InvalidateQueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "~/components/ui/use-toast";

export const useDeleteVoyage = () => {
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { mutate: deleteVoyage } = useMutation({
    mutationFn: async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete the voyage");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);

      toast({
        title: "The voyage has been deleted succefully",
      });
    },

    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete the voyage",
      });
    },
  });

  return { deleteVoyage };
};
