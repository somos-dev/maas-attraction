import { useEffect, useState } from 'react';
import { getNotifications } from 'src/services/notificationService';
import { Notification } from 'src/@types/notifications';
import { GetNotificationOptions } from '@/@types';

export function useFetchNotifications(options?: GetNotificationOptions) {
  const [data, setData] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [time, setTime] = useState(new Date().getTime());
  const [cantFetch, setCantFetch] = useState(
    options && options?.hasOwnProperty('fetchAtStart') ? options?.fetchAtStart : true
  );

  const reFetch = () => {
    setTime(new Date().getTime());
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      const query = {
        ...(options?.limit && { limit: options.limit }),
        ...(options?.sort && { sort: options.sort }),
      };
      try {
        const result = await getNotifications(query);
        setData(result?.data?.data);
      } catch (error) {
        setData([]);
        setIsError(true);
      }

      setIsLoading(false);
    };

    if (cantFetch) {
      fetchData();
    } else {
      setCantFetch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return { data, isError, isLoading, reFetch };
}
