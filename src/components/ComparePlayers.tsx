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
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { FormEventHandler } from "react"

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
    other: z.boolean()
})


export default function ComparePlayers() {
    const [openLeft, setOpenLeft] = React.useState(false)
    const [open_right, setOpenRight] = React.useState(false)
    const [valueLeft, setValueLeft] = React.useState("")
    const [valueRight, setValueRight] = React.useState("")
    const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = React.useState<LabelValue[]>([])
    const [searchTerm, setSearchTerm] = React.useState('');

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
        form.setValue("other", checked)
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

    const filteredOptions = playerDataLabelAndValue.filter((player) =>
        player.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col justify-center items-center">
                    <div className="flex flex-row space-x-4">

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
                                                    ? playerDataLabelAndValue.find((player) => player.value === valueLeft)?.label
                                                    : "Select player..."}
                                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            {/* TODO https://github.com/shadcn-ui/ui/discussions/3332 muss man hier selber was mit filter implementieren mit dynamischen daten*/}
                                            {/* https://github.com/pacocoursey/cmdk */}
                                            <Command shouldFilter={false}>
                                                <CommandInput placeholder="Search player..." className="h-9" value={searchTerm} onValueChange={setSearchTerm} />
                                                <CommandList>
                                                    <CommandEmpty>No player found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredOptions.map((playerLeft) => (
                                                            <CommandItem
                                                                key={playerLeft.value}
                                                                value={playerLeft.label}
                                                                onSelect={(currentValue) => {
                                                                    setValueLeft(currentValue === valueLeft ? "" : currentValue)
                                                                    setOpenLeft(false)
                                                                }}
                                                            >
                                                                {playerLeft.label}
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        valueLeft === playerLeft.label ? "opacity-100" : "opacity-0"
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
                    </div>
                    <Button className="w-40" type="submit">Compare</Button>
                </form>
            </Form>
        </div>

    )
}
