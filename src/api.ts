import axios from 'axios';
import { BASE_URL } from '@/config/constants';

const api = axios.create({
  baseURL: BASE_URL,
});

export type IDAndName = {
  id: number;
  name: string;
}

export type NameAndImage = {
  name: string;
  imageURL: string;
};

export type ComparePlayerRequestPayload = {
  player_left: number
  player_right: number
  all: boolean
  offensive: boolean
  defensive: boolean
  strenghts: boolean
  weaknesses: boolean
  other: boolean
  otherText: string
}

export type ComparePlayerResponsePayload = {
  player_left: number
  player_left_name: string
  player_right: number
  player_right_name: string
  comparison: string      
}

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
  // hier list emit finegrained reports 
  player_id: number;
  fine_grained_reports: string[];
  report_summary: string;
};

export const convertToPlayerList = async (data: PlayerAPIResponse[]) => {
  const players = await Promise.all(
    data.map(async (element) => {
      const { name, imageURL } = await fetchNameAndImage(element.player_id);

      return {
        id: element.player_id,
        img: imageURL,
        tmLink: `https://www.transfermarkt.de/spieler/profil/spieler/${element.player_id}`,
        summary: element.report_summary,
        fineGrainedReports: element.fine_grained_reports,
        name,
      };
    })
  );
  return players;
};

export const scoutPlayers = async (query: string, position: string, fineGrained: boolean) => {
  const response = await api.post('scout-prompt', { query, position, fineGrained });
  return convertToPlayerList(response.data.response.list);
};

// TODO Only have summary in frontend. But if we want user to see refernces, we can also get them here anyways and send them back.
export const sendReaction = async (query: string, playerID: number, summary: string, reaction: string) => {
  api.post('reaction', { query, playerID, summary, reaction });
};

//TODO suffix "/" korrekt?
export const getOriginaLReports = (playerID: number)=> {
  const path = 'original-reports/' + playerID
  const response = api.get<string[]>(path);
  return response
};

export const getAllPlayersWithNames = () => {
  const path = 'players-with-name'
  const response = api.get<IDAndName[]>(path);
  return response
};

export const comparePlayers = async (payload: ComparePlayerRequestPayload) => {
  const path = "compare-players"
  const response = await api.post(path, { ...payload });
  const payloadObject: ComparePlayerResponsePayload = {
    player_left: response.data.player_left,
    player_left_name: response.data.player_left_name,
    player_right: response.data.player_right,
    player_right_name: response.data.player_right_name,
    comparison: response.data.comparison
  }

  return payloadObject
}




