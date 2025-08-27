import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
//LANGUAGE
import useLocales from 'src/hooks/useLocales';
import { WEATHER_API_KEY, WEATHER_CITY } from 'src/config';
import axios from 'axios';
import { OpenWeatherMapResponse } from 'src/@types/weather';

function Weather() {
  const theme = useTheme();
  const { translate } = useLocales();
  const [data, setData] = useState<OpenWeatherMapResponse | null>(null);
  //const city = 'Pagani';

  // function get weather data
  const getTempData = async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&units=metric&appid=${WEATHER_API_KEY}`;
      // const url = `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&units=metric&appid=afd218192c5a4a5f856d0e3db9876049}`;
      const response = await axios.get(url);
      setData(response.data);
    } catch (e) {
      console.log('error in get data weather', e);
      setData(null);
    }
  };

  useEffect(() => {
    getTempData();
  }, []);

  const getDescription = () => {
    if (data?.weather && data?.weather?.length > 0) {
      return data?.weather[0]?.description.split(' ')[0];
    }
    return '';
  };

  return (
    <Card
      style={{
        minHeight: '100%',
        padding: 15,
        paddingBottom: 15,
        paddingTop: 20,
        backgroundColor: theme.palette.background.neutral,
        alignItems: 'space-around',
        justifyContent: 'space-around',
        display: 'flex',
        flexDirection: 'column',
      }}
      component="div"
    >
      <Box style={{ display: 'flex', flexDirection: 'row' }}>
        <img
          src={data ? `https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@2x.png` : ''}
          alt={'Weather icon'}
          style={{
            width: 100,
            height: 100,
            marginRight: 5,
            marginLeft: 5,
            filter: `drop-shadow(3px 3px 6px ${theme.palette.grey[500]})`,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              icon="mdi:map-marker"
              color={theme.palette.grey[600]}
              style={{ marginRight: 5, marginLeft: -2, width: 18, height: 18 }}
            />
            <Typography noWrap>{WEATHER_CITY ? WEATHER_CITY + ' (SA)' : ''}</Typography>
          </Box>
          <Typography variant="h3" noWrap>
            {data?.main?.temp || '-'} °C
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography sx={{ marginRight: 1 }} noWrap>
              {translate('humidity')}:
            </Typography>
            <Typography variant="h6" noWrap>
              {data?.main?.humidity || '-'}%
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[300],
          padding: 0.6,
          borderRadius: 1,
          mt: 1,
          ml: '5%',
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }} noWrap>
          {translate(getDescription())}
        </Typography>
        <Typography variant="caption" textAlign={'center'} noWrap>
          min: {data?.main?.temp_min}°C - max: {data?.main?.temp_max}°C
        </Typography>
      </Box>
    </Card>
  );
}

export default Weather;
