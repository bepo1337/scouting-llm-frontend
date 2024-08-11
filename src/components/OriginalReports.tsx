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
        <h3 className='font-bold'>{reports.length == 0 ? "Select a player to see original reports" : "Original reports"}</h3>
        {reportItems}</>
    )
}

export default OriginalReports