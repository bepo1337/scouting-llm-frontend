import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type OriginalReportsProps = {
    reports: string[];
    fineGrainedReport: string;
}

function getRandomDate(): string {
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2024-08-31');
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const randomTimestamp = Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
    return new Date(randomTimestamp).toDateString();
}


function getRandomNumberBetween1And6(): number {
    return Math.floor(Math.random() * 6) + 1;
}


function OriginalReports({ reports, fineGrainedReport }: OriginalReportsProps) {
    const team1Pic = `../../public/team${getRandomNumberBetween1And6()}.png`
    let opponentTeamFromHighlightedReportPic =""
    do {
        opponentTeamFromHighlightedReportPic = `../../public/team${getRandomNumberBetween1And6()}.png`
    } while (team1Pic === opponentTeamFromHighlightedReportPic)


    // returns the fine grained reports 
    const reportItems = reports
        .filter((report) => {
            return report != "" && report != fineGrainedReport
        })
        .map((report) => {
            
            let team2Pic =""
            do {
                team2Pic = `../../public/team${getRandomNumberBetween1And6()}.png`
            } while (team1Pic === team2Pic)

            return (
                <Card className="h-max">
                    <CardHeader>
                        <CardTitle className="text-lg" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            Report from {getRandomDate()}
                            {/* TODO make this stick to the top right of the report box */}
                            <img
                                src={team1Pic}
                                alt="team1pic"
                                style={{ height: '50px', marginLeft: '50px', marginRight: '5px', borderRadius: '5px' }}
                            />
                            vs
                            <img
                                 src={team2Pic}
                                alt="team2pic"
                                style={{ height: '50px', marginLeft: '5px', marginRight: '0px', borderRadius: '5px' }}
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{report}</p>
                    </CardContent>
                </Card>
            )
        })

    return (
        <>
            <h1 className='text-2xl font-medium mb-8'>{reports.length == 0 ? "Select a player to see original reports" : "Original reports"}</h1>
            <div className='mb-10 shadow-2xl'>
                {fineGrainedReport !== "" &&
                <div>                 
                <Card className="h-max">
                    <CardHeader>
                        <CardTitle className="text-lg" style={{ display: 'inline-flex', alignItems: 'center' }}>
                           Report found in fine grained search: {getRandomDate()}
                            {/* TODO make this stick to the top right of the report box */}
                            <img
                                src={team1Pic}
                                alt="team1pic"
                                style={{ height: '50px', marginLeft: '50px', marginRight: '5px', borderRadius: '5px' }}
                            />
                            vs
                            <img
                                 src={opponentTeamFromHighlightedReportPic}
                                alt="team3Pic"
                                style={{ height: '50px', marginLeft: '5px', marginRight: '0px', borderRadius: '5px' }}
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{fineGrainedReport}</p>
                    </CardContent>
                </Card>
                </div>
                }
            </div>
            <div className='flex flex-col space-y-4'>{reportItems}</div></>
    )
}

export default OriginalReports