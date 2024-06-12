import { useQuery } from "@tanstack/react-query";
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
import { useDeleteVoyage } from "~/hooks/useDeleteVoyage";

export default function Home() {
  const { data: voyages } = useQuery<ReturnType>({
    queryKey: ["voyages"],

    queryFn: () => fetchData("voyage/getAll"),
  });

  // Sort voyages by newest based on the creation date
  voyages?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const { deleteVoyage } = useDeleteVoyage();

  const handleDelete = (voyageId: string) => {
    deleteVoyage(voyageId);
  };

  const formatDate = (date: Date) => format(date, TABLE_DATE_FORMAT);

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
                <TableCell>{formatDate(voyage.scheduledDeparture)}</TableCell>
                <TableCell>{formatDate(voyage.scheduledArrival)}</TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger>{voyage.unitTypes?.length}</PopoverTrigger>
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
