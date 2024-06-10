import {
  type InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import Head from "next/head";
import Layout from "~/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { fetchData } from "~/utils";
import type { ReturnType } from "./api/voyage/getAll";
import { Button } from "~/components/ui/button";
import { TABLE_DATE_FORMAT } from "~/constants";
import CreateVoyageForm from "~/components/form";
import { useToast } from "~/components/ui/use-toast";

export default function Home() {
  const { toast } = useToast();
  const { data: voyages } = useQuery<ReturnType>({
    queryKey: ["voyages"],

    queryFn: () => fetchData("voyage/getAll"),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
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
    },

    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete the voyage",
      });
    },
  });

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <CreateVoyageForm />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Port of loading</TableHead>
              <TableHead>Port of discharge</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>Unite types</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voyages?.map((voyage) => (
              <TableRow key={voyage.id}>
                <TableCell>
                  {format(
                    new Date(voyage.scheduledDeparture),
                    TABLE_DATE_FORMAT,
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}
                </TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger>{voyage.unitTypes.length}</PopoverTrigger>
                    <PopoverContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit Type</TableHead>
                            <TableHead>Default Length</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {voyage.unitTypes.map((unitType, index) => {
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {unitType.name}
                                </TableCell>
                                <TableCell>{unitType.defaultLength}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(voyage.id)}
                    variant="outline"
                  >
                    X
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
    </>
  );
}
