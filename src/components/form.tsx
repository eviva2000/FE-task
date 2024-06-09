import React, { useState, useEffect } from "react";
import { type UnitType } from "@prisma/client";

import { Button } from "~/components/ui/button";
import {
  useMutation,
  useQueryClient,
  type InvalidateQueryFilters,
} from "@tanstack/react-query";

import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "~/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { MultiSelect } from "~/components/multi-select";

import { useToast } from "~/components/ui/use-toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z
  .object({
    departure: z.string({
      required_error: "Please select a departure date.",
    }),
    arrival: z.string({
      required_error: "Please select an arival datet.",
    }),
    portOfLoading: z.string({
      required_error: "Please select a loading port.",
    }),
    portOfDischarge: z.string({
      required_error: "Please select a discharge port.",
    }),
    vessel: z.string({
      required_error: "Please select a vessel.",
    }),
    unitType: z.string({
      required_error: "Please select a vessel.",
    }),
    // unitTypes: z.array(z.string({ required_error: "Please select a vessel." })),
  })
  .refine(({ departure, arrival }) => departure < arrival, {
    message: "Arrival date must be after the departure date",
  });

function convertToISOString(dateString: string, timeString: string) {
  if (!dateString) {
    return;
  }
  const dateTimeString = `${dateString}T${timeString}`;

  const dateObject = new Date(dateTimeString);
  const isoString = dateObject.toISOString();
  return isoString;
}

const CreateVoyageForm = () => {
  const [vessels, setVessels] = useState<{ value: string; label: string }[]>(
    [],
  );

  const [unitTypes, setUnitTypes] = useState<string[]>([]);
  // const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([
  //   "20FL",
  // ]);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departure: "",
      arrival: "",
      portOfLoading: "",
      portOfDischarge: "",
      vessel: "",
      unitType: "",
    },
  });

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log(values);
      // Convert the dates to ISO strings
      const departureDate = convertToISOString(
        values.departure,
        "13:00:00.000Z",
      );
      const arrivalDate = convertToISOString(values.arrival, "07:00:00.000Z");

      const formData = {
        departure: departureDate,
        arrival: arrivalDate,
        portOfLoading: values.portOfLoading,
        portOfDischarge: values.portOfDischarge,
        vessel: values.vessel,
        unitTypes: [values.unitType],
      };

      const res = await fetch("/api/voyage/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      reset();
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Failed to create the voyage",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };
  const getVessels = async () => {
    try {
      const response = await fetch("/api/vessel/getAll");
      const data = await response.json();
      setVessels(data);
    } catch (e) {
      console.log(e);
    }
  };
  const getUnitTypes = async () => {
    try {
      const response = await fetch("/api/unitType/getAll");
      const data = await response.json();
      setUnitTypes(data.map((unitType: UnitType) => unitType.id));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    void getVessels();
    void getUnitTypes();
  }, []);

  return (
    <div className="flex w-full p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Create a Voyage</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="departure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="shadcn"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="arrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="shadcn"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="portOfLoading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port of loading</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Port of loading"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="portOfDischarge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port of discharge</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Port of discharge"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit types</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit type" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectGroup>
                            {unitTypes?.map((unitType) => {
                              return (
                                <SelectItem key={unitType} value={unitType}>
                                  {unitType}
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

                <SheetFooter>
                  {/* <SheetClose asChild> */}
                  <Button type="submit">Add voyage</Button>
                  {/* </SheetClose> */}
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

// <MultiSelect
// options={unitTypes}
// onValueChange={setSelectedUnitTypes}
// defaultValue={selectedUnitTypes}
// placeholder="Select frameworks"
// variant="inverted"
// animation={2}
// maxCount={3}
// />
