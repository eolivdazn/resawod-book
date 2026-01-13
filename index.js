import axios from "axios";
import fs from "fs";
import dayjs from "dayjs";

const config = JSON.parse(fs.readFileSync("./config.json"));

async function loginAndGetToken() {
  const url = "https://api.resasocial.com/user/login";
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,gl;q=0.8,pt;q=0.7,fr;q=0.6",
    "content-type": "application/json",
    "origin": "https://box.resawod.com",
    "priority": "u=1, i",
    "referer": "https://box.resawod.com/",
    "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36"
  };
  const body = {
    username: config.username,
    password: config.password
  };
  const response = await axios.post(url, body, { headers });
    let id_user = config.id_user;
    let id_application = config.id_application;
    return {
      token: response.data.jwt_token,
      id_user,
      id_application
    };
}

async function getSportUserToken(jwt_token, id_user, id_application) {
  const url = `https://api.resasocial.com/secure/user/getSportUserToken?id_user=${id_user}&id_application=${id_application}`;
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,gl;q=0.8,pt;q=0.7,fr;q=0.6",
    "authorization": `Bearer ${jwt_token}`,
    "origin": "https://box.resawod.com",
    "priority": "u=1, i",
    "referer": "https://box.resawod.com/",
    "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36"
  };
  const response = await axios.get(url, { headers });
  if (response.data && response.data.jwt_token) {
    return response.data.jwt_token;
  } else {
    throw new Error('Sport user token não encontrado na resposta');
  }
}

async function getActivities(tokenObj, date) {
  const url = "https://sport.nubapp.com/api/v4/activities/getActivitiesCalendar.php";
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,gl;q=0.8,pt;q=0.7,fr;q=0.6",
    "Authorization": `Bearer ${tokenObj.token}`,
    "content-type": "application/x-www-form-urlencoded",
    "nubapp-origin": "user_apps",
    "origin": "https://box.resawod.com",
    "priority": "u=1, i",
    "referer": "https://box.resawod.com/",
    "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36"
  };
  // date: string in format DD-MM-YYYY
  const params = new URLSearchParams();
  params.append("app_version", "5.12.03");
  params.append("id_application", tokenObj.id_application);
  params.append("start_timestamp", date);
  params.append("end_timestamp", date);
  params.append("id_user", tokenObj.id_user);
  // params.append("id_category_activity", config.id_category_activity);
  const response = await axios.post(url, params, { headers });
  return response.data;
}

async function bookActivity(tokenObj, id_activity_calendar) {
  const url = "https://sport.nubapp.com/api/v4/activities/bookActivityCalendar.php";
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,gl;q=0.8,pt;q=0.7,fr;q=0.6",
    "authorization": `Bearer ${tokenObj.token}`,
    "content-type": "application/x-www-form-urlencoded",
    "nubapp-origin": "user_apps",
    "origin": "https://mobileapps-resawod.nubapp.com",
    "priority": "u=1, i",
    "referer": "https://mobileapps-resawod.nubapp.com/",
    "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36"
  };
  const params = new URLSearchParams();
  params.append("app_version", "5.12.03");
  params.append("id_application", tokenObj.id_application);
  params.append("id_activity_calendar", id_activity_calendar);
  params.append("id_user", tokenObj.id_user);
  params.append("action_by", tokenObj.id_user);
  params.append("n_guests", "0");
  params.append("booked_on", "3");
  const response = await axios.post(url, params, { headers });
  return response.data;
}

async function main() {
  try {
    const loginObj = await loginAndGetToken();
    console.log("Login successful. JWT token received:");
    // Obter sport user token
    const sportUserToken = await getSportUserToken(loginObj.token, loginObj.id_user, loginObj.id_application);
    console.log("Sport user token recebido:", sportUserToken);
    // Calcula a data daqui a 6 dias
    const today = dayjs();
    const targetDate = today.add(6, 'day');
    const targetWeekday = targetDate.format('dddd').toLowerCase(); // e.g. 'sunday'
    const hour = config.days[targetWeekday];
    if (!hour) {
      console.log(`O dia alvo (${targetWeekday}, ${targetDate.format('YYYY-MM-DD')}) não tem horário configurado no config.json. Nada a fazer.`);
      return;
    }
    const targetDateStr = targetDate.format('DD-MM-YYYY');
    const dateTimeStr = targetDate.format('YYYY-MM-DD') + ' ' + hour + ':00';
    console.log(`Buscando atividades para ${targetWeekday} (${targetDateStr}) às ${hour}...`);
    // Monta objeto de token para getActivities
    const tokenObj = {
      token: sportUserToken,
      id_user: loginObj.id_user,
      id_application: loginObj.id_application
    };
    const activities = await getActivities(tokenObj, targetDateStr);
    const calendar = activities?.data?.activities_calendar || [];
    const matching = calendar.filter(a => {
      const activityTime = dayjs(a.start_timestamp).format('YYYY-MM-DD HH:mm:00');
      const dateTimeStrFixed = dayjs(dateTimeStr, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:00']).format('YYYY-MM-DD HH:mm:00');
      return activityTime === dateTimeStrFixed;
    });
    if (matching.length === 0) {
      console.log(`Nenhuma atividade encontrada para ${targetWeekday} (${dateTimeStr}).`);
    } else {
      console.log(`Atividades encontradas para ${targetWeekday} (${dateTimeStr}):`);
      console.log(JSON.stringify(matching, null, 2));
      // Marcar a primeira atividade encontrada
      const activity = matching[0];
      try {
        const bookingResult = await bookActivity(tokenObj, activity.id_activity_calendar);
        console.log("Resultado da marcação:", bookingResult);
      } catch (err) {
        console.error("Erro ao marcar atividade:", err.message);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
