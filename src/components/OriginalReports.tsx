import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

type OriginalReportsProps = {
    reports: string[];
}


function OriginalReports({ reports }: OriginalReportsProps) {

    const reportItems = reports.map((report) => {
        return (
            <Card className="h-max">
                <CardHeader> <CardTitle>Report from 11.08.2024 at game Frankfurt vs Valencia</CardTitle></CardHeader>
                <CardContent>
                    <p>{report}</p>
                </CardContent>
            </Card>
        )
    })

    return (
        <>
            <h1 className='font-bold text-3xl mb-8'>{reports.length == 0 ? "Select a player to see original reports" : "Original reports"}</h1>
            <div className='flex flex-col space-y-4'>{reportItems}</div></>
    )
}

export default OriginalReports