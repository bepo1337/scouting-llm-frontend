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
import { getAllPlayersWithNames, IDAndName } from "@/api"

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
})


export default function ComparePlayers() {
    const [openLeft, setOpenLeft] = React.useState(false)
    const [open_right, setOpenRight] = React.useState(false)
    const [valueLeft, setValueLeft] = React.useState("")
    const [valueRight, setValueRight] = React.useState("")
    const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = React.useState<LabelValue[]>([])


    //TODO on load of component, get all player ids from backend form rdbms
    React.useEffect(() => {
        const fetchPlayerIdWithNames = async () => {
            const response = await getAllPlayersWithNames()
            const playersList = response.data
            const shortPlayers = playersList.slice(0, 100)

            const playerLabelValue = shortPlayers.map((player: { id: number; name: string }) => ({
                value: player.id.toString(),
                label: player.name,
            }));
    
            setPlayerDataLabelAndValue(playerLabelValue);
            
        }
        fetchPlayerIdWithNames()
    }, []) //need the empty array as second arguement, otherwise our backend endpoint will be called constantly


    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <div className="w-full flex items-center justify-center ">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="player_left"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Left Player</FormLabel>
                                <Popover open={openLeft} onOpenChange={setOpenLeft}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openLeft}
                                            className="w-[200px] justify-between"
                                        >
                                            {valueLeft
                                                ? playerDataLabelAndValue.find((framework) => framework.value === valueLeft)?.label
                                                : "Select player..."}
                                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                    {/* TODO https://github.com/shadcn-ui/ui/discussions/3332 muss man hier selber was mit filter implementieren mit dynamischen daten*/}
                                        <Command shouldFilter>
                                        <CommandInput placeholder="Search player..." className="h-9"/>
                                            <CommandList>
                                                <CommandEmpty>No player found.</CommandEmpty>
                                                <CommandGroup>
                                                    {playerDataLabelAndValue.map((framework) => (
                                                        <CommandItem
                                                            key={framework.value}
                                                            value={framework.value}
                                                            onSelect={(currentValue) => {
                                                                setValueLeft(currentValue === valueLeft ? "" : currentValue)
                                                                setOpenLeft(false)
                                                            }}
                                                        >
                                                            {framework.label}
                                                            <CheckIcon
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    valueLeft === framework.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    The first player we will use for the comparison
                                </FormDescription>
                                <FormMessage />
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="player_right"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Right Player</FormLabel>
                                <Popover open={open_right} onOpenChange={setOpenRight}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open_right}
                                            className="w-[200px] justify-between"
                                        >
                                            {valueRight
                                                ? playerDataLabelAndValue.find((framework) => framework.value === valueRight)?.label
                                                : "Select second player..."}
                                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command > 
                                            <CommandInput placeholder="Search player..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No player found.</CommandEmpty>
                                                <CommandGroup>
                                                    {playerDataLabelAndValue.map((framework) => (
                                                        <CommandItem
                                                            key={framework.value}
                                                            value={framework.value}
                                                            onSelect={(currentValue) => {
                                                                setValueRight(currentValue === valueRight ? "" : currentValue)
                                                                setOpenRight(false)
                                                            }}
                                                        >
                                                            {framework.label}
                                                            <CheckIcon
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    valueRight === framework.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    The second player we will use for the comparison
                                </FormDescription>
                                <FormMessage />
                            </FormItem>

                        )}
                    />
                    <Button type="submit">Compare</Button>
                </form>
            </Form>
        </div>

    )
}
