import { fetchNameAndImage } from '@/api'
import React from 'react'

type ProfileProps = {
    id: number | any
    name: string | any
}

function getRandomBirthday(): string {
    const startDate = new Date(1990, 0, 1); 
    const endDate = new Date(2006, 11, 31); 
  
    const randomDate = new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
  
    const day = String(randomDate.getDate()).padStart(2, "0");
    const month = String(randomDate.getMonth() + 1).padStart(2, "0");
    const year = randomDate.getFullYear();
  
    return `${day}.${month}.${year}`;
  }

  function getRandomCountry(): string {
    const countries = [
      "United States",
      "Canada",
      "Brazil",
      "Germany",
      "France",
      "Italy",
      "United Kingdom",
      "Australia",
      "Japan",
      "China",
      "India",
      "Mexico",
      "Russia",
      "South Africa",
      "Argentina",
      "Nigeria",
      "Egypt",
      "Turkey",
      "Spain",
      "Sweden",
    ];
  
    const randomIndex = Math.floor(Math.random() * countries.length);
  
    return countries[randomIndex];
  }

  function getRandomSoccerClub(): string {
    const clubs = [
      "Los Angeles FC",
      "Seattle Sounders FC",
      "Atlanta United",
      "New York City FC",
      "Inter Miami CF",
      "Toronto FC",
      "Portland Timbers",
      "Orlando City SC",
      "Philadelphia Union",
      "Columbus Crew",
      
      "Boca Juniors",
      "River Plate",
      "Santos",
      "São Paulo",
      "Flamengo",
      "Palmeiras",
      "Corinthians",
      "Grêmio",
      "Club América",
      "Cruz Azul",
      "Club Nacional de Football",
      "Peñarol",
      "Independiente",
      "Racing Club",
      "Atlético Mineiro",
      "Vélez Sarsfield",
    ];
  
    const randomIndex = Math.floor(Math.random() * clubs.length);
  
    return clubs[randomIndex];
  }

  function getRandomHeight(): string {
    const minHeight = 1.75;
    const maxHeight = 2.02;
    const randomHeight = (Math.random() * (maxHeight - minHeight) + minHeight).toFixed(2);
  
    return `${randomHeight} m`;
  }

  function getRandomMarketValue(): string {
    const minValue = 1.00;
    const maxValue = 85.00;
    const randomValue = (Math.random() * (maxValue - minValue) + minValue).toFixed(2);
  
    return `${randomValue}m`;
  }

  function getRandomNumberBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

export default function PlayerCompareProfile({ id, name }: ProfileProps) {
    const [playerImage, setPlayerImage] = React.useState("")


    React.useEffect(() => {
        const fetchPlayerIdWithNames = async () => {
            const response = await fetchNameAndImage(id)
            console.log(response.imageURL)
            setPlayerImage(response.imageURL)
        }
        fetchPlayerIdWithNames()
    }, [])

    return (
        <div className="w-full max-w-xs bg-white shadow-md rounded-lg p-6 text-left">
            <img
                className="mx-auto rounded-full w-32 aspect-square object-cover mb-4"
                src={playerImage}
                alt={`${name} image`}
            />
            <h2 className="text-xl font-bold text-center pb-2">{name}</h2>
            <p className="text-gray-600">DOB: <span className="font-bold">{getRandomBirthday()}</span></p>
            <p className="text-gray-600">Club: <span className="font-bold">{getRandomSoccerClub()}</span></p>
            <p className="text-gray-600">Height: <span className="font-bold">{getRandomHeight()}</span></p>
            <p className="text-gray-600">Market value: <span className="font-bold">€{getRandomMarketValue()}📈</span></p>

            <div className="mt-4">
                <p className="font-bold">Current Stats:</p>
                <p className="text-gray-600">Goals: <span className="font-bold">{getRandomNumberBetween(0, 29)}⚽</span></p>
                <p className="text-gray-600">Minutes played: <span className="font-bold">{getRandomNumberBetween(70, 1600)}⏱️</span></p>
                <p className="text-gray-600">Passing accuracy: <span className="font-bold">{getRandomNumberBetween(25, 98)}%</span></p>
                <p className="text-gray-600">Tackles won: <span className="font-bold">{getRandomNumberBetween(40, 70)}%</span></p>
            </div>
        </div>
    );

}
