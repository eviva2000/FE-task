import React, { useState } from "react";
import { fetchData } from "~/utils";
import type { VesselsType } from "../pages/api/vessel/getAll";
import type { VesselsType as TypeOfUniteTypes } from "../pages/api/unitType/getAll";
import { useCreateVoyage } from "~/hooks/useCreateVoyage";
import { Button } from "~/components/ui/button";
import { useQuery } from "@tanstack/react-query";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
} from "~/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { MultiSelect } from "~/components/multi-select";
import { DateTimePickerField } from "~/components/ui/date-time-picker/date-time-picker";
import { useToast } from "~/components/ui/use-toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const formSchema = z
  .object({
    departure: z
      .date({
        required_error: "Please select a date and time",
      })
      .nullable(),
    arrival: z
      .date({
        required_error: "Please select a date and time",
      })
      .nullable(),
    portOfLoading: z.string().min(1, "Port of Loading is required"),
    portOfDischarge: z.string().min(1, "Port of Discharge is required"),
    vessel: z.string().min(1, "Vessel is required"),
  })
  .refine(
    ({ departure, arrival }) => {
      if (departure && arrival) {
        return departure < arrival;
      }
      // If either departure or arrival is null, return true to pass the validation
      return true;
    },
    {
      message: "Arrival date must be after the departure date",
      path: ["arrival"], // This is the path to the field that will be highlighted
    },
  );

export function convertToISOString(dateString: string, timeString: string) {
  if (!dateString) {
    return;
  }
  const dateTimeString = `${dateString}T${timeString}`;

  const dateObject = new Date(dateTimeString);
  const isoString = dateObject.toISOString();
  return isoString;
}

const CreateVoyageForm = () => {
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([
    "20FL",
  ]);
  const { toast } = useToast();

  // Fetch the vessels and unit types
  const { data: vessels } = useQuery<VesselsType>({
    queryKey: ["vessel"],

    queryFn: () => fetchData("vessel/getAll"),
  });
  const { data: unitTypes } = useQuery<TypeOfUniteTypes>({
    queryKey: ["unitType"],

    queryFn: () => fetchData("unitType/getAll"),
  });
  const multiSelectOptions = unitTypes?.map((unitType) => unitType.id) || [];

  const defaultFormValues = {
    departure: null,
    arrival: null,
    portOfLoading: "",
    portOfDischarge: "",
    vessel: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const { createVoyage } = useCreateVoyage();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedUnitTypes?.length >= 5) {
      // Convert the dates to ISO strings
      const departureDate = values.departure;
      const arrivalDate = values.arrival;

      if (!departureDate || !arrivalDate) {
        toast({
          variant: "destructive",
          title: "Invalid date format",
        });
        return;
      }

      const formData = {
        departure: departureDate,
        arrival: arrivalDate,
        portOfLoading: values.portOfLoading,
        portOfDischarge: values.portOfDischarge,
        vessel: values.vessel,
        unitTypes: selectedUnitTypes,
      };
      createVoyage(formData);
      form.reset(defaultFormValues);
      setSelectedUnitTypes([]);
    } else {
      toast({
        variant: "destructive",
        title: "Please select at least 5 unit types",
      });
    }
  };

  const createPortField = (
    name: "portOfDischarge" | "portOfLoading",
    label: string,
  ) => {
    const { watch } = form;
    const portOfLoading = watch("portOfLoading");
    const portOfDischarge = watch("portOfDischarge");

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    value="copenhagen"
                    disabled={
                      name === "portOfLoading"
                        ? portOfDischarge === "copenhagen"
                        : portOfLoading === "copenhagen"
                    }
                  >
                    Copenhagen
                  </SelectItem>
                  <SelectItem
                    value="oslo"
                    disabled={
                      name === "portOfLoading"
                        ? portOfDischarge === "oslo"
                        : portOfLoading === "oslo"
                    }
                  >
                    Oslo
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex w-full p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="mt-4" variant="default">
            Create a Voyage
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <DateTimePickerField
                  form={form}
                  name="departure"
                  title="Departure"
                />
                <DateTimePickerField
                  form={form}
                  name="arrival"
                  title="Arrival"
                />
                <div className="flex space-x-8">
                  {createPortField("portOfLoading", "Port of Loading")}
                  {createPortField("portOfDischarge", "Port of Discharge")}
                </div>
                <FormField
                  control={form.control}
                  name="vessel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vessel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vessel" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectGroup>
                            {vessels?.map((vessel) => {
                              return (
                                <SelectItem
                                  key={vessel.value}
                                  value={vessel.value}
                                >
                                  {vessel.label}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Unit types</FormLabel>
                  <MultiSelect
                    options={multiSelectOptions}
                    onValueChange={setSelectedUnitTypes}
                    defaultValue={selectedUnitTypes}
                    placeholder="Select unit types"
                    variant="inverted"
                    animation={2}
                    maxCount={3}
                  />
                </FormItem>
                <SheetFooter>
                  <Button type="submit">Add voyage</Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreateVoyageForm;
