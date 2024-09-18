"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "./ui/use-toast"
import { comparePlayers, getAllPlayersWithNames, ComparePlayerRequestPayload } from "@/api"
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { FormEventHandler, useEffect, useState } from "react"

interface LabelValue {
    value: string;
    label: string;
}

const FormSchema = z.object({
    player_left: z.string({
        required_error: "Please select a left player.",
    }),
    player_right: z.string({
        required_error: "Please select a right player.",
    }),
    all: z.boolean(),
    offensive: z.boolean(),
    defensive: z.boolean(),
    strenghts: z.boolean(),
    weaknesses: z.boolean(),
    other: z.string(),
})


export default function ComparePlayers() {
    //general
    const [isLoading, setIsLoading] = useState(false)

    // Searchbox
    const [items, setItems] = React.useState<LabelValue[]>([]);        // All items from the backend
    const [filteredItemsLeft, setFilteredItemsLeft] = useState<LabelValue[]>([]);  // Filtered items to display
    const [filteredItemsRight, setFilteredItemsRight] = useState<LabelValue[]>([]);  // Filtered items to display
    const [searchTermLeft, setSearchTermLeft] = useState<string>('');  // Search term entered by user
    const [searchTermRight, setSearchTermRight] = useState<string>('');  // Search term entered by user
    const [isDropdownOpenLeft, setIsDropdownOpenLeft] = useState<boolean>(false);  // Dropdown visibility
    const [isDropdownOpenRight, setIsDropdownOpenRight] = useState<boolean>(false);  // Dropdown visibility

    // switch states
    const [all, setAll] = React.useState(false)
    const [offensiveFilter, setOffensiveFilter] = React.useState(false)
    const [defensiveFilter, setDefensiveFilter] = React.useState(false)
    const [strenghtsFilter, setStrenghtsFilter] = React.useState(false)
    const [weaknessesFilter, setWeaknessesFilter] = React.useState(false)
    const [otherFilter, setOtherFilter] = React.useState(false)


    const toggleAllOtherFields = (checked: boolean): void => {
        const newAllToggleState = !all
        setAll(newAllToggleState);
        console.log("all toggled: ", newAllToggleState)
        form.setValue("offensive", checked)
        form.setValue("defensive", checked)
        form.setValue("strenghts", checked)
        form.setValue("weaknesses", checked)
    }

    const toggleOffensive = (): void => {
        setOffensiveFilter(!offensiveFilter);
    }


    const toggleDefensive = (): void => {
        setDefensiveFilter(!defensiveFilter);
    }

    const toggleStrengths = (): void => {
        setStrenghtsFilter(!strenghtsFilter);
    }


    const toggleWeaknesses = (): void => {
        setWeaknessesFilter(!weaknessesFilter);
    }


    const toggleOthers = (): void => {
        setOtherFilter(!otherFilter);
    }

    React.useEffect(() => {
        const fetchPlayerIdWithNames = async () => {
            const response = await getAllPlayersWithNames()
            const playersList = response.data
            const shortPlayers = playersList.slice(0, 100)

            const playerLabelValue = shortPlayers.map((player: { id: number; name: string }) => ({
                value: player.id.toString(),
                label: player.name,
            }));

            setItems(playerLabelValue);
            setFilteredItemsLeft(playerLabelValue);  // Initially, show all items
        }
        fetchPlayerIdWithNames()
    }, []) //need the empty array as second arguement, otherwise our backend endpoint will be called constantly

    // change list when typing differnt query
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const lowerCasedSearchTerm = searchTermLeft.toLowerCase();
            const filtered = items.filter((item) =>
                item.label.toLowerCase().includes(lowerCasedSearchTerm)
            );
            setFilteredItemsLeft(filtered);
        }, 300);  // we have a 300ms delay before the query-filter will apply

        return () => clearTimeout(timeoutId); 
    }, [searchTermLeft, items]);

        // change list when typing differnt query
        useEffect(() => {
            const timeoutId = setTimeout(() => {
                const lowerCasedSearchTerm = searchTermRight.toLowerCase();
                const filtered = items.filter((item) =>
                    item.label.toLowerCase().includes(lowerCasedSearchTerm)
                );
                setFilteredItemsRight(filtered);
            }, 300);  // we have a 300ms delay before the query-filter will apply
    
            return () => clearTimeout(timeoutId); 
        }, [searchTermRight, items]);

    const handleInputChangeLeft = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermLeft(e.target.value);
        setIsDropdownOpenLeft(true); 
    };

    const handleInputChangeRight = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermRight(e.target.value);
        setIsDropdownOpenRight(true); 
    };

    const handleItemSelectLeft = (item: LabelValue) => {
        console.log(item)
        setSearchTermLeft(item.label); 
        setIsDropdownOpenLeft(false);  
    };

    const handleItemSelectRight = (item: LabelValue) => {
        console.log(item)
        setSearchTermRight(item.label);
        setIsDropdownOpenRight(false); 
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            all: false,
            offensive: false,
            defensive: false,
            strenghts: false,
            weaknesses: false,
            other: "",
          },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        const payload: ComparePlayerRequestPayload = {
            player_left: Number(data.player_left), 
            player_right: Number(data.player_right),
            all: data.all,
            offensive: data.offensive,
            defensive: data.defensive,
            strenghts: data.strenghts,
            weaknesses: data.weaknesses,
            other: data.other
        };

        let comparison = await comparePlayers(payload)
        //TODO add state for the respone?
        console.log("RESPONSE IN COMPONENET:")
        // console.log(comparison)
        setIsLoading(false)
    }

    return (
        <div className="w-full flex items-center justify-center ">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col justify-center items-center">
                    <div className="flex flex-row space-x-4">
                        <FormField
                            control={form.control}
                            name="player_left"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Left Player</FormLabel>
                                    <div className="relative w-64">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            placeholder="Search..."
                                            value={searchTermLeft}
                                            onChange={(e) => {
                                                handleInputChangeLeft(e); // Update the local search term
                                                field.onChange(e.target.value); // Bind value to form field
                                            }}
                                            onFocus={() => setIsDropdownOpenLeft(true)}
                                        />

                                        {isDropdownOpenLeft && (
                                            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredItemsLeft.length > 0 ? (
                                                    filteredItemsLeft.map((item) => (
                                                        <div
                                                            key={item.value}
                                                            className="cursor-pointer p-2 hover:bg-gray-100"
                                                            onClick={() => {
                                                                handleItemSelectLeft(item);
                                                                field.onChange(item.value); // Set selected player value to the form field
                                                                setIsDropdownOpenLeft(false); // Close dropdown
                                                            }}
                                                        >
                                                            {item.label}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-gray-500">No player found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <FormDescription>
                                        The first player we will use for the comparison
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 border-r-2 border-l-2 pl-8 pr-8">
                            <h1 className="text-xl font-bold">Filters for comparison</h1>
                            <div className="space-y-4">
                                <FormField control={form.control}
                                    name="all"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleAllOtherFields(checked)
                                            }} id="all" />
                                            <Label htmlFor="all">All (complete/general comparison)</Label>
                                        </div>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="offensive"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleOffensive()
                                            }} id="offensive" />
                                            <Label htmlFor="offensive">Offensive Capabilities</Label>
                                        </div>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="defensive"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleDefensive()
                                            }} id="defensive" />
                                            <Label htmlFor="defensive">Defensive Capabilities</Label>
                                        </div>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="strenghts"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleStrengths()
                                            }} id="strenghts" />
                                            <Label htmlFor="strenghts">Strenghts</Label>
                                        </div>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="weaknesses"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleWeaknesses()
                                            }} id="weaknesses" />
                                            <Label htmlFor="weaknesses">Weaknesses</Label>
                                        </div>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="other"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                toggleOthers()
                                            }} id="other" />
                                            <Label htmlFor="other">Other Attributions</Label>
                                        </div>
                                    )}
                                />
                            </div>
                            <Textarea className="" placeholder="Define custom comparison filters (eg. leadership skills, attitude, ...) separated by ';'" />
                        </div>
                        <FormField
                            control={form.control}
                            name="player_right"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Right Player</FormLabel>
                                    <FormDescription>
                                        The second player we will use for the comparison
                                    </FormDescription>
                                    <FormMessage />
                                    <div className="relative w-64">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            placeholder="Search..."
                                            value={searchTermRight}
                                            onChange={(e) => {
                                                handleInputChangeRight(e); // Update the local search term
                                                field.onChange(e.target.value); // Bind value to form field
                                            }}
                                            onFocus={() => setIsDropdownOpenRight(true)}
                                        />

                                        {isDropdownOpenRight && (
                                            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredItemsRight.length > 0 ? (
                                                    filteredItemsRight.map((item) => (
                                                        <div
                                                            key={item.value}
                                                            className="cursor-pointer p-2 hover:bg-gray-100"
                                                            onClick={() => {
                                                                handleItemSelectRight(item);
                                                                field.onChange(item.value); 
                                                                setIsDropdownOpenRight(false);
                                                            }}
                                                        >
                                                            {item.label}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-gray-500">No player found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button className="w-40" type="submit">Compare</Button>
                </form>
            </Form>
        </div>

    )
}
