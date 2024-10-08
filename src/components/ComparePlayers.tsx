"use client"

import * as React from "react"

import { ComparePlayerRequestPayload, ComparePlayerResponsePayload, comparePlayers, getAllPlayersWithNames } from "@/api"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerCompareProfile from "./PlayerCompareProfile"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Label } from "./ui/label"
import { Skeleton } from "./ui/skeleton"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import ComparePlayersTextArea from "./ComparePlayersTextArea"
import AsyncSelect from "react-select/async"

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
    other: z.boolean(),
    otherText: z.string(),
})


export default function ComparePlayers() {
    //general
    const [isLoading, setIsLoading] = useState(false)
    const [showForm, setShowForm] = useState(true)
    const [showResult, setShowResult] = useState(false)
    const [comparisonResponse, setComparisonResponse] = useState<ComparePlayerResponsePayload>()

    //select box
    const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = useState<LabelValue[]>([]);
    const [selectedPlayerLeft, setSelectedPlayerLeft] = useState<LabelValue | null>(null);
    const [selectedPlayerRight, setSelectedPlayerRight] = useState<LabelValue | null>(null);


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

    // fetch player names and their ids when initially loading the component
    React.useEffect(() => {
        const fetchPlayerIdWithNames = async () => {
            const response = await getAllPlayersWithNames()
            const playersList = response.data

            const playerLabelValue = playersList.map((player: { id: number; name: string }) => ({
                value: player.id.toString(),
                label: player.name,
            }));

            setPlayerDataLabelAndValue(playerLabelValue);
        }
        fetchPlayerIdWithNames()
    }, []) //need the empty array as second arguement, otherwise our backend endpoint will be called constantly


    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            all: false,
            offensive: false,
            defensive: false,
            strenghts: false,
            weaknesses: false,
            other: false,
            otherText: "",
        },
    })

    // Submits the data 
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        setShowForm(false)
        const payload: ComparePlayerRequestPayload = {
            player_left: Number(data.player_left),
            player_right: Number(data.player_right),
            all: data.all,
            offensive: data.offensive,
            defensive: data.defensive,
            strenghts: data.strenghts,
            weaknesses: data.weaknesses,
            other: data.other,
            otherText: data.otherText
        };

        let comparison = await comparePlayers(payload)

        setComparisonResponse(comparison)
        setIsLoading(false)
        setShowResult(true)
    }

    const loadOptions = (inputValue: string, callback: (arg0: LabelValue[]) => void) => {
        // Filter the player list based on the inputValue (search term)
        const filteredPlayers = playerDataLabelAndValue.filter(player =>
            player.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        const limitedPlayers = filteredPlayers.slice(0, 50);

        callback(limitedPlayers);
    };

    return (
        <div>
            {!showResult && <div className="w-full flex items-center justify-center ">
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
                                            <AsyncSelect
                                                cacheOptions
                                                loadOptions={loadOptions}
                                                defaultOptions={playerDataLabelAndValue.slice(0, 50)}
                                                value={selectedPlayerLeft}
                                                onChange={(selectedOption) => {
                                                    setSelectedPlayerLeft(selectedOption);
                                                    field.onChange(selectedOption?.value)
                                                }}
                                                placeholder="Search player..."
                                                isClearable
                                                className="w-full"
                                            />
                                        </div>
                                        <FormDescription>
                                            The first player we will use for the comparison
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            {showForm &&
                                <div className="space-y-4 border-r-2 border-l-2 pl-8 pr-8">
                                    <h1 className="text-2xl font-medium">Filters for comparison</h1>
                                    <div className="space-y-4">
                                        <FormField control={form.control}
                                            name="all"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Switch checked={field.value} onCheckedChange={(checked: boolean) => {
                                                        field.onChange(checked);
                                                        toggleAllOtherFields(checked)
                                                    }} id="all" />
                                                    <Label htmlFor="all">All (complete comparison)</Label>
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
                                    <FormField
                                        control={form.control}
                                        name="otherText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">Other attributions</FormLabel>
                                                <FormControl>
                                                    <Textarea className="h-64" placeholder="Player search prompt (separated by ';')..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            }
                            <FormField
                                control={form.control}
                                name="player_right"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Right Player</FormLabel>
                                        <FormMessage />
                                        <div className="relative w-64">
                                            <AsyncSelect
                                                cacheOptions
                                                loadOptions={loadOptions}
                                                defaultOptions={playerDataLabelAndValue.slice(0, 50)}
                                                value={selectedPlayerRight}
                                                onChange={(selectedOption) => {
                                                    setSelectedPlayerRight(selectedOption);
                                                    field.onChange(selectedOption?.value)
                                                }}
                                                placeholder="Search player..."
                                                isClearable
                                                className="w-full"
                                            />
                                        </div>
                                        <FormDescription>
                                            The second player we will use for the comparison
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {!isLoading && <Button className="w-min" type="submit" >Compare</Button>}
                        {isLoading &&
                            <>
                                <div className="flex flex-col space-y-3">
                                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                                <Button className="w-min" type="button" disabled>
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </Button>
                            </>
                        }
                    </form>
                </Form>
            </div>}
            {showResult && <div className="flex justify-center gap-x-4">
                <div className="w-1/3 min-w-52 p-2 text-center flex justify-end h-fit sticky top-0">
                    <PlayerCompareProfile id={comparisonResponse?.player_left} name={comparisonResponse?.player_left_name}></PlayerCompareProfile>
                </div>

                <div className="w-1/3 p-2 text-center">
                    <ComparePlayersTextArea text={comparisonResponse?.comparison}></ComparePlayersTextArea>
                </div>
                <div className="w-1/3 min-w-52 p-2 text-center h-fit sticky top-0">
                    <PlayerCompareProfile id={comparisonResponse?.player_right} name={comparisonResponse?.player_right_name}></PlayerCompareProfile>
                </div>
            </div>}
        </div>
    )
}
