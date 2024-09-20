import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

type props = {
    text: string | any
}

export default function ComparePlayersTextArea({ text }: props) {
    let jsonData: { [key: string]: string } = {};

    try {
        jsonData = JSON.parse(text);
    } catch (error) {
        return <p>Invalid JSON from LLM</p>
    }

    return (
        <div className="flex flex-col space-y-4">
            {Object.entries(jsonData).map(([key, value]) => (
                <Card key={key} className="p-2 shadow-lg border rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{key[0].toUpperCase() + key.substr(1).toLowerCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            {value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

    );
};

