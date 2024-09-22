import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from './ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Textarea } from './ui/textarea'

export default function Chat() {
    const dummyAnswers = ["Luka Jović and Hugo Ekitike are both center-forwards known for their finishing and positioning. Jović, more experienced, excels in link-up play and is a traditional number 9, while Ekitike, younger and with higher potential, offers versatility with his dribbling and ability to play wider roles. Jović's strengths lie in his reliability and experience, whereas Ekitike's appeal is his dynamic play and significant growth potential.",
     "Luka Jović and André Silva are both experienced center-forwards with strong finishing and positioning skills. Jović excels in link-up play and is a traditional number 9, relying heavily on his positioning and finishing. André Silva, while also a clinical finisher, offers more versatility with better dribbling and ability to contribute to build-up play. Jović is known for his reliability and physical presence, whereas Silva adds a dynamic element with his technical skills and adaptability in various attacking roles.",
    "Luka Jović is often seen as a talented yet inconsistent striker, struggling to fully realize his potential at top clubs. André Silva is viewed as a hardworking and dependable forward, earning respect for his consistent goal-scoring and adaptability across different leagues."]

    const [counter, setCounter] = useState(0)
    const [myPrompts, setMyPrompts] = useState<string[]>([])


    const formSchema = z.object({
        prompt: z.string().min(2).max(1000)
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setMyPrompts([...myPrompts, values.prompt])
        setCounter(counter + 1)
        form.reset()
    }

    return (
        <div className='flex flex-col gap-y-4'>
            <div className='flex flex-col gap-y-2'>
                {myPrompts.map((_, index) => (
                    <div className='flex flex-col gap-y-2' key={index}>
                        <Card className='flex justify-end'>
                            <CardHeader>
                            <CardTitle className='flex text-sm items-center gap-2'>
                                <img className="h-6 rounded-full" src="data:image/png;base64,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" />
                                    Agent:</CardTitle>
                                <CardDescription>{myPrompts[index]}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className='flex justify-start'>
                        <CardHeader>
                                <CardTitle className='flex text-sm items-center gap-2'>
                                <img className="h-6 rounded-full" src="https://upload.wikimedia.org/wikipedia/commons/9/98/UHH_Universit%C3%A4t_Hamburg_Logo.svg" />
                                    Scouting4LLM:
                                    </CardTitle>
                                <CardDescription>{dummyAnswers[index]}</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                ))}
            </div>
            <div className=''>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-4 items-center">
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem className='grow'>
                                    <FormControl>
                                        <Textarea placeholder="Send a message to Scouting4LLM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <Button type="submit">Send message</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
