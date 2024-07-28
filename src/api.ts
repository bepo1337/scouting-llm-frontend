import axios from 'axios';
import { BASE_URL } from '@/config/constants';

const api = axios.create({
  baseURL: BASE_URL,
});

export type NameAndImage = {
  name: string;
  imageURL: string;
};

export const fetchNameAndImage = async (playerID: number): Promise<NameAndImage> => {
  try {
    const response = await fetch(`https://www.transfermarkt.de/api/get/appShortinfo/player?ids=${playerID}`);
    if (!response.ok) throw new Error('tm api response was not ok');

    const data = await response.json();
    const playerData = data.player[0];

    return {
      name: playerData.name,
      imageURL: playerData.image,
    };
  } catch (error) {
    console.error('Error fetching TM API data', error);
    return { name: 'unknown', imageURL: 'https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1' };
  }
};

export type PlayerAPIResponse = {
  player_id: number;
  report_summary: string;
};

export const convertToPlayerList = async (data: PlayerAPIResponse[]) => {
  const players = await Promise.all(
    data.map(async (element) => {
      const { name, imageURL } = await fetchNameAndImage(element.player_id);
      
      return {
        img: imageURL,
        tmLink: `https://www.transfermarkt.de/spieler/profil/spieler/${element.player_id}`,
        summary: element.report_summary,
        name,
      };
    })
  );
  return players;
};

export const scoutPlayers = async (query: string, position: string) => {
  console.log(position)
  const response = await api.post('scout-prompt', { query, position });
  return convertToPlayerList(response.data.response.list);
};
